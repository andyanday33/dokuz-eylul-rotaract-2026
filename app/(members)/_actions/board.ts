"use server";

import { revalidatePath } from "next/cache";
import { requireBoard } from "@/lib/auth/dal";
import { isEventType } from "@/lib/members/event-types";
import { siteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

export type FormState = { status: "idle" | "ok" | "error"; message?: string };

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Board-only mutations.
 *
 * These use the service-role client, which bypasses row level security
 * entirely — `authenticated` is deliberately never granted the privileges
 * they need, so there is no policy underneath to catch a mistake here. That
 * makes `requireBoard()` on the first line of each one load-bearing rather
 * than a convenience, and it is why nothing in this file takes an actor id
 * from its form.
 */

/**
 * Türkiye has been on UTC+3 the whole year since 2016, so a wall-clock time
 * typed by the board can be pinned to that offset outright. Without this the
 * server would read `19:00` in its own zone — UTC on Vercel — and every
 * meeting would land three hours late.
 */
const ISTANBUL = "+03:00";

/**
 * A pasted map link, normalised — or a message saying why it is not one.
 *
 * This value ends up in an `href` on every member's screen, so the scheme is
 * checked rather than trusted: `javascript:` typed into that box would
 * otherwise run for everyone who opened the page. A missing scheme is the
 * ordinary case, since people copy `maps.app.goo.gl/…` without one, so that is
 * repaired rather than rejected — and a string that is already some other
 * scheme cannot survive having `https://` put in front of it.
 */
const mapLink = (raw: string): { url: string | null } | { error: string } => {
  if (!raw) return { url: null };

  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
      return { error: "Harita bağlantısı geçerli bir adres değil." };
    return { url: parsed.toString() };
  } catch {
    return { error: "Harita bağlantısı geçerli bir adres değil." };
  }
};

export async function inviteMember(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireBoard();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = formData.get("role") === "board" ? "board" : "member";

  if (!LOOKS_LIKE_EMAIL.test(email))
    return { status: "error", message: "Geçerli bir e-posta adresi gir." };
  if (fullName.length < 2)
    return { status: "error", message: "Ad soyad gerekli." };

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm`,
  });
  if (error || !data.user)
    return {
      status: "error",
      message: error?.message ?? "Davet gönderilemedi.",
    };

  const { error: rowError } = await admin
    .from("members")
    .insert({ id: data.user.id, full_name: fullName, email, role });

  if (rowError) {
    // An auth user with no members row can sign in and see nothing, which
    // looks like a bug to whoever was invited. Undo rather than leave that.
    await admin.auth.admin.deleteUser(data.user.id);
    return { status: "error", message: rowError.message };
  }

  revalidatePath("/uye/rehber");
  revalidatePath("/uye/yonetim");
  return { status: "ok", message: `${fullName} davet edildi.` };
}

export async function createAnnouncement(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const board = await requireBoard();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publish = formData.get("publish") === "on";

  if (!title || !body)
    return { status: "error", message: "Başlık ve metin gerekli." };

  const { error } = await createAdminClient()
    .from("announcements")
    .insert({
      title,
      body,
      author_id: board.id,
      published_at: publish ? new Date().toISOString() : null,
    });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/uye/duyurular");
  revalidatePath("/uye");
  return {
    status: "ok",
    message: publish ? "Duyuru yayınlandı." : "Taslak kaydedildi.",
  };
}

export async function createEvent(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const board = await requireBoard();

  const title = String(formData.get("title") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const map = mapLink(String(formData.get("map_url") ?? "").trim());

  if (!title || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startsAt))
    return { status: "error", message: "Başlık ve tarih gerekli." };

  // The select only offers valid values, so reaching this means the form was
  // not the sender. Checked here rather than left to `events_type_check`,
  // which would answer with a Postgres constraint name.
  if (!isEventType(type))
    return { status: "error", message: "Etkinlik türü geçersiz." };

  if ("error" in map) return { status: "error", message: map.error };

  const { error } = await createAdminClient()
    .from("events")
    .insert({
      title,
      type,
      // Browsers may or may not append seconds; normalise either way.
      starts_at: `${startsAt.slice(0, 16)}:00${ISTANBUL}`,
      location: location || null,
      map_url: map.url,
      description: description || null,
      created_by: board.id,
    });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/uye/etkinlikler");
  revalidatePath("/uye");
  return { status: "ok", message: "Etkinlik eklendi." };
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Removals.
 *
 * Nothing is soft-deleted. An announcement withdrawn by the board should leave
 * no trace for members to find, and an event entered by mistake is not history
 * worth keeping. Deleting an event takes its attendance rows with it, through
 * the `on delete cascade` in 0001 — which is why the dialog says so before
 * anyone presses the button.
 *
 * The id is checked against a UUID shape before it reaches the query. Postgres
 * would reject a malformed one anyway, but with a type error carrying the
 * column name, and that is not an answer to show anybody.
 */
export async function deleteAnnouncement(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireBoard();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { status: "error", message: "Duyuru bulunamadı." };

  const { error } = await createAdminClient()
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/uye/duyurular");
  revalidatePath("/uye");
  return { status: "ok" };
}

export async function deleteEvent(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireBoard();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id))
    return { status: "error", message: "Etkinlik bulunamadı." };

  const { error } = await createAdminClient()
    .from("events")
    .delete()
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/uye/etkinlikler");
  revalidatePath("/uye");
  return { status: "ok" };
}

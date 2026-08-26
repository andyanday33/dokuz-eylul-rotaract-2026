"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

export type VerifyState = { status: "idle" | "error"; message?: string };

/** Enough to catch a typo; the real check is whether the email arrives. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step one: send a six-digit code.
 *
 * The same `signInWithOtp` call that used to send a magic link — Supabase
 * decides which one it is from the Magic Link email template, not from here.
 * A template carrying `{{ .Token }}` sends the code this flow expects; one
 * carrying a link sends a link nothing is left to receive. If sign-in starts
 * failing everywhere at once, that template is the first thing to look at.
 *
 * No `emailRedirectTo`: nothing is being redirected to any more. The code is
 * typed into the page that asked for it.
 */
export async function requestCode(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!LOOKS_LIKE_EMAIL.test(email)) {
    return { status: "error", message: "Geçerli bir e-posta adresi gir." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // The board issues accounts. Without this, anyone who can reach this
      // form could create one for themselves.
      shouldCreateUser: false,
    },
  });

  // Worth surfacing: it is the one failure the visitor can do something about,
  // and it says nothing about who is or is not in the club. Deliberately vague
  // about how long — this is one message for two very different limits. The
  // same-address throttle clears in a minute; the project-wide email cap can
  // take an hour, and on the built-in mail service it is only two an hour.
  if (error?.status === 429) {
    return {
      status: "error",
      message: "Çok sık denendi. Biraz bekleyip tekrar dene.",
    };
  }

  // Otherwise the same answer either way, on purpose. Telling an unknown
  // address that it is unknown turns this form into a way of asking who is in
  // the club, which is exactly the thing the members area exists to keep in.
  return { status: "sent", email };
}

/**
 * Step two: trade the code for a session.
 *
 * The address comes back from the hidden field rather than being remembered
 * server-side, which is safe because it proves nothing on its own — without
 * the code that was mailed to it, a wrong address here just fails.
 */
export async function verifyCode(
  _previous: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\D/g, "");

  if (!LOOKS_LIKE_EMAIL.test(email))
    return { status: "error", message: "Baştan başla." };
  if (token.length !== 6)
    return { status: "error", message: "Kod altı haneli." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    if (error.status === 429)
      return {
        status: "error",
        message: "Çok fazla denedin. Biraz bekleyip tekrar dene.",
      };
    // Wrong, expired and already-used are one answer on purpose: telling them
    // apart would let someone probe which codes had once been real.
    return {
      status: "error",
      message: "Kod hatalı ya da süresi dolmuş. Yeni bir kod iste.",
    };
  }

  redirect("/uye");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}

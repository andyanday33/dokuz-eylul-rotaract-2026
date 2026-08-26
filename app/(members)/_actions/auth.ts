"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

/** Enough to catch a typo; the real check is whether the email arrives. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestMagicLink(
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
      emailRedirectTo: `${await siteUrl()}/auth/confirm`,
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
  return { status: "sent" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}

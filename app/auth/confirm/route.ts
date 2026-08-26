import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

/**
 * Where magic links land.
 *
 * Supabase's default email template links straight at the Auth server, which
 * hands back a session in the URL fragment — invisible to the server, and so
 * useless to a server-rendered app. The template is changed to send
 * `{{ .TokenHash }}` here instead, and this route trades it for a session
 * cookie. If the template is ever reset, sign-in will fail here and nowhere
 * else, which is worth remembering when it does.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) redirect(safeNext(searchParams.get("next")));
  }

  // Expired, already used, or tampered with — all the same to the visitor.
  redirect("/giris?hata=baglanti");
}

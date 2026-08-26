import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

/**
 * Where invitations land.
 *
 * Signing in no longer comes through here — that is a six-digit code typed
 * into `/giris`. Invitations stay links because the whole point of one is that
 * somebody who has never signed in can click it, and a code would be asking
 * them to type it into a page they do not yet know exists.
 *
 * Supabase's default Invite template links straight at the Auth server, which
 * hands the session back in a URL fragment — invisible to the server, and so
 * useless to a server-rendered app. The template is changed to send
 * `{{ .TokenHash }}` here instead, and this route trades it for a session
 * cookie. If invitations break while codes keep working, that template has
 * been reset.
 *
 * `npm run signin:link` lands here too, which is why it still works with no
 * mail service configured at all.
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

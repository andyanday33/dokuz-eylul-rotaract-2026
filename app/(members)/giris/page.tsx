import { redirect } from "next/navigation";
import { Grain } from "@/components/Editorial";
import { Wordmark } from "@/components/Wordmark";
import { getMember, getSignedInEmail } from "@/lib/auth/dal";
import { signOut } from "../_actions/auth";
import { SignInForm } from "./SignInForm";

const ERRORS: Record<string, string> = {
  baglanti:
    "Bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir tane iste.",
};

/**
 * The one door into the members area, and the only page inside it a signed-out
 * visitor can reach. It shows one of three things:
 *
 *   a member            -> sent straight on to `/uye`
 *   a valid session     -> signed in, but `getMember()` finds nobody. A
 *   with no member row     session outlives the row it was issued against, so
 *                          this is where a member the board has deactivated
 *                          lands. Without this branch they would be shown the
 *                          sign-in form while already signed in, sign in
 *                          again successfully, and be sent straight back here.
 *   nobody              -> the sign-in form
 */
export default async function GirisPage({
  searchParams,
}: PageProps<"/giris">) {
  const member = await getMember();
  if (member) redirect("/uye");

  const email = await getSignedInEmail();
  const { hata } = await searchParams;
  const error = typeof hata === "string" ? ERRORS[hata] : undefined;

  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <Grain />

      <header className="relative z-10 border-b border-foreground/15">
        <div className="wrapper flex h-16 items-center">
          <Wordmark
            href="/tr"
            src="/dokuz_eylul.png"
            alt="Dokuz Eylül Rotaract Kulübü"
            priority
            className="w-(--masthead-logo-parked) shrink-0"
          />
        </div>
      </header>

      <div className="wrapper relative z-10 flex flex-1 items-center py-16 sm:py-24">
        <div className="w-full max-w-md">
          <div className="flex items-end justify-between gap-3 border-b-2 border-foreground pb-4">
            <p className="eyebrow text-primary">
              {email ? "Erişim yok" : "Üye girişi"}
            </p>
            <p className="eyebrow tabular-nums text-foreground/45">2440</p>
          </div>

          {email ? (
            <>
              <h1 className="font-editorial mt-8 text-4xl italic leading-[1.05] sm:text-5xl">
                Kulüp üyesi görünmüyorsun
              </h1>
              <p className="mt-6 text-sm font-light leading-relaxed text-foreground/70">
                <span className="font-normal text-foreground">{email}</span> ile
                giriş yaptın, ama bu adres kulüp kayıtlarında görünmüyor.
                Üyeliğin kapatılmış olabilir — yönetim kuruluna danış.
              </p>
              <form action={signOut} className="mt-8">
                <button
                  type="submit"
                  className="eyebrow border border-foreground/25 px-6 py-3 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Çıkış yap
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-editorial mt-8 text-4xl italic leading-[1.05] sm:text-5xl">
                Üye alanı
              </h1>
              <p className="mt-6 text-sm font-light leading-relaxed text-foreground/70">
                Bu bölüm kulüp üyelerine açık. Şifre yok — giriş bağlantısını
                e-postana gönderiyoruz.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-6 border-l-2 border-destructive pl-4 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="mt-10">
                <SignInForm />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

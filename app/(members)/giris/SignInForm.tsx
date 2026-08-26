"use client";

import { useActionState } from "react";
import { requestMagicLink, type SignInState } from "../_actions/auth";

const INITIAL: SignInState = { status: "idle" };

export function SignInForm() {
  const [state, action, pending] = useActionState(requestMagicLink, INITIAL);

  if (state.status === "sent") {
    return (
      <p
        role="status"
        className="border-l-2 border-primary pl-4 text-sm leading-relaxed text-foreground/75"
      >
        Bu adres bir kulüp üyesine aitse giriş bağlantısını gönderdik. Gelen
        kutunu kontrol et — bağlantı bir saat geçerli.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="email" className="eyebrow text-foreground/50">
        E-posta adresi
      </label>

      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="ad@ornek.com"
        aria-describedby={state.status === "error" ? "email-error" : undefined}
        className="border-b border-foreground/25 bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-foreground/25 focus:border-primary"
      />

      {state.status === "error" && (
        <p id="email-error" role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="eyebrow mt-2 self-start bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50"
      >
        {pending ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
      </button>
    </form>
  );
}

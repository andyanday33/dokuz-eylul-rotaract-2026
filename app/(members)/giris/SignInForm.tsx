"use client";

import { useActionState, useState } from "react";
import {
  requestCode,
  verifyCode,
  type SignInState,
  type VerifyState,
} from "../_actions/auth";

const REQUEST: SignInState = { status: "idle" };
const VERIFY: VerifyState = { status: "idle" };

const field =
  "w-full border-b border-foreground/25 bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-foreground/25 focus:border-primary";
const label = "eyebrow text-foreground/50";
const button =
  "eyebrow mt-2 self-start bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50";

/**
 * Two steps on one page: ask for a code, then type it in.
 *
 * The second step replaces the first rather than appearing under it. There is
 * only one thing to do at a time, and leaving the address field on screen
 * invites editing it after the code has already gone somewhere else.
 */
export function SignInForm() {
  const [sent, request, sending] = useActionState(requestCode, REQUEST);
  const [checked, verify, checking] = useActionState(verifyCode, VERIFY);

  // Lets "başka bir adres" put the address field back. Cleared as the request
  // form is submitted again, so asking for a second code returns to step two.
  const [restarted, setRestarted] = useState(false);
  const email = sent.status === "sent" && !restarted ? sent.email : null;

  if (email) {
    return (
      <form action={verify} className="flex flex-col gap-5">
        <input type="hidden" name="email" value={email} />

        <p className="text-sm font-light leading-relaxed text-foreground/75">
          Altı haneli kodu{" "}
          <span className="font-normal text-foreground">{email}</span> adresine
          gönderdik.
        </p>

        <label htmlFor="token" className={label}>
          Giriş kodu
        </label>

        {/* Set as a ticket number: wide, lining, one glyph per column, so a
            code read off a phone can be checked against the screen a digit at
            a time. The indent puts back the space the last letter-space adds,
            which would otherwise push the run off-centre. */}
        <input
          id="token"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          aria-describedby={checked.status === "error" ? "token-error" : undefined}
          className="w-full border-b border-foreground/25 bg-transparent pb-3 text-center text-3xl tabular-nums tracking-[0.5em] indent-[0.5em] outline-none transition-colors focus:border-primary sm:text-4xl"
        />

        {checked.status === "error" && (
          <p id="token-error" role="alert" className="text-sm text-destructive">
            {checked.message}
          </p>
        )}

        <button type="submit" disabled={checking} className={button}>
          {checking ? "Kontrol ediliyor…" : "Giriş yap"}
        </button>

        <button
          type="button"
          onClick={() => setRestarted(true)}
          className="eyebrow self-start text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Başka bir adres
        </button>
      </form>
    );
  }

  return (
    <form
      action={request}
      onSubmit={() => setRestarted(false)}
      className="flex flex-col gap-4"
    >
      <label htmlFor="email" className={label}>
        E-posta adresi
      </label>

      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="ad@ornek.com"
        aria-describedby={sent.status === "error" ? "email-error" : undefined}
        className={field}
      />

      {sent.status === "error" && (
        <p id="email-error" role="alert" className="text-sm text-destructive">
          {sent.message}
        </p>
      )}

      <button type="submit" disabled={sending} className={button}>
        {sending ? "Gönderiliyor…" : "Giriş kodu gönder"}
      </button>
    </form>
  );
}

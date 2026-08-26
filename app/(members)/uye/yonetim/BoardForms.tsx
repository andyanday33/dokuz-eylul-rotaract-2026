"use client";

import { useActionState } from "react";
import {
  createAnnouncement,
  createEvent,
  inviteMember,
  type FormState,
} from "../../_actions/board";
import { EVENT_TYPES } from "@/lib/members/event-types";

const INITIAL: FormState = { status: "idle" };

const field =
  "w-full border-b border-foreground/25 bg-transparent pb-2 outline-none transition-colors placeholder:text-foreground/25 focus:border-primary";
const label = "eyebrow block text-foreground/50";
const submit =
  "eyebrow self-start bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50";

function Result({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role="status"
      className={`border-l-2 pl-4 text-sm ${
        state.status === "error"
          ? "border-destructive text-destructive"
          : "border-primary text-foreground/70"
      }`}
    >
      {state.message}
    </p>
  );
}

/**
 * A task's opening line and its form.
 *
 * No heading of its own: the tab above already names the panel, and the
 * tabpanel takes its accessible name from that tab. A second heading saying
 * "Üye davet et" under a tab reading "Davet" is the same word twice, and the
 * button at the foot of each form states the action a third time.
 */
function Panel({ note, children }: { note: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="max-w-lg text-sm font-light leading-relaxed text-foreground/55">
        {note}
      </p>
      <div className="mt-8 max-w-lg">{children}</div>
    </div>
  );
}

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteMember, INITIAL);

  return (
    <Panel note="Davet edilen kişi e-postasındaki bağlantıyla giriş yapar. Kimse kendi başına hesap açamaz.">
      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="invite-name" className={label}>
            Ad soyad
          </label>
          <input id="invite-name" name="full_name" required className={field} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="invite-email" className={label}>
            E-posta
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            className={field}
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground/70">
          <input type="checkbox" name="role" value="board" className="accent-primary" />
          Yönetim kurulu yetkisi ver
        </label>

        <Result state={state} />

        <button type="submit" disabled={pending} className={submit}>
          {pending ? "Gönderiliyor…" : "Davet gönder"}
        </button>
      </form>
    </Panel>
  );
}

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(createAnnouncement, INITIAL);

  return (
    <Panel note="Yayınlamadığın duyuruyu yalnızca yönetim kurulu görür.">
      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="a-title" className={label}>
            Başlık
          </label>
          <input id="a-title" name="title" required className={field} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="a-body" className={label}>
            Metin
          </label>
          <textarea id="a-body" name="body" rows={6} required className={field} />
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground/70">
          <input type="checkbox" name="publish" className="accent-primary" />
          Hemen yayınla
        </label>

        <Result state={state} />

        <button type="submit" disabled={pending} className={submit}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </Panel>
  );
}

export function EventForm() {
  const [state, action, pending] = useActionState(createEvent, INITIAL);

  return (
    <Panel note="Saatler Türkiye saatiyle kaydedilir. Üyeler eklendiği anda katılım bildirebilir.">
      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="e-title" className={label}>
            Başlık
          </label>
          <input id="e-title" name="title" required className={field} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="e-type" className={label}>
            Tür
          </label>
          {/* An ordinary ruled field, matching every other one on the form.
              The page already spends its one loud gesture on the tab rule. */}
          <div className="relative">
            <select
              id="e-type"
              name="type"
              defaultValue="toplanti"
              className={`${field} appearance-none pr-6`}
            >
              {EVENT_TYPES.map(({ value, label: name }) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 text-foreground/40"
            >
              &#9662;
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="e-start" className={label}>
            Tarih ve saat
          </label>
          <input
            id="e-start"
            name="starts_at"
            type="datetime-local"
            required
            className={field}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="e-location" className={label}>
            Yer
          </label>
          <input id="e-location" name="location" className={field} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="e-map" className={label}>
            Harita bağlantısı
          </label>
          {/* Not type="url": the browser would reject a pasted
              `maps.app.goo.gl/…` for having no scheme, which the action
              repairs rather than refuses. The placeholder is the instruction. */}
          <input
            id="e-map"
            name="map_url"
            inputMode="url"
            placeholder="maps.app.goo.gl/…"
            className={field}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="e-desc" className={label}>
            Açıklama
          </label>
          <textarea id="e-desc" name="description" rows={4} className={field} />
        </div>

        <Result state={state} />

        <button type="submit" disabled={pending} className={submit}>
          {pending ? "Ekleniyor…" : "Etkinliği ekle"}
        </button>
      </form>
    </Panel>
  );
}

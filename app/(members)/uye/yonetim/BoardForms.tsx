"use client";

import { useActionState } from "react";
import {
  createAnnouncement,
  createEvent,
  inviteMember,
  type FormState,
} from "../../_actions/board";
import { EventFields } from "../EventFields";
import { Result, field, label, submit } from "../FormBits";

const INITIAL: FormState = { status: "idle" };

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
          <input
            type="checkbox"
            name="role"
            value="board"
            className="accent-primary"
          />
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
          <textarea
            id="a-body"
            name="body"
            rows={6}
            required
            className={field}
          />
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
        <EventFields />

        <Result state={state} />

        <button type="submit" disabled={pending} className={submit}>
          {pending ? "Ekleniyor…" : "Etkinliği ekle"}
        </button>
      </form>
    </Panel>
  );
}

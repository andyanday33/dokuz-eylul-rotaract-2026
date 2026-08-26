import { EVENT_TYPES } from "@/lib/members/event-types";
import { toDateTimeInput } from "@/lib/members/format";
import type { ClubEvent } from "@/lib/members/types";
import { field, label } from "./FormBits";

/**
 * Everything an event is, as form fields.
 *
 * Shared by the board's "add" form and an event's own edit page, so the two
 * cannot fall out of step — a field added here appears in both, and a field
 * added to only one of them is a bug that used to be easy to write.
 *
 * Uncontrolled with `defaultValue`: the server action is the only thing that
 * reads these, and nothing on the page needs to react to a half-typed title.
 */
export function EventFields({ event }: { event?: ClubEvent }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="e-title" className={label}>
          Başlık
        </label>
        <input
          id="e-title"
          name="title"
          required
          defaultValue={event?.title}
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="e-type" className={label}>
          Tür
        </label>
        {/* An ordinary ruled field, matching every other one on the form. */}
        <div className="relative">
          <select
            id="e-type"
            name="type"
            defaultValue={event?.type ?? "toplanti"}
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
          defaultValue={
            event ? toDateTimeInput(event.starts_at) : undefined
          }
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="e-location" className={label}>
          Yer
        </label>
        <input
          id="e-location"
          name="location"
          defaultValue={event?.location ?? ""}
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="e-map" className={label}>
          Harita bağlantısı
        </label>
        {/* Not type="url": the browser would reject a pasted
            `maps.app.goo.gl/…` for having no scheme, which the action repairs
            rather than refuses. The placeholder is the instruction. */}
        <input
          id="e-map"
          name="map_url"
          inputMode="url"
          placeholder="maps.app.goo.gl/…"
          defaultValue={event?.map_url ?? ""}
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="e-desc" className={label}>
          Açıklama
        </label>
        <textarea
          id="e-desc"
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
          className={field}
        />
      </div>
    </>
  );
}

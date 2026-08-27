/**
 * Moves the site's founding content into Payload — once.
 *
 * Everything here used to be a literal in the source: the roll of presidents
 * in `data/presidents.ts`, the board and the committee chairs in the
 * components that draw them, the seven areas of focus in both dictionaries.
 * `scripts/seed-data.json` is that content, lifted verbatim, and this script
 * is what puts it in the database the first time.
 *
 * It is idempotent by identity rather than by wiping: a president is its term,
 * a seat is its role, an area is its key, a portrait is its filename. Running
 * it twice creates nothing the second time, and — the point of the rule — it
 * never overwrites an edit someone has since made in the panel. That makes it
 * safe to run against production after a deploy, which is what makes it a way
 * to introduce fixed content later rather than a one-off.
 *
 *   npm run cms:seed
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload, type CollectionSlug, type Where } from "payload";
import config from "@payload-config";
import {
  BOARD_ROLES,
  COMMITTEE_ROLES,
  FOCUS_AREAS,
  type BoardRole,
  type CommitteeRole,
  type FocusArea,
} from "../cms/roles";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

type Seat<Role extends string> = {
  role: Role;
  name: string;
  photo: string;
  order: number;
};
type Copy = { title: string; body: string };

type Localised<T> = { tr: T; en: T };
type AboutCopy = {
  label: string;
  meta: string;
  watermark: string;
  heading: string;
};
type FourWayHead = {
  eyebrow: string;
  meta: string;
  heading: string;
  colophon: string;
};
type LetterCopy = {
  eyebrow: string;
  heading: string;
  watermark: string;
  marginDateline: string;
  sealText: string;
  salutation: string;
  pullQuote: string;
  valediction: string;
  signOff: string;
  signatureCredit: string;
};
type HeroCopy = {
  datelineLeft: string;
  datelineRight: string;
  srTitle: string;
  taglineLead: string;
  taglineAccent: string;
  meetingNote: string;
  cta: string;
};

type SeedFile = {
  roll: { term: string; name: string }[];
  board: Seat<string>[];
  chairs: Seat<string>[];
  areas: { key: string; tr: Copy; en: Copy }[];
  home: {
    path: string;
    title: Localised<string>;
    description: Localised<string>;
    layout: string[];
    about: {
      index: string;
      tr: AboutCopy;
      en: AboutCopy;
      pillars: { n: string; tr: Copy; en: Copy }[];
    };
    hero: {
      ctaHref: string;
      wordmark: Localised<{ file: string; alt: string }>;
      tr: HeroCopy;
      en: HeroCopy;
    };
    marquee: {
      separator: string;
      speedSeconds: number;
      items: Localised<string>[];
    };
    numbers: {
      eyebrow: Localised<string>;
      stats: Localised<{ big: string; label: string }>[];
    };
    fourWayTest: {
      tr: FourWayHead;
      en: FourWayHead;
      items: Localised<{ q: string; a: string; stamp: string }>[];
    };
    presidentsMessage: {
      portrait: { file: string; alt: Localised<string> };
      tr: LetterCopy;
      en: LetterCopy;
      openingParagraphs: Localised<string>[];
      closingParagraphs: Localised<string>[];
      manifesto: Localised<string>[];
    };
  };
};

const seed = JSON.parse(
  readFileSync(path.join(root, "scripts/seed-data.json"), "utf8"),
) as SeedFile;

/**
 * Narrows a key out of the seed file to one the site can render.
 *
 * The seed file is a snapshot of content that has already moved on; the role
 * vocabularies in `cms/roles.ts` have not. If the two ever disagree, that is
 * worth stopping for — a silently skipped seat is a hole in the board that
 * nobody would notice until the page was already live.
 */
const narrow = <T extends string>(
  roles: readonly T[],
  value: string,
  what: string,
): T => {
  if (!(roles as readonly string[]).includes(value))
    throw new Error(`Unknown ${what} "${value}" in seed-data.json — see cms/roles.ts`);
  return value as T;
};

const payload = await getPayload({ config });

let created = 0;
let kept = 0;

/** The id of an existing document matching `where`, or null. */
const findId = async (collection: CollectionSlug, where: Where) => {
  const { docs } = await payload.find({ collection, where, limit: 1 });
  return docs[0]?.id ?? null;
};

/**
 * Uploads a portrait out of `public/`, or returns the one already there.
 *
 * The portraits were committed to the repo before there was anywhere else to
 * put them. Copying them into Payload is what lets an editor replace one
 * without a deploy; the files stay in `public/` as the placeholders they now
 * are — see `PLACEHOLDER` in the board and committee components.
 */
const uploadPortrait = async (
  publicPath: string,
  alt?: { tr: string; en: string },
) => {
  const filename = path.basename(publicPath);
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
  });
  if (existing.docs[0]) return existing.docs[0].id;

  const doc = await payload.create({
    collection: "media",
    // Portraits get their description from the name beside them, so they are
    // uploaded without one. The wordmark is the exception: it carries meaning
    // on its own, and is the same meaning wherever it is placed.
    data: alt ? { alt: alt.tr } : {},
    locale: "tr",
    filePath: path.join(root, "public", publicPath.replace(/^\//, "")),
  });
  if (alt)
    await payload.update({
      collection: "media",
      id: doc.id,
      locale: "en",
      data: { alt: alt.en },
    });
  return doc.id;
};

/** The row to create for a seat, or null if that seat is already filled. */
const seatRow = async <Role extends string>(
  collection: CollectionSlug,
  { role, name, photo, order }: Seat<Role>,
) =>
  (await findId(collection, { role: { equals: role } }))
    ? null
    : { role, name, order, photo: await uploadPortrait(photo) };

// ---- The roll of presidents -------------------------------------------------
for (const { term, name } of seed.roll) {
  if (await findId("presidents", { term: { equals: term } })) {
    kept++;
    continue;
  }
  await payload.create({ collection: "presidents", data: { term, name } });
  created++;
}

// ---- The board --------------------------------------------------------------
for (const seat of seed.board) {
  const role = narrow(BOARD_ROLES, seat.role, "board role");
  const data = await seatRow("board-members", { ...seat, role } as Seat<BoardRole>);
  if (!data) {
    kept++;
    continue;
  }
  await payload.create({ collection: "board-members", data });
  created++;
}

// ---- The committee chairs ---------------------------------------------------
for (const seat of seed.chairs) {
  const role = narrow(COMMITTEE_ROLES, seat.role, "committee role");
  const data = await seatRow("committee-chairs", { ...seat, role } as Seat<CommitteeRole>);
  if (!data) {
    kept++;
    continue;
  }
  await payload.create({ collection: "committee-chairs", data });
  created++;
}

// ---- Rotary's seven areas of focus ------------------------------------------
// Written twice: created in Turkish, which is the site's source language, then
// updated in English. Payload stores one document per area with a value per
// locale, so the second write adds a translation rather than a row.
for (const area of seed.areas) {
  const key: FocusArea = narrow(FOCUS_AREAS, area.key, "area of focus");
  if (await findId("areas-of-focus", { key: { equals: key } })) {
    kept++;
    continue;
  }
  const doc = await payload.create({
    collection: "areas-of-focus",
    locale: "tr",
    data: { key, ...area.tr },
  });
  await payload.update({
    collection: "areas-of-focus",
    id: doc.id,
    locale: "en",
    data: area.en,
  });
  created++;
}

// ---- The home page ----------------------------------------------------------
// The sections the hand-written home page used to name in source, in the same
// order, with the "Biz Kimiz" copy that used to sit in the dictionaries. Every
// other block is still field-less, so it carries no content of its own yet —
// which is exactly what makes this list the page's running order and nothing
// more, for now.
if (await findId("pages", { path: { equals: seed.home.path } })) {
  kept++;
} else {
  const { about, hero, marquee, numbers, fourWayTest, presidentsMessage } =
    seed.home;
  const portraitId = await uploadPortrait(
    presidentsMessage.portrait.file,
    presidentsMessage.portrait.alt,
  );
  const wordmarks = {
    tr: await uploadPortrait(hero.wordmark.tr.file, {
      tr: hero.wordmark.tr.alt,
      en: hero.wordmark.tr.alt,
    }),
    en: await uploadPortrait(hero.wordmark.en.file, {
      tr: hero.wordmark.en.alt,
      en: hero.wordmark.en.alt,
    }),
  };

  const layout = seed.home.layout.map((blockType) => {
    if (blockType === "about")
      return {
        blockType: "about" as const,
        index: about.index,
        ...about.tr,
        pillars: about.pillars.map((p) => ({ n: p.n, ...p.tr })),
      };
    if (blockType === "hero")
      return {
        blockType: "hero" as const,
        ctaHref: hero.ctaHref,
        wordmark: wordmarks.tr,
        ...hero.tr,
      };
    if (blockType === "marquee")
      return {
        blockType: "marquee" as const,
        separator: marquee.separator,
        speedSeconds: marquee.speedSeconds,
        items: marquee.items.map((it) => ({ text: it.tr })),
      };
    if (blockType === "numbers")
      return {
        blockType: "numbers" as const,
        eyebrow: numbers.eyebrow.tr,
        stats: numbers.stats.map((s) => s.tr),
      };
    if (blockType === "four-way-test")
      return {
        blockType: "four-way-test" as const,
        ...fourWayTest.tr,
        items: fourWayTest.items.map((it) => it.tr),
      };
    if (blockType === "presidents-message")
      return {
        blockType: "presidents-message" as const,
        portrait: portraitId,
        ...presidentsMessage.tr,
        openingParagraphs: presidentsMessage.openingParagraphs.map((t) => ({ text: t.tr })),
        closingParagraphs: presidentsMessage.closingParagraphs.map((t) => ({ text: t.tr })),
        manifesto: presidentsMessage.manifesto.map((t) => ({ text: t.tr })),
      };
    return { blockType: blockType as "past-presidents" };
  });

  const page = await payload.create({
    collection: "pages",
    locale: "tr",
    data: {
      path: seed.home.path,
      title: seed.home.title.tr,
      description: seed.home.description.tr,
      layout,
    },
  });

  // The English pass has to address the same rows, so it carries each block's
  // `id` back — without them Payload would replace the array rather than
  // translate it, and the two languages would end up with different sections.
  const rows = page.layout;
  await payload.update({
    collection: "pages",
    id: page.id,
    locale: "en",
    data: {
      title: seed.home.title.en,
      description: seed.home.description.en,
      layout: rows.map((row) => {
        if (row.blockType === "about")
          return {
            ...row,
            ...about.en,
            pillars: (row.pillars ?? []).map((p, j) => ({
              ...p,
              ...about.pillars[j].en,
            })),
          };
        if (row.blockType === "hero")
          // The wordmark is localized, so English gets the English lockup —
          // this is the one field where the two languages differ by file
          // rather than by wording.
          return { ...row, ...hero.en, wordmark: wordmarks.en };
        if (row.blockType === "marquee")
          return {
            ...row,
            items: (row.items ?? []).map((it, j) => ({
              ...it,
              text: marquee.items[j].en,
            })),
          };
        if (row.blockType === "numbers")
          return {
            ...row,
            eyebrow: numbers.eyebrow.en,
            stats: (row.stats ?? []).map((s, j) => ({
              ...s,
              ...numbers.stats[j].en,
            })),
          };
        if (row.blockType === "four-way-test")
          return {
            ...row,
            ...fourWayTest.en,
            items: (row.items ?? []).map((it, j) => ({
              ...it,
              ...fourWayTest.items[j].en,
            })),
          };
        if (row.blockType === "presidents-message") {
          const en = <T extends { id?: string | null }>(
            rows: T[] | null | undefined,
            source: { en: string }[],
          ) => (rows ?? []).map((r, j) => ({ ...r, text: source[j].en }));
          return {
            ...row,
            ...presidentsMessage.en,
            openingParagraphs: en(row.openingParagraphs, presidentsMessage.openingParagraphs),
            closingParagraphs: en(row.closingParagraphs, presidentsMessage.closingParagraphs),
            manifesto: en(row.manifesto, presidentsMessage.manifesto),
          };
        }
        return row;
      }),
    },
  });
  created++;
}

payload.logger.info(`Seed complete — ${created} created, ${kept} already present.`);

// Payload keeps its connection pool open; nothing else is waiting on this.
process.exit(0);

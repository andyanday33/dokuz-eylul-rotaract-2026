import type { CollectionConfig } from "payload";
import { BOARD_ROLES, optionsFrom } from "../roles";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * The five seats on the board, as the wheel on the home page draws them.
 *
 * `role` is a fixed select rather than free text: the wheel seats members by
 * position and the dictionaries hold the translated titles, so an unrecognised
 * role would render a blank label. Adding a seat is a code change in
 * `cms/roles.ts` plus both dictionaries — see the note there.
 *
 * `order` decides where a member sits on the orbit, clockwise from twelve.
 */
export const BoardMembers: CollectionConfig = {
  slug: "board-members",
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: revalidation,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "order"],
    group: "İçerik",
    description: "Yönetim kurulu — ana sayfadaki çark.",
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      unique: true,
      options: optionsFrom(BOARD_ROLES),
      admin: { description: "Görev adı çeviri dosyalarından gelir." },
    },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { description: "Çarkta saat on ikiden başlayarak sıra." },
    },
  ],
};

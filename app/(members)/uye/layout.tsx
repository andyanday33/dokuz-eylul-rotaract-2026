import { Grain } from "@/components/Editorial";
import { requireMember } from "@/lib/auth/dal";
import { MembersNav } from "./MembersNav";

/**
 * Everything below `/uye` is members-only. The guard is repeated in each page
 * rather than left here alone: a layout does not necessarily re-run on every
 * navigation within the segment, so it is the wrong single place to decide
 * who may see what. `requireMember` is cached per request, so saying it twice
 * costs one lookup.
 */
export default async function UyeLayout({ children }: LayoutProps<"/uye">) {
  const member = await requireMember();

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <Grain />
      <MembersNav name={member.full_name} isBoard={member.role === "board"} />
      <main className="wrapper relative z-10 flex-1 py-12 sm:py-16">
        {children}
      </main>
    </div>
  );
}

import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/seo";

/**
 * Open to crawlers, including the AI ones.
 *
 * The club's reason for having a website is to be found, and that now includes
 * being quotable by answer engines — so GPTBot, ClaudeBot, PerplexityBot and
 * Google-Extended are deliberately *not* disallowed here. `/llms.txt` exists
 * for the same reason. Reversing that decision means adding the crawlers to
 * this file, and it is a decision about the club rather than about the code.
 *
 * The two areas that are closed are closed because they are not public: the
 * members' area behind a sign-in, and the editors' panel.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/uye", "/giris", "/auth/"],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}

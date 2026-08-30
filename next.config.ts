import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // The version is a fact about the stack that only helps someone scanning for
  // an unpatched Next; nothing on the site needs it.
  poweredByHeader: false,

  images: {
    // AVIF first, WebP behind it. Every portrait on the page is a photograph,
    // which is exactly what AVIF is good at — around a third of the JPEG for
    // the same detail. `sharp` is already a dependency, so nothing new is
    // needed to encode them; the cost is a one-off per size and then cached.
    formats: ["image/avif", "image/webp"],
    // How long an optimised derivative is kept before it is re-encoded. Upload
    // filenames from Payload are stable rather than content-hashed — re-upload
    // a portrait under the same name and the URL does not change — so this is
    // a day, not a year: long enough that nobody pays the encode twice, short
    // enough that a replaced portrait appears without a deploy.
    minimumCacheTTL: 86400,
  },

  async headers() {
    return [
      {
        // Payload serves uploads from its own route, which sets no caching of
        // its own: every visitor was re-fetching every portrait on every view.
        // Short in the browser and long at the edge, so a replaced image is
        // picked up quickly while the origin is not asked twice for the same
        // byte. `stale-while-revalidate` keeps a CDN serving the old file for
        // the moment it takes to fetch the new one.
        source: "/api/media/file/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

// `withPayload` aliases `@payload-config`, keeps Payload's server-only
// dependencies out of the client bundle, and registers the admin panel's
// generated import map. The admin routes will not build without it.
export default withPayload(nextConfig);

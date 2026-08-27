import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  /* config options here */
};

// `withPayload` aliases `@payload-config`, keeps Payload's server-only
// dependencies out of the client bundle, and registers the admin panel's
// generated import map. The admin routes will not build without it.
export default withPayload(nextConfig);

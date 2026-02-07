import type { NextConfig } from "next";
import { env as _env } from "./env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    useCache: true,
    inlineCss: true,
  },
};

export default nextConfig;

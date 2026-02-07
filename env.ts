import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

const StoreName = z.string().nonempty();
const NameToStoreDomain = StoreName.transform(
  (string) => `${string}.myshopify.com`
);
const ApiVersion = z
  .enum(["unstable", "2025-01", "2025-04", "2025-07", "2025-10"])
  .optional()
  .default("2025-07");

export const env = createEnv({
  server: {
    VERCEL_ENV: z.string(),
    SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN: z.string(),
    SHOPIFY_STORE_DOMAIN: NameToStoreDomain,
    SHOPIFY_STORE_NAME: StoreName,
    SHOPIFY_STOREFRONT_API_VERSION: ApiVersion,
    SHOPIFY_COLLECTION_HANDLE: z.string().optional().default("frontpage"),
    USE_MOCK_SHOPIFY: z.string().optional().default("false").transform((val) => val === "true"),
  },
  client: {
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: NameToStoreDomain,
    NEXT_PUBLIC_SHOPIFY_STORE_NAME: StoreName,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION: ApiVersion,
    NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE: z
      .string()
      .optional()
      .default("frontpage"),
  },
  runtimeEnv: {
    VERCEL_ENV: process.env.VERCEL_ENV || "development",
    SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN:
      process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
    SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME,
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN:
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME,
    NEXT_PUBLIC_SHOPIFY_STORE_NAME: process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME,
    SHOPIFY_STORE_NAME: process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME,
    SHOPIFY_STOREFRONT_API_VERSION:
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION:
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION,
    NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE:
      process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE,
    SHOPIFY_COLLECTION_HANDLE:
      process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE,
    USE_MOCK_SHOPIFY: process.env.USE_MOCK_SHOPIFY,
  },
});

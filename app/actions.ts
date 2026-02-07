"use server";

import { client } from "@/lib/shopify/serverClient";
import { getProductByHandle } from "@/lib/shopify/graphql/query";
import type { GetProductByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";

export async function fetchProductByHandle(
  handle: string
): Promise<GetProductByHandleQuery["productByHandle"]> {
  const resp = await client.request(getProductByHandle, {
    variables: { handle },
  });
  return resp.data?.productByHandle ?? null;
}

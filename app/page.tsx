import { client } from "@/lib/shopify/serverClient";
import { getShop, getCollectionByHandle } from "@/lib/shopify/graphql/query";
import { env } from "@/env";
import { HomeClient } from "./home-client";

export default async function Home() {
  "use cache";
  const [shopResp, collectionResp] = await Promise.all([
    client.request(getShop),
    client.request(getCollectionByHandle, {
      variables: { handle: env.SHOPIFY_COLLECTION_HANDLE },
    }),
  ]);

  const collection = collectionResp.data?.collectionByHandle;
  const products = collection?.products?.nodes ?? [];
  const shopName = shopResp.data?.shop?.name;
  const collectionTitle = collection?.title;

  return (
    <HomeClient
      products={products}
      shopName={shopName}
      collectionTitle={collectionTitle}
    />
  );
}

#!/usr/bin/env node
/**
 * Lists collection handles from the Shopify Storefront API. Outputs JSON.
 * Run: pnpm run list-collections
 * Requires .env.local with NEXT_PUBLIC_SHOPIFY_STORE_NAME, SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION
 */
const store = process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME;
const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN;
const version =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || "2025-07";

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

if (!store || !token) {
  out({
    ok: false,
    error: "Missing env",
    hint: "Run: node --env-file=.env.local scripts/list-collections.mjs",
  });
  process.exit(1);
}

// Same auth as the website: private token uses Shopify-Storefront-Private-Token (not X-Shopify-Storefront-Access-Token).
const url = `https://${store}.myshopify.com/api/${version}/graphql.json`;
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Shopify-Storefront-Private-Token": token,
};

// 1) Try full collections list (may be UNAUTHORIZED if token lacks scope)
const listQuery = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        handle
        title
        id
      }
    }
  }
`;
const listRes = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({ query: listQuery, variables: { first: 50 } }),
});
const listJson = await listRes.json();

if (!listJson.errors && listJson.data?.collections?.nodes) {
  const nodes = listJson.data.collections.nodes;
  const handles = new Set(nodes.map((n) => n.handle));

  // "all" is a special Shopify collection (All products) that often does not
  // appear in collections(first: N), but collectionByHandle(handle: "all") works on the site.
  if (!handles.has("all")) {
    const allQuery = `
      query probeAll {
        collectionByHandle(handle: "all") { handle title id products(first: 1) { nodes { id } } }
      }
    `;
    const allRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: allQuery }),
    });
    const allJson = await allRes.json();
    if (!allJson.errors && allJson.data?.collectionByHandle) {
      nodes.unshift(allJson.data.collectionByHandle);
    }
  }

  out({
    ok: true,
    source: "collections",
    collections: nodes,
    hint: "Set NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE to any handle above.",
  });
  process.exit(0);
}

// 2) Fallback: probe known handles via collectionByHandle (allowed by most tokens)
const knownHandles = ["all"];
const probeQuery = `
  query probeCollections {
    all: collectionByHandle(handle: "all") { handle title id products(first: 1) { nodes { id } } }
  }
`;
const probeRes = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({ query: probeQuery }),
});
const probeJson = await probeRes.json();

if (probeJson.errors) {
  out({
    ok: false,
    error: "GraphQL errors",
    details: probeJson.errors,
    attempted:
      "collections list (UNAUTHORIZED) and collectionByHandle fallback",
  });
  process.exit(1);
}

const data = probeJson.data ?? {};
const collections = [
  data.all,
  data.frontpage,
  data.featured,
  data.bestSellers,
].filter(Boolean);

out({
  ok: true,
  source: "collectionByHandle (known handles)",
  collections: collections.map((c) => ({
    handle: c.handle,
    title: c.title,
    id: c.id,
    hasProducts: (c.products?.nodes?.length ?? 0) > 0,
  })),
  hint: "Set NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE to any handle above.",
});

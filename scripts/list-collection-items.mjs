#!/usr/bin/env node
/**
 * Lists products from a Shopify collection via Storefront API.
 * Fetches a pool of products, then randomly displays a small subset
 * to inspect data shape.
 * Nice to see a random sample of the data to get an idea of what we are working with.
 *
 * CLI options:
 * positional arg or --handle= → collection handle (default "all")
 * --show=N → how many products to display (default 3)
 * --fetch=N → how many products to fetch from Shopify (default 50)
 *
 * full example:
 * pnpm run list-collection-items hats --fetch=100 --show=10
 */

const store = process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME;
const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN;
const version =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || "2025-07";

/**
 * CLI parsing
 */
const argv = process.argv.slice(2);

const handleFlag = argv.find((a) => a.startsWith("--handle="));
const showFlag = argv.find((a) => a.startsWith("--show="));
const fetchFlag = argv.find((a) => a.startsWith("--fetch="));

const handle =
  handleFlag?.split("=")[1] || argv.find((a) => !a.startsWith("--")) || "all";

const showCount = Math.max(1, Number(showFlag?.split("=")[1] ?? 3));

const fetchCount = Math.max(showCount, Number(fetchFlag?.split("=")[1] ?? 50));

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

if (!store || !token) {
  out({
    ok: false,
    error: "Missing env",
    required: [
      "NEXT_PUBLIC_SHOPIFY_STORE_NAME",
      "SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN",
    ],
    hint: "Run: node --env-file=.env.local scripts/list-collection-items.mjs",
  });
  process.exit(1);
}

/**
 * Utility: random sample without replacement
 */
function sample(array, n) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const url = `https://${store}.myshopify.com/api/${version}/graphql.json`;
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Shopify-Storefront-Private-Token": token,
};

const query = `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      products(first: $first) {
        nodes {
          id
          handle
          title
          availableForSale
          vendor
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            nodes {
              id
              sku
              title
            }
          }
        }
      }
    }
  }
`;

const res = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query,
    variables: {
      handle,
      first: fetchCount,
    },
  }),
});

const json = await res.json();

if (json.errors) {
  out({
    ok: false,
    error: "GraphQL errors",
    details: json.errors,
  });
  process.exit(1);
}

const collection = json.data?.collectionByHandle;

if (!collection) {
  out({
    ok: false,
    error: "Collection not found",
    handle,
  });
  process.exit(1);
}

const allProducts = collection.products.nodes;
const sampled = sample(allProducts, Math.min(showCount, allProducts.length));

out({
  ok: true,
  handle,
  collection: {
    id: collection.id,
    title: collection.title,
  },
  fetched: allProducts.length,
  displayed: sampled.length,
  products: sampled,
});

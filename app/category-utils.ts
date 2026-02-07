import type {
  GetCollectionByHandleQuery,
  GetProductByHandleQuery,
} from "@/lib/shopify/graphql/.generated/storefront.generated";

type CollectionProduct = NonNullable<
  GetCollectionByHandleQuery["collectionByHandle"]
>["products"]["nodes"][number];

type ProductDetail = NonNullable<GetProductByHandleQuery["productByHandle"]>;

type ProductWithCollections = CollectionProduct | ProductDetail;

export function getPrimaryCategory(
  product: ProductWithCollections
): string | null {
  const collections = product.collections?.nodes;
  if (!collections || collections.length === 0) return null;

  // Prioritize specific categories over "all"
  const specificCollection = collections.find((c) => c.handle !== "all");
  return specificCollection?.title || collections[0]?.title || null;
}

export function getCategoryColor(categoryTitle: string | null): string {
  if (!categoryTitle) return "bg-gray-500";

  const normalized = categoryTitle.toLowerCase();

  if (normalized.includes("graphics") || normalized.includes("card")) {
    return "bg-emerald-600";
  }

  if (normalized.includes("accessories") || normalized.includes("accessory")) {
    return "bg-purple-600";
  }

  // Default fallback
  return "bg-gray-500";
}

export function truncateCategory(
  categoryTitle: string | null,
  maxLength: number = 14
): string {
  if (!categoryTitle) return "";

  if (categoryTitle.length <= maxLength) return categoryTitle;

  // Try to truncate at word boundary
  const truncated = categoryTitle.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.6) {
    return truncated.slice(0, lastSpace) + "…";
  }

  return truncated + "…";
}

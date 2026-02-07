"use client";

import { useState, useRef } from "react";
import { ProductGrid } from "./product-grid";
import { QuickViewModal } from "./quick-view-modal";
import { QuickViewModalContent } from "./quick-view-modal-content";
import type { GetCollectionByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";

type CollectionProduct = NonNullable<
  GetCollectionByHandleQuery["collectionByHandle"]
>["products"]["nodes"][number];

type Props = {
  products: CollectionProduct[];
};

export function CollectionWithModal({ products }: Props) {
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const quickViewTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <ProductGrid
        products={products}
        selectedHandle={selectedHandle}
        onSelectedHandleChange={setSelectedHandle}
        quickViewTriggerRef={quickViewTriggerRef}
      />
      <QuickViewModal
        isOpen={selectedHandle !== null}
        onClose={() => setSelectedHandle(null)}
        triggerRef={quickViewTriggerRef}
      >
        {selectedHandle && (
          <QuickViewModalContent handle={selectedHandle} />
        )}
      </QuickViewModal>
    </>
  );
}

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9-_]/g, "_");

/** View-transition-name for the product card image (grid). Must be unique when modal is open. */
export function productViewTransitionName(id: string): string {
  return "product-" + safeId(id);
}

/** View-transition-name for the modal product image. Distinct from grid to avoid duplicate name errors. */
export function productModalViewTransitionName(id: string): string {
  return "product-" + safeId(id) + "-modal";
}

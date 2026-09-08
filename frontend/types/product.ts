/**
 * Mirrors the badge enum on the backend's Product model
 * (backend/src/models/Product.ts). Duplicated rather than imported because
 * the frontend and backend are separate deployable apps with no shared
 * package -- keep this in sync if the backend enum changes.
 */
export type ProductBadge = "new" | "bestseller" | "limited" | "sale";

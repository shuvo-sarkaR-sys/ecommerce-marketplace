import { getNewArrivals } from "@/lib/data/home";
import { ProductRail } from "./ProductRail";

export async function NewArrivals() {
  const products = await getNewArrivals(8);
  return <ProductRail title="New Arrivals" viewAllHref="/shop/new" products={products} />;
}

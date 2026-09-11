import test from "node:test";
import assert from "node:assert/strict";

import { buildCheckoutPayload, type CartCheckoutItem } from "./order.service";

test("buildCheckoutPayload calculates totals and seller payouts from cart items", () => {
  const items: CartCheckoutItem[] = [
    {
      slug: "ivory-overshirt",
      name: "Ivory Overshirt",
      brandName: "LUXE",
      price: 2500,
      quantity: 2,
      color: "Ivory",
      size: "M",
    },
    {
      slug: "slim-tapered-trouser",
      name: "Slim Tapered Trouser",
      brandName: "LUXE",
      price: 3200,
      quantity: 1,
      color: "Black",
      size: "L",
    },
  ];

  const payload = buildCheckoutPayload(items, {
    "ivory-overshirt": {
      _id: "64f000000000000000000001",
      slug: "ivory-overshirt",
      seller: "64f000000000000000000010",
      brand: "64f000000000000000000020",
      price: 2500,
      images: ["/images/overshirt.jpg"],
      colors: ["Ivory"],
      sizes: [{ size: "M", stock: 10 }],
      commissionRate: 15,
    },
    "slim-tapered-trouser": {
      _id: "64f000000000000000000002",
      slug: "slim-tapered-trouser",
      seller: "64f000000000000000000011",
      brand: "64f000000000000000000021",
      price: 3200,
      images: ["/images/trouser.jpg"],
      colors: ["Black"],
      sizes: [{ size: "L", stock: 6 }],
      commissionRate: 15,
    },
  });

  const firstItem = payload.items[0];
  const secondItem = payload.items[1];

  assert.ok(firstItem);
  assert.ok(secondItem);
  assert.equal(payload.subtotal, 8200);
  assert.equal(payload.shippingFee, 0);
  assert.equal(payload.total, 8200);
  assert.equal(payload.items.length, 2);
  assert.equal(firstItem.sellerPayout, 2125);
  assert.equal(secondItem.sellerPayout, 2720);
});

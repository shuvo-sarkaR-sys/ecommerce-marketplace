import { loadEnv } from "../src/config/loadEnv";
loadEnv();

import mongoose from "mongoose";
import { User } from "../src/models/User";
import { Category } from "../src/models/Category";
import { Brand } from "../src/models/Brand";
import { Product, type ProductBadge } from "../src/models/Product";
import { Order } from "../src/models/Order";
import { Review } from "../src/models/Review";
import { hashPassword } from "../src/utils/password";
import { slugify } from "../src/utils/slugify";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI -- copy .env.example to .env first.");
}

const TOP_CATEGORIES = ["Women", "Men", "Accessories", "Shoes", "Bags", "Beauty"] as const;

type CategorySlug = "women" | "men" | "accessories" | "shoes" | "bags" | "beauty";

interface ProductTemplate {
  name: string;
  price: number;
  compareAtPrice?: number;
  material: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  badges?: ProductBadge[];
}

const CATEGORY_PRODUCTS: Record<CategorySlug, ProductTemplate[]> = {
  women: [
    { name: "Linen Wrap Dress", price: 3990, material: "Linen", colors: ["Ivory", "Sage"], sizes: ["XS", "S", "M", "L"], tags: ["dress", "linen"], badges: ["new"] },
    { name: "Silk Blend Blouse", price: 2890, material: "Silk blend", colors: ["Black", "Champagne"], sizes: ["S", "M", "L"], tags: ["blouse", "silk"] },
    { name: "Tailored Wide-Leg Trousers", price: 3290, material: "Cotton twill", colors: ["Charcoal", "Beige"], sizes: ["S", "M", "L", "XL"], tags: ["trousers"] },
    { name: "Cropped Denim Jacket", price: 3590, compareAtPrice: 4490, material: "Denim", colors: ["Indigo"], sizes: ["S", "M", "L"], tags: ["jacket", "denim"], badges: ["sale"] },
    { name: "Pleated Midi Skirt", price: 2490, material: "Crepe", colors: ["Black", "Terracotta"], sizes: ["XS", "S", "M"], tags: ["skirt"] },
    { name: "Cotton Poplin Shirt", price: 1890, material: "Cotton", colors: ["White", "Sky Blue"], sizes: ["S", "M", "L"], tags: ["shirt"] },
    { name: "Draped Jersey Top", price: 1690, material: "Modal jersey", colors: ["Black", "Rust"], sizes: ["XS", "S", "M", "L"], tags: ["top"] },
    { name: "Structured Blazer", price: 4990, material: "Wool blend", colors: ["Charcoal"], sizes: ["S", "M", "L"], tags: ["blazer"], badges: ["bestseller"] },
    { name: "High-Rise Straight Jeans", price: 2990, material: "Denim", colors: ["Mid Wash", "Black"], sizes: ["26", "28", "30", "32"], tags: ["jeans"] },
    { name: "Satin Slip Dress", price: 3490, material: "Satin", colors: ["Champagne", "Black"], sizes: ["XS", "S", "M"], tags: ["dress"], badges: ["limited"] },
  ],
  men: [
    { name: "Oxford Cotton Shirt", price: 2190, material: "Cotton", colors: ["White", "Light Blue"], sizes: ["M", "L", "XL"], tags: ["shirt"] },
    { name: "Slim Fit Chinos", price: 2490, material: "Cotton twill", colors: ["Khaki", "Navy"], sizes: ["30", "32", "34", "36"], tags: ["chinos"] },
    { name: "Merino Wool Sweater", price: 3990, material: "Merino wool", colors: ["Charcoal", "Oatmeal"], sizes: ["M", "L", "XL"], tags: ["sweater"], badges: ["new"] },
    { name: "Selvedge Denim Jeans", price: 4490, material: "Selvedge denim", colors: ["Indigo"], sizes: ["30", "32", "34"], tags: ["jeans", "denim"], badges: ["bestseller"] },
    { name: "Linen Blend Blazer", price: 5990, material: "Linen blend", colors: ["Stone"], sizes: ["M", "L", "XL"], tags: ["blazer"] },
    { name: "Crewneck T-Shirt", price: 1290, material: "Pima cotton", colors: ["Black", "White", "Olive"], sizes: ["S", "M", "L", "XL"], tags: ["t-shirt"] },
    { name: "Tapered Track Pants", price: 2290, compareAtPrice: 2890, material: "French terry", colors: ["Grey"], sizes: ["M", "L", "XL"], tags: ["pants"], badges: ["sale"] },
    { name: "Bomber Jacket", price: 4290, material: "Nylon", colors: ["Black", "Olive"], sizes: ["M", "L", "XL"], tags: ["jacket"] },
    { name: "Formal Trousers", price: 2790, material: "Wool blend", colors: ["Charcoal", "Navy"], sizes: ["30", "32", "34"], tags: ["trousers", "formal"] },
    { name: "Henley Long Sleeve", price: 1690, material: "Cotton", colors: ["Rust", "Navy"], sizes: ["S", "M", "L"], tags: ["henley"] },
  ],
  accessories: [
    { name: "Leather Card Holder", price: 1290, material: "Full-grain leather", colors: ["Black", "Tan"], sizes: [], tags: ["wallet"] },
    { name: "Silk Twill Scarf", price: 1890, material: "Silk", colors: ["Emerald", "Burgundy"], sizes: [], tags: ["scarf"], badges: ["new"] },
    { name: "Beaded Statement Necklace", price: 1590, material: "Glass bead", colors: ["Multicolor"], sizes: [], tags: ["jewelry"] },
    { name: "Minimalist Watch", price: 4990, material: "Stainless steel", colors: ["Silver", "Gold"], sizes: [], tags: ["watch"], badges: ["bestseller"] },
    { name: "Woven Leather Belt", price: 1690, material: "Leather", colors: ["Brown", "Black"], sizes: ["M", "L"], tags: ["belt"] },
    { name: "Round Acetate Sunglasses", price: 1990, material: "Acetate", colors: ["Tortoise"], sizes: [], tags: ["sunglasses"] },
  ],
  shoes: [
    { name: "Leather Chelsea Boots", price: 4490, material: "Leather", colors: ["Black", "Brown"], sizes: ["40", "41", "42", "43"], tags: ["boots"] },
    { name: "Canvas Low-Top Sneakers", price: 2290, material: "Canvas", colors: ["White", "Black"], sizes: ["38", "39", "40", "41", "42"], tags: ["sneakers"], badges: ["bestseller"] },
    { name: "Block Heel Sandals", price: 2890, material: "Leather", colors: ["Nude", "Black"], sizes: ["36", "37", "38", "39"], tags: ["sandals"] },
    { name: "Woven Espadrilles", price: 1990, material: "Jute", colors: ["Natural"], sizes: ["37", "38", "39", "40"], tags: ["espadrilles"], badges: ["new"] },
    { name: "Suede Loafers", price: 3290, material: "Suede", colors: ["Tan", "Navy"], sizes: ["40", "41", "42"], tags: ["loafers"] },
  ],
  bags: [
    { name: "Structured Tote", price: 3990, material: "Vegan leather", colors: ["Black", "Camel"], sizes: [], tags: ["tote"], badges: ["bestseller"] },
    { name: "Crossbody Mini Bag", price: 2490, material: "Leather", colors: ["Black", "Rust"], sizes: [], tags: ["crossbody"] },
    { name: "Leather Weekender", price: 5990, material: "Full-grain leather", colors: ["Tan"], sizes: [], tags: ["weekender"], badges: ["limited"] },
    { name: "Woven Straw Bag", price: 1890, material: "Straw", colors: ["Natural"], sizes: [], tags: ["straw"], badges: ["new"] },
    { name: "Leather Belt Bag", price: 2190, material: "Leather", colors: ["Black", "Tan"], sizes: [], tags: ["belt bag"] },
  ],
  beauty: [
    { name: "Rose Water Face Mist", price: 890, material: "—", colors: [], sizes: [], tags: ["skincare"] },
    { name: "Argan Hair Oil", price: 1190, material: "—", colors: [], sizes: [], tags: ["haircare"] },
    { name: "Matte Lip Tint", price: 690, material: "—", colors: ["Rosewood", "Brick"], sizes: [], tags: ["makeup"], badges: ["new"] },
    { name: "Mineral Sunscreen SPF50", price: 990, material: "—", colors: [], sizes: [], tags: ["skincare"] },
  ],
};

const BRANDS: {
  name: string;
  description: string;
  categorySlug: CategorySlug;
  ownerEmail: string;
}[] = [
  { name: "Anondo Studio", description: "Minimalist womenswear built around considered, wearable silhouettes.", categorySlug: "women", ownerEmail: "seller.anondo@maison.test" },
  { name: "Rong Atelier", description: "Color-forward contemporary fashion for women who dress with intention.", categorySlug: "women", ownerEmail: "seller.rong@maison.test" },
  { name: "Noor & Co.", description: "Modern modest wear with clean lines and quiet detailing.", categorySlug: "women", ownerEmail: "seller.noor@maison.test" },
  { name: "Dhaka Standard", description: "Menswear basics, elevated -- built to be worn on repeat.", categorySlug: "men", ownerEmail: "seller.dhakastandard@maison.test" },
  { name: "Bishwo Denim", description: "Premium selvedge and stretch denim, cut for everyday movement.", categorySlug: "men", ownerEmail: "seller.bishwo@maison.test" },
  { name: "Charukola", description: "Artisanal accessories made in small batches with local craftspeople.", categorySlug: "accessories", ownerEmail: "seller.charukola@maison.test" },
  { name: "Silk Route Studio", description: "Jamdani-inspired textiles reinterpreted for contemporary wardrobes.", categorySlug: "accessories", ownerEmail: "seller.silkroute@maison.test" },
  { name: "Ferro", description: "A footwear label focused on clean construction and all-day comfort.", categorySlug: "shoes", ownerEmail: "seller.ferro@maison.test" },
  { name: "Maya Leather", description: "Bags and leather goods made to age well, not just look good on day one.", categorySlug: "bags", ownerEmail: "seller.maya@maison.test" },
  { name: "Lin & Loom", description: "Slow-made basics from natural fibers, sized for real bodies.", categorySlug: "men", ownerEmail: "seller.linloom@maison.test" },
  { name: "Utsho", description: "Occasion and festive wear that doesn't take itself too seriously.", categorySlug: "women", ownerEmail: "seller.utsho@maison.test" },
  { name: "Verdant Skin", description: "Botanical, fragrance-forward beauty essentials made for humid climates.", categorySlug: "beauty", ownerEmail: "seller.verdant@maison.test" },
];

const SAMPLE_CUSTOMERS = [
  { name: "Farhana Ahmed", email: "farhana@example.test" },
  { name: "Tanvir Rahman", email: "tanvir@example.test" },
  { name: "Nusrat Jahan", email: "nusrat@example.test" },
];

async function run() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected. Clearing existing seed collections...");

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  // --- Admin ---
  // Admin created for completeness (login credentials logged at the end) --
  // not otherwise referenced in this script.
  await User.create({
    name: "MAISON Admin",
    email: "admin@maison.test",
    passwordHash: await hashPassword("Password123!"),
    role: "admin",
    emailVerified: true,
  });

  // --- Categories ---
  const categoryDocs = await Category.insertMany(
    TOP_CATEGORIES.map((name, order) => ({
      name,
      slug: slugify(name),
      parent: null,
      order,
    })),
  );
  const categoryBySlug = new Map(categoryDocs.map((c) => [c.slug, c]));

  // --- Sellers + Brands ---
  const brandDocs = [];
  for (const brand of BRANDS) {
    const seller = await User.create({
      name: `${brand.name} Team`,
      email: brand.ownerEmail,
      passwordHash: await hashPassword("Password123!"),
      role: "seller",
      emailVerified: true,
    });

    const brandDoc = await Brand.create({
      owner: seller._id,
      name: brand.name,
      slug: slugify(brand.name),
      description: brand.description,
      category: TOP_CATEGORIES.find((c) => slugify(c) === brand.categorySlug),
      status: "approved",
      commissionRate: 15,
    });

    brandDocs.push({ brand: brandDoc, seller, categorySlug: brand.categorySlug });
  }

  // --- Products ---
  let productCount = 0;
  const allProducts = [];
  for (const { brand, seller, categorySlug } of brandDocs) {
    const templates = CATEGORY_PRODUCTS[categorySlug];
    const category = categoryBySlug.get(categorySlug);
    if (!category) continue;

    for (const template of templates) {
      const product = await Product.create({
        seller: seller._id,
        brand: brand._id,
        category: category._id,
        name: template.name,
        slug: `${slugify(template.name)}-${slugify(brand.name)}`,
        description: `${template.name} from ${brand.name}, crafted in ${template.material}. Designed in Dhaka for everyday wear.`,
        sku: `${brand.slug.slice(0, 4).toUpperCase()}-${slugify(template.name).slice(0, 6).toUpperCase()}-${productCount}`,
        price: template.price,
        compareAtPrice: template.compareAtPrice ?? null,
        images: ["placeholder"],
        colors: template.colors,
        sizes: template.sizes.map((size) => ({ size, stock: 15 })),
        material: template.material,
        tags: template.tags,
        badges: template.badges ?? [],
        status: "approved",
        ratingAverage: 0,
        ratingCount: 0,
        totalSold: Math.floor(Math.random() * 120),
        viewCount: Math.floor(Math.random() * 800),
      });
      allProducts.push(product);
      productCount += 1;
    }
  }

  // --- Customers, a sample order, and a review ---
  const customers = [];
  for (const c of SAMPLE_CUSTOMERS) {
    const customer = await User.create({
      name: c.name,
      email: c.email,
      passwordHash: await hashPassword("Password123!"),
      role: "customer",
      emailVerified: true,
      addresses: [
        {
          label: "Home",
          fullName: c.name,
          phone: "01812345678",
          addressLine: "House 12, Road 5, Dhanmondi",
          city: "Dhaka",
          area: "Dhanmondi",
          postalCode: "1209",
          isDefault: true,
        },
      ],
    });
    customers.push(customer);
  }

  const orderProduct = allProducts[0];
  const orderBrand = brandDocs[0];
  if (orderProduct && orderBrand && customers[0]) {
    const commissionRate = orderBrand.brand.commissionRate;
    const commissionAmount = Math.round((orderProduct.price * commissionRate) / 100);

    const order = await Order.create({
      user: customers[0]._id,
      items: [
        {
          product: orderProduct._id,
          seller: orderBrand.seller._id,
          name: orderProduct.name,
          image: orderProduct.images[0],
          quantity: 1,
          price: orderProduct.price,
          commissionRate,
          commissionAmount,
          sellerPayout: orderProduct.price - commissionAmount,
        },
      ],
      subtotal: orderProduct.price,
      shippingFee: 0,
      discount: 0,
      total: orderProduct.price,
      shippingAddress: {
        fullName: customers[0].name,
        phone: "01812345678",
        addressLine: "House 12, Road 5, Dhanmondi",
        city: "Dhaka",
        area: "Dhanmondi",
        postalCode: "1209",
      },
      paymentMethod: "bkash",
      paymentStatus: "paid",
      status: "delivered",
    });

    await Review.create({
      product: orderProduct._id,
      user: customers[0]._id,
      order: order._id,
      rating: 5,
      title: "Better than expected",
      comment: "The fit and fabric feel genuinely premium -- true to size and arrived quickly.",
      images: [],
      verifiedPurchase: true,
    });

    await Product.updateOne(
      { _id: orderProduct._id },
      { $set: { ratingAverage: 5, ratingCount: 1 }, $inc: { totalSold: 1 } },
    );
  }

  console.log(`Seed complete:`);
  console.log(`  Admin:      admin@maison.test / Password123!`);
  console.log(`  Categories: ${categoryDocs.length}`);
  console.log(`  Brands:     ${brandDocs.length}`);
  console.log(`  Products:   ${productCount}`);
  console.log(`  Customers:  ${customers.length} (password: Password123!)`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

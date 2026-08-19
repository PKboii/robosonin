/* ------------------------------------------------------------------ */
/*  Real Roboson catalogue — names, prices (INR), copy and links      */
/*  sourced from https://roboson.in (live store).                     */
/* ------------------------------------------------------------------ */

export interface ProductLabel {
  id: string;
  name: string;
  sub: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  category: "Cleaning" | "Fabric Care" | "Mother & Baby";
  price: number;
  compareAt: number;
  url: string;
  image: string;
  blurb: string;
  specs: string[];
  badge?: string;
  labels?: ProductLabel[];
  variants?: string[];
}

const cdn = (file: string) =>
  `https://roboson.in/cdn/shop/files/${file}`;

export const PRODUCTS: Product[] = [
  {
    id: "spin-mop",
    name: "Electric Spin Mop",
    shortName: "Spin Mop",
    category: "Cleaning",
    price: 3999,
    compareAt: 7499,
    url: "https://roboson.in/products/electric-spin-mop",
    image: cdn("Spin_Mop_Gray_Bg.jpg?v=1768405927&width=900"),
    blurb:
      "Cordless, high-efficient and ultra-quiet — hassle-free floor cleaning with dual spinning mop heads.",
    specs: [
      "Cordless, rechargeable operation",
      "Ultra-quiet motor",
      "Dual spinning mop heads",
      "Washable microfibre pads",
      "1-year warranty",
    ],
    badge: "Best Seller",
    labels: [
      { id: "mop-handle", name: "Telescopic handle", sub: "Adjustable reach" },
      { id: "mop-motor", name: "Motor housing", sub: "Ultra-quiet drive" },
      { id: "mop-battery", name: "Battery pack", sub: "Cordless · rechargeable" },
      { id: "mop-heads", name: "Dual spin heads", sub: "Counter-rotating" },
      { id: "mop-pads", name: "Microfibre pads", sub: "Machine washable" },
    ],
  },
  {
    id: "spin-scrubber",
    name: "Electric Spin Scrubber",
    shortName: "Spin Scrubber",
    category: "Cleaning",
    price: 2199,
    compareAt: 5299,
    url: "https://roboson.in/products/electric-spin-scrubber",
    image: cdn("Spi_Scrubber_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "Powerful performance for efficient cleaning — equipped with a powerful 25W motor and interchangeable brushes.",
    specs: [
      "Powerful 25W motor",
      "Interchangeable brush heads",
      "Rechargeable & cordless",
      "For bathroom, kitchen & tiles",
      "1-year warranty",
    ],
  },
  {
    id: "vc201",
    name: "VC201 Handheld Cordless Vacuum Cleaner",
    shortName: "VC201 Vacuum",
    category: "Cleaning",
    price: 2499,
    compareAt: 4399,
    url: "https://roboson.in/products/roboson-vc201-handheld-cordless-vacuum-cleaner-for-home-and-car-portable-mini-pump-with-powerful-6-kpa-suction-for-dust-pet-hair-removal-rechargeable-and-wireless-wet-dry-feature-for-bed-and-sofa",
    image: cdn("VAccum_Cleaner_Gray_Bg.jpg?v=1768405227&width=900"),
    blurb:
      "Powerful 6,000 Pa suction from a 110W motor — portable, rechargeable, with wet & dry pickup for home and car.",
    specs: [
      "6,000 Pa (6 kPa) suction",
      "110W motor",
      "Wet & dry feature — bed and sofa",
      "Rechargeable & wireless",
      "Dust & pet hair removal",
      "1-year warranty",
    ],
    labels: [
      { id: "vac-nozzle", name: "Nozzle", sub: "Wet & dry pickup" },
      { id: "vac-cup", name: "Dust cup", sub: "One-touch empty" },
      { id: "vac-filter", name: "Washable filter", sub: "Fine dust capture" },
      { id: "vac-motor", name: "110W motor", sub: "6,000 Pa suction" },
      { id: "vac-battery", name: "Battery", sub: "Rechargeable · wireless" },
    ],
  },
  {
    id: "vc101",
    name: "VC101 Car Vacuum Cleaner",
    shortName: "Car Vacuum",
    category: "Cleaning",
    price: 1499,
    compareAt: 2499,
    url: "https://roboson.in/products/roboson-vc101-car-vacuum-cleaner-portable-handheld-vacuum-cleaner-with-powerful-5000-pa-suction-12v-dc-110w-long-4-5m-cord-mini-car-air-pump-for-deep-cleaning-1-year-warranty",
    image: cdn("CAr_VAccum_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "Equipped with a robust 12V DC / 110W motor delivering strong 5,000 Pa suction, with a long 4.5m cord for deep cleaning.",
    specs: [
      "5,000 Pa suction",
      "12V DC · 110W motor",
      "Long 4.5m cord",
      "Portable handheld design",
      "1-year warranty",
    ],
  },
  {
    id: "steamer",
    name: "Handheld Garment Steamer",
    shortName: "Garment Steamer",
    category: "Fabric Care",
    price: 2499,
    compareAt: 4299,
    url: "https://roboson.in/products/roboson-handheld-garment-steamer-for-clothes-steam-iron-press-compact-portable-convenient-vertical-steaming-powerful-1800-watt-220ml-water-tank-1-9m-power-cord-15-sec-quick-heat-up-1-year-warranty",
    image: cdn("Garment_Steamer_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "1800 watts of powerful high-pressure steam up to 32g/min — vertical steaming with a 15-second quick heat-up.",
    specs: [
      "1800W high-pressure steam",
      "Up to 32g/min steam output",
      "220ml water tank",
      "15-second quick heat-up",
      "1.9m power cord",
      "1-year warranty",
    ],
  },
  {
    id: "hot-air-brush",
    name: "Volumizer Hair Dryer & Hot Air Brush",
    shortName: "Hot Air Brush",
    category: "Fabric Care",
    price: 1899,
    compareAt: 3699,
    url: "https://roboson.in/products/roboson-professional-volumizer-hair-dryer-1200-watts-hot-air-brush-one-step-styler-for-women-with-3-temperature-2-speed-settings-3-in-1-blow-dryer-straightener-and-curler-1-year-warranty",
    image: cdn("Hot_Air_Brush_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "All-in-one hair styling — 1200W hot air brush, a one-step styler with 3 temperature and 2 speed settings.",
    specs: [
      "1200W hot air styling",
      "3 temperature · 2 speed settings",
      "3-in-1: dryer, straightener, curler",
      "One-step volumizer brush",
      "1-year warranty",
    ],
  },
  {
    id: "evo-maroon",
    name: "Wearable Electric Breast Pump (Evo) — Maroon",
    shortName: "Evo · Maroon",
    category: "Mother & Baby",
    price: 5699,
    compareAt: 9999,
    url: "https://roboson.in/products/wearable-electric-breast-pump-evo",
    image: cdn("Evo_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "India's most slimmest & advanced wearable breast pump — the 3rd-generation Roboson Evo in Maroon.",
    specs: [
      "India's slimmest & most advanced",
      "3rd-generation Evo platform",
      "Hands-free wearable design",
      "Compact, quiet operation",
      "1-year warranty",
    ],
    badge: "New · 3rd Gen",
    variants: ["Maroon", "White"],
    labels: [
      { id: "evo-shell", name: "Outer shell", sub: "Slim, wearable profile" },
      { id: "evo-flange", name: "Silicone flange", sub: "Soft fit" },
      { id: "evo-membrane", name: "Membrane", sub: "Gentle suction" },
      { id: "evo-cup", name: "Milk cup", sub: "Food-grade · BPA-free" },
      { id: "evo-unit", name: "Pump unit", sub: "Quiet · one-touch" },
    ],
  },
  {
    id: "evo-white",
    name: "Wearable Electric Breast Pump (Evo) — White",
    shortName: "Evo · White",
    category: "Mother & Baby",
    price: 5199,
    compareAt: 9999,
    url: "https://roboson.in/products/wearable-electric-breast-pump-evo-1",
    image: cdn("Evo_White_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "India's most slimmest & advanced wearable breast pump — the 3rd-generation Roboson Evo in White.",
    specs: [
      "India's slimmest & most advanced",
      "3rd-generation Evo platform",
      "Hands-free wearable design",
      "Compact, quiet operation",
      "1-year warranty",
    ],
    variants: ["White", "Maroon"],
  },
  {
    id: "bp-111",
    name: "Wearable Electric Breast Pump (BP-111)",
    shortName: "BP-111",
    category: "Mother & Baby",
    price: 3299,
    compareAt: 5299,
    url: "https://roboson.in/products/roboson-wearable-electric-breast-pump-automatic-electrical-milk-feeding-pumping-machine-with-3-modes-9-levels-portable-compact-rechargeable-with-large-1400-mah-battery-digital-touch-screen-milk-cup-of-150-ml-bpa-free1-year-warranty",
    image: cdn("BP-111_Gray_Bg.jpg?v=1768405226&width=900"),
    blurb:
      "Effortless hands-free pumping with 3 modes and 9 suction levels, a 1400mAh battery and a 150ml BPA-free milk cup.",
    specs: [
      "3 modes · 9 suction levels",
      "Large 1400mAh rechargeable battery",
      "150ml BPA-free milk cup",
      "Digital touch screen",
      "Portable & compact",
      "1-year warranty",
    ],
  },
  {
    id: "bp-222",
    name: "Wearable Electric Breast Pump (BP-222)",
    shortName: "BP-222",
    category: "Mother & Baby",
    price: 4299,
    compareAt: 8299,
    url: "https://roboson.in/products/wearable-breast-pump-bp-222",
    image: cdn("Image_3.jpg?v=1768405969&width=900"),
    blurb:
      "Effortless hands-free pumping — true multitasking freedom with the latest compact wearable breast pump.",
    specs: [
      "Hands-free wearable pumping",
      "Compact & portable",
      "Rechargeable battery",
      "Quiet operation",
      "1-year warranty",
    ],
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/*  Showroom zones — the camera journey                               */
/* ------------------------------------------------------------------ */

export interface Zone {
  id: string;
  rail: string;
  kicker: string;
  title: string;
  sub: string;
  t0: number;
  t1: number;
  productId?: string;
}

export const ZONES: Zone[] = [
  {
    id: "entry",
    rail: "Entrance",
    kicker: "The Roboson showroom",
    title: "Designed for everyday life.",
    sub: "Scroll to walk in",
    t0: 0.0,
    t1: 0.1,
  },
  {
    id: "mop",
    rail: "Spin Mop",
    kicker: "01 — Cleaning laboratory",
    title: "Inside the Electric Spin Mop.",
    sub: "Cordless · High-efficient · Ultra-quiet",
    t0: 0.1,
    t1: 0.36,
    productId: "spin-mop",
  },
  {
    id: "scrubber",
    rail: "Scrubber",
    kicker: "01 — Cleaning laboratory",
    title: "One handle, every surface.",
    sub: "25W motor · Interchangeable brushes",
    t0: 0.36,
    t1: 0.5,
    productId: "spin-scrubber",
  },
  {
    id: "vacuum",
    rail: "VC201",
    kicker: "01 — Cleaning laboratory",
    title: "VC201, opened up.",
    sub: "6,000 Pa suction · Wet & dry",
    t0: 0.5,
    t1: 0.62,
    productId: "vc201",
  },
  {
    id: "carvac",
    rail: "Car Vacuum",
    kicker: "01 — Cleaning laboratory",
    title: "Deep clean, seat to floor.",
    sub: "VC101 · 5,000 Pa · 4.5m cord",
    t0: 0.62,
    t1: 0.73,
    productId: "vc101",
  },
  {
    id: "steamer",
    rail: "Steamer",
    kicker: "02 — Fabric care studio",
    title: "Steam, ready in 15 seconds.",
    sub: "1800W · up to 32g/min · 220ml tank",
    t0: 0.73,
    t1: 0.82,
    productId: "steamer",
  },
  {
    id: "evo",
    rail: "Mother & Baby",
    kicker: "03 — Mother & baby studio",
    title: "Evo. Third generation.",
    sub: "India's slimmest & most advanced — with BP-222 and BP-111 beside it",
    t0: 0.82,
    t1: 0.965,
    productId: "evo-maroon",
  },
  {
    id: "finale",
    rail: "Shop",
    kicker: "The full collection",
    title: "Choose what fits your day.",
    sub: "Everyday made easier",
    t0: 0.965,
    t1: 1.0,
  },
];

export const zoneAt = (p: number): Zone =>
  ZONES.find((z) => p >= z.t0 && p < z.t1) ?? ZONES[ZONES.length - 1];

export const REAL_STORE = {
  logo: "https://roboson.in/cdn/shop/files/Roboson_logo_Website_7fed9a54-32c9-49e4-83f1-d5670c03b85f.png?v=1718196617",
  home: "https://roboson.in/",
  shopAll: "https://roboson.in/collections/all-products",
  breastPumps: "https://roboson.in/collections/electric-breast-pump",
  cart: "https://roboson.in/cart",
  support: "https://roboson.in/pages/contact",
  warranty: "https://roboson.in/pages/warranty-guidelines",
  shipping: "https://roboson.in/pages/shipping-return-policies",
};

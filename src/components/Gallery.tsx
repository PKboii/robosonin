import { useState, type SyntheticEvent } from "react";
import {
  PRODUCTS,
  REAL_STORE,
  formatINR,
  type Product,
} from "../data/products";
import { useCart } from "../cart/CartContext";

function SmartImg({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const onError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    setFailed(true);
  };
  return (
    <div className="img-tile relative h-full w-full">
      {!failed && <img src={src} alt={alt} loading="lazy" onError={onError} className="h-full w-full object-cover" />}
      {failed && (
        <div className="flex h-full w-full items-center justify-center">
          <svg width="34" height="34" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#1b1d1f" />
            <circle cx="16" cy="16" r="8.5" fill="none" stroke="#e8490f" strokeWidth="3" />
          </svg>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onView,
  index,
}: {
  product: Product;
  onView: (p: Product) => void;
  index: number;
}) {
  const cart = useCart();
  const discount = Math.round((1 - product.price / product.compareAt) * 100);
  return (
    <article
      className="rise-in group flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-plinth)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        onClick={() => onView(product)}
        className="img-tile relative block aspect-[4/3] w-full overflow-hidden text-left"
        aria-label={`View ${product.name}`}
      >
        <SmartImg src={product.image} alt={product.name} />
        <span className="absolute left-3 top-3 bg-ink/90 px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.16em] text-cream">
          −{discount}%
        </span>
        {product.badge && (
          <span className="absolute right-3 top-3 bg-flame px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.14em] text-white">
            {product.badge.toUpperCase()}
          </span>
        )}
        <span className="absolute bottom-3 right-3 translate-y-2 rounded-full bg-cream/95 px-3 py-1 font-display text-[10px] font-bold tracking-[0.12em] text-ink opacity-0 shadow transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          QUICK VIEW
        </span>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-display text-[9px] font-semibold tracking-[0.22em] text-flame">
          {product.category.toUpperCase()}
        </p>
        <h3 className="mt-1 font-display text-sm font-bold leading-snug text-ink">
          <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {product.name}
          </a>
        </h3>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">{formatINR(product.price)}</span>
          <span className="text-xs text-smoke line-through">{formatINR(product.compareAt)}</span>
        </p>
        <div className="mt-3 flex gap-2 pt-1">
          <button
            onClick={() => onView(product)}
            className="flex-1 rounded-lg border border-ink/15 px-2 py-2 font-display text-[11px] font-bold tracking-wide text-ink transition hover:border-ink hover:bg-ink hover:text-cream active:scale-95"
          >
            VIEW
          </button>
          <button
            onClick={() => cart.add(product.id, 1, product.variants?.[0])}
            className="flex-1 rounded-lg bg-flame px-2 py-2 font-display text-[11px] font-bold tracking-wide text-white transition hover:bg-ember active:scale-95"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </article>
  );
}

export function GalleryGrid({ onView }: { onView: (p: Product) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {PRODUCTS.map((p, i) => (
        <ProductCard key={p.id} product={p} onView={onView} index={i} />
      ))}
    </div>
  );
}

export function GalleryFooter() {
  return (
    <footer className="mt-14 border-t border-ink/10 pt-10 text-sm">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="7" fill="#1b1d1f" />
              <circle cx="16" cy="16" r="8.5" fill="none" stroke="#e8490f" strokeWidth="3" />
              <circle cx="16" cy="16" r="2.4" fill="#f1f2ef" />
            </svg>
            <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">ROBOSON</span>
          </div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-smoke">
            Crafted with care. Built for mothers. Everyday appliances engineered to make daily
            life a little easier.
          </p>
        </div>
        <div>
          <p className="font-display text-[11px] font-bold tracking-[0.22em] text-ink">SHOP</p>
          <ul className="mt-3 space-y-2 text-[13px] text-graphite">
            <li><a className="hover:text-flame" href={REAL_STORE.shopAll} target="_blank" rel="noopener noreferrer">Shop All</a></li>
            <li><a className="hover:text-flame" href={REAL_STORE.breastPumps} target="_blank" rel="noopener noreferrer">Wearable Breast Pumps</a></li>
            <li><a className="hover:text-flame" href="https://roboson.in/products/electric-spin-mop" target="_blank" rel="noopener noreferrer">Electric Spin Mop</a></li>
            <li><a className="hover:text-flame" href="https://roboson.in/products/electric-spin-scrubber" target="_blank" rel="noopener noreferrer">Electric Spin Scrubber</a></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-[11px] font-bold tracking-[0.22em] text-ink">COMPANY</p>
          <ul className="mt-3 space-y-2 text-[13px] text-graphite">
            <li><a className="hover:text-flame" href={REAL_STORE.warranty} target="_blank" rel="noopener noreferrer">Warranty Guidelines</a></li>
            <li><a className="hover:text-flame" href={REAL_STORE.shipping} target="_blank" rel="noopener noreferrer">Shipping & Returns</a></li>
            <li><a className="hover:text-flame" href={REAL_STORE.support} target="_blank" rel="noopener noreferrer">FAQ & Contact</a></li>
            <li><a className="hover:text-flame" href={REAL_STORE.home} target="_blank" rel="noopener noreferrer">roboson.in</a></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-[11px] font-bold tracking-[0.22em] text-ink">PROMISE</p>
          <ul className="mt-3 space-y-2 text-[13px] text-graphite">
            <li>· Free shipping on orders over ₹500</li>
            <li>· 1-year warranty on every product</li>
            <li>· Secure checkout on roboson.in</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-ink/10 py-5 text-[11px] text-smoke md:flex-row">
        <span>Copyright © 2026 Roboson. All rights reserved. This showroom is a presentation layer over the official roboson.in store.</span>
        <span className="font-display tracking-[0.2em]">EVERYDAY MADE EASIER</span>
      </div>
    </footer>
  );
}

/* ---------------- No-WebGL fallback page ---------------- */

export function FallbackPage({ onView }: { onView: (p: Product) => void }) {
  return (
    <main className="min-h-screen bg-paper">
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-28 text-center md:pt-36">
        <p className="font-display text-[11px] font-semibold tracking-[0.4em] text-flame">
          THE DIGITAL SHOWROOM
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-ink md:text-6xl">
          ROBOSON
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-smoke">
          Designed for everyday life. Your browser is running without 3D support, so here is the
          full collection — every product, every price, ready to shop.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20" aria-label="All products">
        <GalleryGrid onView={onView} />
        <GalleryFooter />
      </section>
    </main>
  );
}

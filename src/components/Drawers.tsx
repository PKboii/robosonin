import { useEffect, useState } from "react";
import {
  REAL_STORE,
  formatINR,
  productById,
  type Product,
} from "../data/products";
import { useCart } from "../cart/CartContext";
import { tick } from "../lib/audio";

function useEsc(onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, onClose]);
}

function Backdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className={`drawer-backdrop fixed inset-0 z-50 bg-ink/45 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
    />
  );
}

/* ---------------- Product drawer ---------------- */

export function ProductDrawer({
  product,
  onClose,
  onAdded,
}: {
  product: Product | null;
  onClose: () => void;
  onAdded: () => void;
}) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string | undefined>(undefined);

  useEffect(() => {
    setQty(1);
    setVariant(product?.variants?.[0]);
  }, [product]);

  useEsc(onClose, !!product);
  const open = !!product;
  if (!product) return <Backdrop open={false} onClose={onClose} />;

  const altVariantProduct =
    product.id === "evo-maroon" && variant === "White" ? productById("evo-white") : undefined;
  const active = altVariantProduct ?? product;
  const discount = Math.round((1 - active.price / active.compareAt) * 100);
  const buyUrl = active.url;

  return (
    <>
      <Backdrop open={open} onClose={onClose} />
      <aside
        role="dialog"
        aria-label={product.name}
        className={`drawer-panel fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-cream shadow-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="img-tile relative h-64 flex-none overflow-hidden">
          <img
            src={active.image}
            alt={active.name}
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => { tick(); onClose(); }}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/85 text-cream transition hover:bg-flame"
            aria-label="Close product details"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <span className="absolute left-4 top-4 bg-flame px-2.5 py-1 font-display text-[10px] font-bold tracking-[0.14em] text-white">
            SAVE {discount}%
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="font-display text-[10px] font-semibold tracking-[0.26em] text-flame">
            {product.category.toUpperCase()}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-ink">
            {active.name}
          </h2>
          <p className="mt-2 flex items-baseline gap-2.5">
            <span className="font-display text-2xl font-bold text-ink">{formatINR(active.price)}</span>
            <span className="text-sm text-smoke line-through">{formatINR(active.compareAt)}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-graphite">{product.blurb}</p>

          {product.variants && (
            <div className="mt-5">
              <p className="font-display text-[11px] font-semibold tracking-[0.2em] text-graphite">
                COLOUR — {variant?.toUpperCase()}
              </p>
              <div className="mt-2 flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`rounded-lg border px-4 py-2 font-display text-xs font-semibold transition ${
                      variant === v
                        ? "border-flame bg-flame text-white"
                        : "border-ink/15 text-graphite hover:border-ink"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="font-display text-[11px] font-semibold tracking-[0.2em] text-graphite">
              KEY SPECIFICATIONS
            </p>
            <ul className="mt-2 space-y-1.5">
              {product.specs.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-graphite">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-flame" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-none border-t border-ink/10 bg-paper px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-ink/15">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 font-display text-sm font-bold text-graphite transition hover:text-flame"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-7 text-center font-display text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2.5 font-display text-sm font-bold text-graphite transition hover:text-flame"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                cart.add(active.id, qty, variant);
                onAdded();
              }}
              className="flex-1 rounded-lg bg-ink px-4 py-3 font-display text-xs font-bold tracking-[0.12em] text-cream transition hover:bg-flame active:scale-[0.98]"
            >
              ADD TO CART — {formatINR(active.price * qty)}
            </button>
          </div>
          <div className="mt-2.5 flex gap-3">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-flame px-4 py-2.5 text-center font-display text-xs font-bold tracking-[0.12em] text-white transition hover:bg-ember"
            >
              BUY NOW
            </a>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-ink/15 px-4 py-2.5 text-center font-display text-xs font-bold tracking-[0.12em] text-ink transition hover:border-ink"
            >
              FULL DETAILS ↗
            </a>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-smoke">
            Checkout completes securely on roboson.in · Free shipping over ₹500 · 1-year warranty
          </p>
        </div>
      </aside>
    </>
  );
}

/* ---------------- Cart drawer ---------------- */

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useCart();
  useEsc(onClose, open);

  return (
    <>
      <Backdrop open={open} onClose={onClose} />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`drawer-panel fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-cream shadow-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Your Cart</h2>
            <p className="text-xs text-smoke">
              {cart.count === 0 ? "Nothing here yet" : `${cart.count} item${cart.count > 1 ? "s" : ""} from the showroom`}
            </p>
          </div>
          <button
            onClick={() => { tick(); onClose(); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream transition hover:bg-flame"
            aria-label="Close cart"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6b7069" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="mt-4 font-display text-sm font-semibold text-graphite">
                Keep walking the showroom
              </p>
              <p className="mt-1 max-w-[220px] text-xs text-smoke">
                Every product you pass has an Add to Cart button — even mid-explosion.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((line) => {
                const p = productById(line.productId);
                if (!p) return null;
                const key = line.productId + (line.variant ?? "");
                return (
                  <li key={key} className="flex gap-3 rounded-xl border border-ink/8 bg-paper p-3">
                    <div className="img-tile h-20 w-20 flex-none overflow-hidden rounded-lg">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[13px] font-bold text-ink">{p.shortName}</p>
                      {line.variant && (
                        <p className="text-[11px] text-smoke">Colour: {line.variant}</p>
                      )}
                      <p className="mt-0.5 font-display text-sm font-bold text-ink">
                        {formatINR(p.price * line.qty)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex items-center rounded-md border border-ink/15 bg-cream">
                          <button
                            onClick={() => cart.setQty(line.productId, line.qty - 1, line.variant)}
                            className="px-2 py-1 text-xs font-bold text-graphite hover:text-flame"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{line.qty}</span>
                          <button
                            onClick={() => cart.setQty(line.productId, line.qty + 1, line.variant)}
                            className="px-2 py-1 text-xs font-bold text-graphite hover:text-flame"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => cart.remove(line.productId, line.variant)}
                          className="ml-auto text-[11px] font-semibold text-smoke underline-offset-2 hover:text-flame hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex-none border-t border-ink/10 bg-paper px-6 py-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-graphite">
              SUBTOTAL
            </span>
            <span className="font-display text-xl font-bold text-ink">{formatINR(cart.subtotal)}</span>
          </div>
          <p className="mt-1 text-[11px] text-smoke">
            {cart.subtotal >= 500
              ? "✓ Free shipping unlocked (orders over ₹500)"
              : "Shipping calculated at checkout on roboson.in"}
          </p>
          <a
            href={REAL_STORE.cart}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 block rounded-lg px-4 py-3 text-center font-display text-xs font-bold tracking-[0.14em] transition ${
              cart.count > 0
                ? "bg-flame text-white hover:bg-ember"
                : "pointer-events-none bg-stone text-smoke"
            }`}
          >
            CHECKOUT ON ROBOSON.IN ↗
          </a>
          <p className="mt-2 text-center text-[11px] text-smoke">
            Your selection is remembered here; payment & delivery are handled by the official Roboson store.
          </p>
        </div>
      </aside>
    </>
  );
}

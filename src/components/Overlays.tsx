import type { RefObject } from "react";
import { ZONES, formatINR, productById, type Product } from "../data/products";

/* ---------------- Intro ---------------- */

export function IntroOverlay({ refEl }: { refEl: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={refEl}
      className="pointer-events-none fixed inset-0 z-[45] flex flex-col items-center justify-center bg-paper transition-opacity duration-1000"
    >
      <div className="rise-in flex flex-col items-center px-6 text-center">
        <svg width="54" height="54" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="7" fill="#1b1d1f" />
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="#e8490f" strokeWidth="3" />
          <circle cx="16" cy="16" r="2.4" fill="#f1f2ef" />
        </svg>
        <p className="mt-6 font-display text-[11px] font-semibold tracking-[0.4em] text-flame">
          THE DIGITAL SHOWROOM
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-ink md:text-7xl">
          ROBOSON
        </h1>
        <p className="mt-4 max-w-sm font-body text-base text-smoke">
          Designed for everyday life. Walk in, watch the products open up, and shop without
          leaving the room.
        </p>
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="relative flex h-11 w-7 items-start justify-center rounded-full border-2 border-ink/30 p-1.5">
            <span className="scroll-cue-ring absolute inset-0 rounded-full border border-flame/60" />
            <span className="scroll-cue-drop h-2 w-1 rounded-full bg-flame" />
          </div>
          <span className="font-display text-[11px] font-semibold tracking-[0.3em] text-graphite">
            SCROLL TO ENTER
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Zone rail ---------------- */

export function ZoneRail({
  active,
  onJump,
}: {
  active: string;
  onJump: (t: number) => void;
}) {
  return (
    <nav
      aria-label="Showroom zones"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 md:flex lg:right-8"
    >
      {ZONES.map((z) => {
        const isActive = z.id === active;
        return (
          <button
            key={z.id}
            onClick={() => onJump(z.t0 + 0.012)}
            className="group flex items-center gap-3 rounded-full py-1.5 pl-3 pr-1"
            aria-label={`Go to ${z.rail}`}
          >
            <span
              className={`rail-label font-display text-[10px] font-semibold tracking-[0.22em] ${
                isActive ? "text-ink opacity-100" : "text-smoke opacity-0 group-hover:opacity-70"
              }`}
            >
              {z.rail.toUpperCase()}
            </span>
            <span
              className={`rail-dot block rounded-full border ${
                isActive
                  ? "h-3 w-3 border-flame bg-flame"
                  : "h-2.5 w-2.5 border-ink/30 bg-transparent group-hover:border-ink"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------- Product panel ---------------- */

export function ProductPanel({
  zoneId,
  onView,
  onAdd,
}: {
  zoneId: string;
  onView: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  const zone = ZONES.find((z) => z.id === zoneId);
  const product = zone?.productId ? productById(zone.productId) : undefined;
  if (!product || !zone) return null;

  return (
    <aside
      key={zone.id}
      className="rise-in fixed bottom-5 left-5 z-30 w-[min(92vw,360px)] md:bottom-8 md:left-10"
      aria-label={`${product.name} purchase panel`}
    >
      <div className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-ink/10 bg-cream/95 shadow-[var(--shadow-panel)] backdrop-blur-sm">
        <div className="img-tile relative w-24 flex-none md:w-28">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          {product.badge && (
            <span className="absolute left-0 top-2 bg-flame px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.14em] text-white">
              {product.badge.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-3.5 md:p-4">
          <p className="font-display text-[10px] font-semibold tracking-[0.2em] text-flame">
            {zone.kicker.split("—")[1]?.trim().toUpperCase() ?? product.category.toUpperCase()}
          </p>
          <h3 className="mt-0.5 truncate font-display text-[15px] font-bold text-ink md:text-base">
            {product.name}
          </h3>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-ink">{formatINR(product.price)}</span>
            <span className="text-xs text-smoke line-through">{formatINR(product.compareAt)}</span>
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => onView(product)}
              className="flex-1 rounded-lg border border-ink/15 px-3 py-2 font-display text-xs font-semibold tracking-wide text-ink transition hover:border-ink hover:bg-ink hover:text-cream active:scale-95"
            >
              View Product
            </button>
            <button
              onClick={() => onAdd(product)}
              className="flex-1 rounded-lg bg-flame px-3 py-2 font-display text-xs font-semibold tracking-wide text-white transition hover:bg-ember active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Projected 3D labels ---------------- */

const LABEL_SETS: { zone: string; items: { id: string; name: string; sub: string }[] }[] = [
  {
    zone: "mop",
    items: [
      { id: "mop-handle", name: "Telescopic handle", sub: "Adjustable reach" },
      { id: "mop-motor", name: "Motor housing", sub: "Ultra-quiet drive" },
      { id: "mop-battery", name: "Battery pack", sub: "Cordless · rechargeable" },
      { id: "mop-heads", name: "Dual spin heads", sub: "Counter-rotating" },
      { id: "mop-pads", name: "Microfibre pads", sub: "Machine washable" },
    ],
  },
  {
    zone: "vacuum",
    items: [
      { id: "vac-nozzle", name: "Nozzle", sub: "Wet & dry pickup" },
      { id: "vac-cup", name: "Dust cup", sub: "One-touch empty" },
      { id: "vac-filter", name: "Washable filter", sub: "Fine dust capture" },
      { id: "vac-motor", name: "110W motor", sub: "6,000 Pa suction" },
      { id: "vac-battery", name: "Battery", sub: "Rechargeable · wireless" },
    ],
  },
  {
    zone: "evo",
    items: [
      { id: "evo-shell", name: "Outer shell", sub: "Slim wearable profile" },
      { id: "evo-flange", name: "Silicone flange", sub: "Soft fit" },
      { id: "evo-membrane", name: "Membrane", sub: "Gentle suction" },
      { id: "evo-cup", name: "Milk cup", sub: "Food-grade · BPA-free" },
      { id: "evo-unit", name: "Pump unit", sub: "Quiet · one-touch" },
    ],
  },
];

export function LabelsLayer({ refEl }: { refEl: RefObject<HTMLDivElement> }) {
  return (
    <div ref={refEl} className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {LABEL_SETS.flatMap((s) =>
        s.items.map((l) => (
          <div key={l.id} data-label={l.id} className="label3d">
            <div className="label3d-inner">
              <span className="label3d-dot" />
              <span className="label3d-line" />
              <div className="label3d-text">
                <div className="label3d-name">{l.name}</div>
                <div className="label3d-sub">{l.sub}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- Cinematic copy ---------------- */

const COPY_POS: Record<string, string> = {
  entry: "left-1/2 top-[64%] -translate-x-1/2 text-center w-[min(92vw,620px)]",
  mop: "left-6 top-[16%] md:left-14 md:top-[18%] max-w-md",
  scrubber: "right-6 top-[16%] text-right md:right-14 md:top-[18%] max-w-md ml-auto",
  vacuum: "left-6 top-[16%] md:left-14 md:top-[20%] max-w-md",
  carvac: "right-6 top-[16%] text-right md:right-14 md:top-[20%] max-w-md ml-auto",
  steamer: "left-6 top-[16%] md:left-14 md:top-[18%] max-w-md",
  evo: "right-6 top-[16%] text-right md:right-14 md:top-[18%] max-w-md ml-auto",
};

export function CopyLayer({ refEl }: { refEl: RefObject<HTMLDivElement> }) {
  return (
    <div ref={refEl} className="pointer-events-none fixed inset-0 z-[15]">
      {ZONES.filter((z) => z.id !== "finale").map((z) => (
        <div key={z.id} data-copy={z.id} className={`copy-block ${COPY_POS[z.id] ?? ""}`}>
          <p className="font-display text-[10px] font-semibold tracking-[0.3em] text-flame md:text-[11px]">
            {z.kicker.toUpperCase()}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-tight text-ink md:text-5xl">
            {z.title}
          </h2>
          <p className="mt-2 font-body text-sm text-smoke md:text-base">{z.sub}</p>
          <div className="mt-3 h-[3px] w-10 bg-flame" />
        </div>
      ))}
    </div>
  );
}

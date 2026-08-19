import { useCallback, useEffect, useRef, useState } from "react";
import { CartProvider, useCart } from "./cart/CartContext";
import { ShowroomScene, type ScreenLabel } from "./three/ShowroomScene";
import { ZONES, type Product } from "./data/products";
import { tick, zoneChime } from "./lib/audio";
import Header from "./components/Header";
import {
  IntroOverlay,
  ZoneRail,
  ProductPanel,
  LabelsLayer,
  CopyLayer,
} from "./components/Overlays";
import { ProductDrawer, CartDrawer } from "./components/Drawers";
import { GalleryGrid, GalleryFooter, FallbackPage } from "./components/Gallery";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Showroom() {
  const cart = useCart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ShowroomScene | null>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introGone = useRef(false);
  const galleryOn = useRef(false);
  const compact = useRef(false);
  const reducedMotion = useRef(false);

  const [webglOK] = useState(detectWebGL);
  const [ready, setReady] = useState(false);
  const [zoneId, setZoneId] = useState("entry");
  const [headerCompact, setHeaderCompact] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrollH, setScrollH] = useState(940);
  const [galleryShown, setGalleryShown] = useState(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setScrollH(window.matchMedia("(max-width: 768px)").matches ? 660 : 940);
  }, []);

  const scrollToT = useCallback((t: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: clamp01(t) * max,
      behavior: reducedMotion.current ? "auto" : "smooth",
    });
  }, []);

  /* ---- frame-driven DOM updates (no React re-render) ---- */
  const handleFrame = useCallback((p: number, labels: ScreenLabel[]) => {
    // projected part labels
    const layer = labelsRef.current;
    if (layer) {
      const kids = layer.children;
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i] as HTMLElement;
        const l = labels.find((x) => x.id === el.dataset.label);
        if (!l) continue;
        el.style.opacity = l.a.toFixed(3);
        el.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0)`;
      }
    }

    // cinematic copy
    const copy = copyRef.current;
    if (copy) {
      const kids = copy.children;
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i] as HTMLElement;
        const z = ZONES.find((zz) => zz.id === el.dataset.copy);
        if (!z) continue;
        const a = smooth(z.t0 + 0.015, z.t0 + 0.06, p) * (1 - smooth(z.t1 - 0.05, z.t1 - 0.008, p));
        const dy = ((1 - a) * 22).toFixed(1);
        el.style.opacity = a.toFixed(3);
        el.style.transform =
          z.id === "entry" ? `translate(-50%, ${dy}px)` : `translateY(${dy}px)`;
      }
    }

    // final gallery overlay
    const g = galleryRef.current;
    if (g) {
      const gs = smooth(0.958, 0.988, p);
      g.style.opacity = gs.toFixed(3);
      const on = gs > 0.4;
      if (on !== galleryOn.current) {
        galleryOn.current = on;
        g.style.pointerEvents = on ? "auto" : "none";
        g.style.visibility = on ? "visible" : "hidden";
        setGalleryShown(on);
      }
    }

    // intro fade
    if (!introGone.current && p > 0.012) {
      introGone.current = true;
      const el = introRef.current;
      if (el) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        setTimeout(() => (el.style.visibility = "hidden"), 1100);
      }
    }

    // header shrink
    const c = p > 0.02;
    if (c !== compact.current) {
      compact.current = c;
      setHeaderCompact(c);
    }
  }, []);

  /* ---- scene lifecycle (waits for display fonts so 3D signage renders branded) ---- */
  useEffect(() => {
    if (!webglOK || !canvasRef.current) return;
    let scene: ShowroomScene | null = null;
    let cancelled = false;
    let timer = 0;
    let cleanupListeners: (() => void) | null = null;

    const start = () => {
      if (cancelled || scene || !canvasRef.current) return;
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      let firstZone = true;
      scene = new ShowroomScene(canvasRef.current, {
        mobile,
        reducedMotion: reducedMotion.current,
        onReady: () => setReady(true),
        onZone: (id) => {
          setZoneId(id);
          if (!firstZone && id !== "entry" && id !== "finale") zoneChime();
          firstZone = false;
        },
        onFrame: handleFrame,
      });
      sceneRef.current = scene;

      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scene?.setTargetProgress(max > 0 ? window.scrollY / max : 0);
      };
      const onPointer = (e: PointerEvent) => {
        if (mobile) return;
        scene?.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          (e.clientY / window.innerHeight) * 2 - 1
        );
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
      cleanupListeners = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointer);
      };
      onScroll();
    };

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(start).catch(start);
      timer = window.setTimeout(start, 1500);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cleanupListeners?.();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [webglOK, handleFrame]);

  const openProduct = useCallback((p: Product) => {
    tick();
    setViewProduct(p);
  }, []);

  if (!webglOK) {
    return (
      <>
        <FallbackPage onView={openProduct} />
        <Header
          cartCount={cart.count}
          compact={false}
          onCart={() => setCartOpen(true)}
          onJump={() => window.scrollTo({ top: 0 })}
          onTop={() => window.scrollTo({ top: 0 })}
        />
        <ProductDrawer
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onAdded={() => {
            setViewProduct(null);
            setCartOpen(true);
          }}
        />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </>
    );
  }

  return (
    <>
      {/* scroll runway */}
      <div style={{ height: `${scrollH}vh` }} aria-hidden="true" />

      {/* 3D showroom */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 z-0 h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        aria-label="Roboson 3D showroom — scroll to walk through"
      />
      <div className="grain" />

      <IntroOverlay refEl={introRef} />
      <CopyLayer refEl={copyRef} />
      <LabelsLayer refEl={labelsRef} />

      <Header
        cartCount={cart.count}
        compact={headerCompact}
        onCart={() => setCartOpen(true)}
        onJump={scrollToT}
        onTop={() => scrollToT(0)}
      />
      <ZoneRail active={zoneId} onJump={scrollToT} />
      {zoneId !== "entry" && zoneId !== "finale" && (
        <ProductPanel
          zoneId={zoneId}
          onView={openProduct}
          onAdd={(p) => cart.add(p.id, 1, p.variants?.[0])}
        />
      )}

      {/* final shop overlay */}
      <div
        ref={galleryRef}
        className="fixed inset-0 z-[25] overflow-y-auto bg-paper/90 backdrop-blur-[6px]"
        style={{ opacity: 0, pointerEvents: "none", visibility: "hidden" }}
        aria-label="Shop the full Roboson collection"
      >
        <div
          key={galleryShown ? "live" : "idle"}
          className="mx-auto max-w-6xl px-5 pb-16 pt-24 md:px-10 md:pt-28"
        >
          <p className="rise-in font-display text-[11px] font-semibold tracking-[0.4em] text-flame">
            THE FULL COLLECTION
          </p>
          <h2 className="rise-in mt-2 max-w-2xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-6xl">
            Choose what fits your day.
          </h2>
          <p className="rise-in mt-3 max-w-lg text-sm text-smoke md:text-base" style={{ animationDelay: "120ms" }}>
            Everything you just walked past — real products, real prices from roboson.in. Add to
            cart here, check out securely on the official store.
          </p>
          <div className="mt-8">
            <GalleryGrid onView={openProduct} />
          </div>
          <GalleryFooter />
        </div>
      </div>

      <ProductDrawer
        product={viewProduct}
        onClose={() => setViewProduct(null)}
        onAdded={() => {
          setViewProduct(null);
          setCartOpen(true);
        }}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* SEO / semantic content */}
      <div className="sr-only">
        <h1>Roboson — The Digital Flagship Showroom</h1>
        <p>
          Walk through the Roboson digital showroom: Electric Spin Mop ₹3,999, Electric Spin
          Scrubber ₹2,199, VC201 Handheld Cordless Vacuum ₹2,499, VC101 Car Vacuum ₹1,499,
          Handheld Garment Steamer ₹2,499, Volumizer Hair Dryer ₹1,899, Evo Wearable Breast Pump
          ₹5,699, BP-222 ₹4,299 and BP-111 ₹3,299.
        </p>
      </div>
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Showroom />
    </CartProvider>
  );
}

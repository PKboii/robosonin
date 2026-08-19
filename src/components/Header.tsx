import { REAL_STORE } from "../data/products";

interface Props {
  cartCount: number;
  compact: boolean;
  onCart: () => void;
  onJump: (t: number) => void;
  onTop: () => void;
}

export default function Header({ cartCount, compact, onCart, onJump, onTop }: Props) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 transition-all duration-500 md:px-10 ${
        compact ? "py-3" : "py-5 md:py-7"
      }`}
      style={{
        background: compact
          ? "linear-gradient(180deg, rgba(241,242,239,0.92) 0%, rgba(241,242,239,0) 100%)"
          : "transparent",
      }}
    >
      <button
        onClick={onTop}
        className="group flex items-center gap-3"
        aria-label="Roboson — back to entrance"
      >
        <img
          src={REAL_STORE.logo}
          alt="Roboson"
          className={`w-auto transition-all duration-500 ${compact ? "h-6" : "h-7 md:h-8"}`}
        />
        <span
          className={`hidden border-l border-ink/15 pl-3 font-display font-semibold tracking-[0.28em] text-graphite transition-all duration-500 sm:block ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
        >
          THE DIGITAL SHOWROOM
        </span>
      </button>

      <nav className="flex items-center gap-1 md:gap-2" aria-label="Primary">
        <button
          onClick={() => onJump(0.105)}
          className="hidden rounded-full px-4 py-2 font-display text-[13px] font-medium tracking-wide text-graphite transition hover:bg-ink hover:text-cream sm:block"
        >
          Showroom
        </button>
        <button
          onClick={() => onJump(0.978)}
          className="rounded-full px-4 py-2 font-display text-[13px] font-medium tracking-wide text-graphite transition hover:bg-ink hover:text-cream"
        >
          Shop
        </button>
        <a
          href={REAL_STORE.support}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full px-4 py-2 font-display text-[13px] font-medium tracking-wide text-graphite transition hover:bg-ink hover:text-cream md:block"
        >
          Support
        </a>
        <button
          onClick={onCart}
          className="relative ml-1 flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-display text-[13px] font-semibold tracking-wide text-cream transition hover:bg-flame active:scale-95"
          aria-label={`Open cart, ${cartCount} items`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
          {cartCount > 0 && (
            <span
              key={cartCount}
              className="rise-in flex h-5 min-w-5 items-center justify-center rounded-full bg-flame px-1 text-[11px] font-bold text-white"
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}

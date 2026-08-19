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
        className="group flex items-center gap-2.5"
        aria-label="Roboson — back to entrance"
      >
        <svg width={compact ? 22 : 28} height={compact ? 22 : 28} viewBox="0 0 32 32" className="transition-all duration-500">
          <rect width="32" height="32" rx="7" fill="#1b1d1f" />
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="#e8490f" strokeWidth="3" />
          <circle cx="16" cy="16" r="2.4" fill="#f1f2ef" />
        </svg>
        <span
          className={`font-display font-bold tracking-[0.22em] text-ink transition-all duration-500 ${
            compact ? "text-sm" : "text-base md:text-lg"
          }`}
        >
          ROBOSON
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
          onClick={() => onJump(0.965)}
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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { productById } from "../data/products";
import { cartPop, tick } from "../lib/audio";

export interface CartLine {
  productId: string;
  variant?: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (productId: string, qty?: number, variant?: string) => void;
  remove: (productId: string, variant?: string) => void;
  setQty: (productId: string, qty: number, variant?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartCtx = createContext<CartState | null>(null);
const LS_KEY = "roboson-showroom-cart";

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed)
      ? parsed.filter((l) => productById(l.productId) && l.qty > 0)
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(lines));
    } catch {
      /* private mode */
    }
  }, [lines]);

  const add = useCallback((productId: string, qty = 1, variant?: string) => {
    cartPop();
    setLines((prev) => {
      const i = prev.findIndex(
        (l) => l.productId === productId && l.variant === variant
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { productId, qty, variant }];
    });
  }, []);

  const remove = useCallback((productId: string, variant?: string) => {
    tick();
    setLines((prev) =>
      prev.filter((l) => !(l.productId === productId && l.variant === variant))
    );
  }, []);

  const setQty = useCallback(
    (productId: string, qty: number, variant?: string) => {
      if (qty <= 0) {
        remove(productId, variant);
        return;
      }
      setLines((prev) =>
        prev.map((l) =>
          l.productId === productId && l.variant === variant
            ? { ...l, qty }
            : l
        )
      );
    },
    [remove]
  );

  const clear = useCallback(() => setLines([]), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const l of lines) {
      const p = productById(l.productId);
      if (!p) continue;
      c += l.qty;
      s += l.qty * p.price;
    }
    return { count: c, subtotal: s };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, add, remove, setQty, clear, count, subtotal }),
    [lines, add, remove, setQty, clear, count, subtotal]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

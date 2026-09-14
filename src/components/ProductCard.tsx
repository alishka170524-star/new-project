import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ShoppingCart, Truck } from "lucide-react";
import type { Product } from "../data/products";
import { formatIDR } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { useConfig } from "../context/ConfigContext";
import { useReviews } from "../context/ReviewContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { settings } = useStore();
  const { categories } = useConfig();
  const { summaryForProduct } = useReviews();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  const categoryName = categories.find((c) => c.id === product.category)?.name ?? "Gear";
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const summary = summaryForProduct(product);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function handleAdd() {
    if (outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card lift group flex h-full flex-col overflow-hidden transition-colors duration-300 hover:border-gold-400/50">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-br from-primary-100 via-muted to-primary-50"
        aria-label={product.name}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.compareAt && (
            <span className="rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-2.5 py-1 text-[11px] font-bold text-primary-950 shadow-gold">
              Save {discount}%
            </span>
          )}
          {product.freeShipping && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-600/95 px-2.5 py-1 text-[11px] font-bold text-on-primary ring-1 ring-white/20">
              <Truck className="h-3 w-3" aria-hidden="true" /> Free shipping
            </span>
          )}
          {product.featured && (
            <span className="rounded-full border border-on-primary/20 bg-primary-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-200 backdrop-blur">
              Featured
            </span>
          )}
        </div>

        {/* View overlay (hover-capable pointers) */}
        <span className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 [@media(hover:none)]:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-primary-950/60 px-4 py-1.5 text-xs font-bold text-on-primary backdrop-blur-md">
            View details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-200">{categoryName}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-tokopedia/10 px-2 py-0.5 text-[10px] font-bold text-tokopedia ring-1 ring-tokopedia/20">
            <Check className="h-3 w-3" aria-hidden="true" />
            Official
          </span>
        </div>
        <h3 className="font-heading text-[15px] font-bold leading-snug sm:text-base">
          <Link to={`/product/${product.slug}`} className="transition-colors duration-150 hover:text-gold-300">
            {product.name}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-foreground/55">
          <span className="font-semibold text-foreground/75">{summary.rating.toFixed(1)}</span>
          · {summary.reviews} review{summary.reviews === 1 ? "" : "s"}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-end gap-2">
            <p className="font-heading text-lg font-bold tracking-tight text-foreground">
              {formatIDR(product.price)}
            </p>
            {product.compareAt && (
              <p className="pb-0.5 text-sm font-semibold text-destructive/60 line-through">
                {formatIDR(product.compareAt)}
              </p>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
            {outOfStock ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
                <span className="text-destructive">Out of stock</span>
              </>
            ) : lowStock ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
                <span className="text-accent">Only {product.stock} left</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-primary-200">In stock</span>
              </>
            )}
            <span className="mx-0.5 text-foreground/20" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1 text-foreground/50">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" />
              {product.freeShipping
                ? "Free shipping on this item"
                : `Free ship ${formatIDR(settings.freeShippingThreshold)}`}
            </span>
          </p>
          <button
            type="button"
            className={`btn mt-3 w-full justify-center py-2.5 text-sm transition-all duration-200 ${
              outOfStock
                ? "border border-border bg-white/10 !text-foreground/40"
                : added
                  ? "btn-primary !bg-none !bg-primary-700"
                  : "btn-primary"
            }`}
            disabled={outOfStock}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" /> Added to cart
              </>
            ) : outOfStock ? (
              "Notify me"
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
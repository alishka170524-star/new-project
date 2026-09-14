import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Megaphone } from "lucide-react";
import { useConfig, type SponsorPlacement } from "../context/ConfigContext";
import { useStore } from "../context/StoreContext";
import { sanitizeUrl } from "../lib/security";

/**
 * Renders the enabled sponsor for a placement, or nothing when none is set.
 * Links are sanitized (http(s)/whatsapp/tel or relative shop links only),
 * and external links open in a new tab with rel="noopener noreferrer".
 */
export default function SponsorSlot({
  placement,
  variant = "full",
}: {
  placement: SponsorPlacement;
  variant?: "full" | "compact";
}) {
  const { getSponsorForPlacement } = useConfig();
  const { products } = useStore();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const sponsor = getSponsorForPlacement(placement);
  if (!sponsor) return null;

  // If the configured image fails to load (e.g. a dead hotlink), fall back
  // to the megaphone treatment instead of showing a broken-image icon.
  const imageBroken = !!sponsor.image && failedSrc === sponsor.image;

  const productSlug = sponsor.productId
    ? products.find((p) => p.id === sponsor.productId)?.slug
    : undefined;
  const to = productSlug ? `/product/${productSlug}` : undefined;
  const href = to ? undefined : sanitizeUrl(sponsor.externalUrl);
  const isExternal = href !== undefined && href !== "#" && !/^\//.test(href);

  const inner = (
    <div
      className={`flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 text-on-primary shadow-soft ${
        variant === "compact" ? "px-5 py-3" : "px-6 py-5 sm:px-8"
      }`}
    >
      {sponsor.image && !imageBroken ? (
        <span
          className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white/95 p-1 shadow-sm ring-1 ring-white/20 ${
            variant === "compact" ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
          }`}
        >
          <img
            src={sponsor.image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            onError={() => setFailedSrc(sponsor.image)}
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={`grid shrink-0 place-items-center rounded-xl bg-on-primary/10 text-gold-300 ring-1 ring-white/15 ${
            variant === "compact" ? "h-12 w-12" : "h-16 w-16"
          }`}
        >
          <Megaphone className={variant === "compact" ? "h-5 w-5" : "h-7 w-7"} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
          Partnered with
        </span>
        <span className="mt-0.5 block truncate font-heading font-bold text-on-primary sm:text-lg">
          {sponsor.name}
        </span>
        {sponsor.tagline && (
          <span className="mt-0.5 block truncate text-xs text-on-primary/70 sm:text-sm">
            {sponsor.tagline}
          </span>
        )}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-gold-300 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </div>
  );

  const wrapClass =
    "group inline-block w-full rounded-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  if (isExternal && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={wrapClass} aria-label={`Visit sponsor ${sponsor.name}`}>
        {inner}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} className={wrapClass} aria-label={`Visit ${sponsor.name}`}>
        {inner}
      </Link>
    );
  }
  return <div className="w-full rounded-2xl">{inner}</div>;
}
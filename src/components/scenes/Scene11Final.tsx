import { MEDIA } from "@/lib/media";
import type { ProductInfo } from "@/lib/shopify";
import { CtaButton } from "../ui/CtaButton";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";
import { SilhouetteLine } from "../ui/Wordmark";

/**
 * The Last Frame — the hero composition returned, full circle; Phase 4 wires
 * the 3D→photograph dissolve. Footer is one quiet line (this store sells one
 * product). The intro's line-drawing closes the loop as the end card.
 */
export function Scene11Final({ product }: { product: ProductInfo }) {
  const price = Math.round(product.price);
  const compare = product.compareAtPrice
    ? Math.round(product.compareAtPrice)
    : null;

  return (
    <section
      id="product-cta"
      aria-label="Get DeskPaws"
      className="relative bg-bone px-6 pb-10 pt-28 md:pt-40"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div className="w-full max-w-xl" data-stage="lastframe">
          <MediaSlot asset={MEDIA.lastFrame} className="w-full" />
        </div>

        <Reveal className="mt-14 flex flex-col items-center">
          <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[0.95] tracking-tighter">
            Give them their spot.
          </h2>
          <p className="mt-6 text-xl">
            <span className="font-medium">{product.title} — ${price}</span>
            {compare ? (
              <>
                {" "}
                <s className="text-ink/40">${compare}</s>{" "}
                <span className="mono-label ml-1 opacity-60">LAUNCH PRICE</span>
              </>
            ) : null}
          </p>
          <div className="mt-8">
            <CtaButton
              label="Get DeskPaws"
              sublabel="SHIPS IN 48H · 30-DAY HOME TRIAL · FREE RETURNS"
              size="lg"
            />
          </div>
        </Reveal>
      </div>

      {/* footer: one quiet line + the end card */}
      <footer className="mx-auto mt-28 flex w-full max-w-6xl flex-col items-center gap-6 border-t hairline pt-8 pb-6">
        <SilhouetteLine className="h-5 w-auto text-ink/60" />
        <p className="mono-label flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink/60">
          <span>© 2026 DESKPAWS</span>
          <span aria-hidden>·</span>
          <a href="mailto:hello@deskpaws.com" className="hover:text-ink">
            HELLO@DESKPAWS.COM
          </a>
          <span aria-hidden>·</span>
          <a href="#scene-10" className="hover:text-ink">
            SHIPPING &amp; RETURNS
          </a>
          <span aria-hidden>·</span>
          <a href="#scene-10" className="hover:text-ink">
            PRIVACY
          </a>
        </p>
        <p className="mono-label text-ink/40">
          VISA · MASTERCARD · PAYPAL · APPLE PAY
        </p>
      </footer>
    </section>
  );
}

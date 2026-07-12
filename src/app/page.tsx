import { Scene01Hero } from "@/components/scenes/Scene01Hero";
import { Scene02Problem } from "@/components/scenes/Scene02Problem";
import { Scene03Turn } from "@/components/scenes/Scene03Turn";
import { Scene04Grip } from "@/components/scenes/Scene04Grip";
import { Scene05Soft } from "@/components/scenes/Scene05Soft";
import { Scene06CatLogic } from "@/components/scenes/Scene06CatLogic";
import { Scene07Mirror } from "@/components/scenes/Scene07Mirror";
import { Scene08Reviews } from "@/components/scenes/Scene08Reviews";
import { Scene09HowTo } from "@/components/scenes/Scene09HowTo";
import { Scene10Faq } from "@/components/scenes/Scene10Faq";
import { Scene11Final } from "@/components/scenes/Scene11Final";
import { getProduct } from "@/lib/shopify";

export const revalidate = 3600;

/**
 * The film, in real DOM order (a11y: copy reads correctly with no JS, no
 * pinning — this IS the Static Cut; Phases 2–4 mount the WebGL stage and
 * scroll choreography on top without reordering anything).
 */
export default async function Home() {
  const product = await getProduct();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "DeskPaws",
    description:
      "The plush basket that clamps to your desk — so nobody sits on the keyboard.",
    brand: { "@type": "Brand", name: "DeskPaws" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Scene01Hero />
      <Scene02Problem />
      <Scene03Turn />
      <Scene04Grip />
      <Scene05Soft />
      <Scene06CatLogic />
      <Scene07Mirror />
      <Scene08Reviews />
      <Scene09HowTo />
      <Scene10Faq />
      <Scene11Final product={product} />
    </main>
  );
}

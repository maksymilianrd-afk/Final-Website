/** Stage entry. Reads #dp-config, respects reduced-motion / WebGL / the theme
 * toggle, then boots the persistent actor and scroll choreography. When the
 * GLB is ready it reveals the canvas and fades the hero + dock posters. */
import { initScroll } from "./scroll";
import { initStage } from "./stage";
import { state } from "./state";
import { pickTier } from "./tier";

type Config = {
  modelBase: string;
  furLevel: "a" | "b" | "c";
  cartUrl?: string;
  variantId?: number | null;
};

function boot(): void {
  const cfgEl = document.getElementById("dp-config");
  const host = document.getElementById("dp-canvas");
  const bg = document.getElementById("dp-bg");
  if (!cfgEl || !host || !bg) return;

  let cfg: Config;
  try {
    cfg = JSON.parse(cfgEl.textContent || "{}");
  } catch {
    return;
  }
  if (!cfg.modelBase) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const enabled = cfgEl.getAttribute("data-enable-stage") !== "false";
  if (reduce || !enabled) return; // static cut stays

  const tier = pickTier();
  if (tier === "none") return; // poster-only, no WebGL

  const onReady = () => {
    document.body.classList.add("dp-stage-on");
    document
      .querySelectorAll<HTMLElement>(
        '[data-dp-stage="hero"] [data-dp-poster], [data-dp-stage="dock"] [data-dp-poster]',
      )
      .forEach((el) => {
        el.style.transition = "opacity .5s ease";
        el.style.opacity = "0";
      });
  };

  initScroll(bg);
  initStage(host, { modelBase: cfg.modelBase, furLevel: cfg.furLevel }, tier, onReady).catch(
    (err) => {
      // On any stage failure the static cut remains fully intact.
      console.warn("[deskpaws] stage unavailable:", err);
      state.ready = false;
    },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

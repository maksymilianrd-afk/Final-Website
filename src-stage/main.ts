/** Stage entry. Reads #dp-config and picks a mode:
 *  - film       (desktop, motion allowed): fixed full-viewport scroll film
 *  - contained  (mobile/portrait OR reduced-motion): the 3D product framed in
 *               the hero box, centred, gently rotating (or static if reduced)
 * Respects the theme toggle and WebGL support; on any failure the static cut
 * (poster + copy) remains fully intact. */
import { initScroll } from "./scroll";
import { initStage, type StageMode } from "./stage";
import { state } from "./state";
import { pickTier } from "./tier";

type Config = {
  modelBase: string;
  furLevel: "a" | "b" | "c";
  cartUrl?: string;
  variantId?: number | null;
};

const loaderApi = window as unknown as {
  __dpLoad?: (p: number) => void;
  __dpLoadDone?: () => void;
};
/** Dismiss the loading veil whenever the stage won't (or can't) render, so a
 * disabled/no-WebGL/failed stage never traps the visitor behind it. */
const dismissLoader = () => loaderApi.__dpLoadDone?.();

function boot(): void {
  const cfgEl = document.getElementById("dp-config");
  const fixedHost = document.getElementById("dp-canvas");
  const bg = document.getElementById("dp-bg");
  const heroBox = document.querySelector<HTMLElement>('[data-dp-stage="hero"]');
  if (!cfgEl || !fixedHost || !bg) return dismissLoader();

  let cfg: Config;
  try {
    cfg = JSON.parse(cfgEl.textContent || "{}");
  } catch {
    return dismissLoader();
  }
  if (!cfg.modelBase) return dismissLoader();
  if (cfgEl.getAttribute("data-enable-stage") === "false") return dismissLoader();

  const tier = pickTier();
  if (tier === "none") return dismissLoader(); // poster-only, no WebGL

  loaderApi.__dpLoad?.(0.45); // stage bundle parsed, loader created

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.innerWidth < 1024 || window.innerHeight > window.innerWidth;
  const mode: StageMode = narrow || reduced ? "contained" : "film";

  // Pick the host. Contained mode renders inside the hero image box so it
  // frames correctly in portrait and never fights the DOM.
  let host: HTMLElement = fixedHost;
  if (mode === "contained" && heroBox) {
    host = heroBox;
    host.style.position = "relative";
    // the canvas fills the box; the poster sits under it until ready
    const style = document.createElement("style");
    style.textContent =
      '[data-dp-stage="hero"] canvas{position:absolute;inset:0;width:100%;height:100%;z-index:2}';
    document.head.appendChild(style);
  }

  const onReady = () => {
    loaderApi.__dpLoad?.(1); // first frame is ready — fade the veil over the pop
    if (mode === "film") {
      document.body.classList.add("dp-stage-on");
      // Fade the placeholder posters for every scene the 3D product features
      // in (hero · dock · explode · knob · finale) so the live stage shows
      // through. Content scenes (fur video, cat films, UGC) keep their media.
      document
        .querySelectorAll<HTMLElement>(
          '[data-dp-stage="hero"] [data-dp-poster], [data-dp-stage="dock"] [data-dp-poster], [data-dp-stage="explode"] [data-dp-poster], [data-dp-stage="knob"] [data-dp-poster], [data-dp-stage="lastframe"] [data-dp-poster]',
        )
        .forEach((el) => {
          el.style.transition = "opacity .5s ease";
          el.style.opacity = "0";
        });
    } else {
      // contained: reveal the canvas over the hero poster
      const poster = heroBox?.querySelector<HTMLElement>("[data-dp-poster]");
      if (poster) {
        poster.style.transition = "opacity .5s ease";
        poster.style.opacity = "0";
      }
    }
  };

  if (mode === "film") initScroll(bg);

  initStage(
    host,
    { modelBase: cfg.modelBase, furLevel: cfg.furLevel, mode, reduced },
    tier,
    onReady,
  ).catch((err) => {
    // On any stage failure the static cut remains fully intact.
    console.warn("[deskpaws] stage unavailable:", err);
    state.ready = false;
    dismissLoader();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

/* Local verification harness: crudely renders the Liquid sections to static
   HTML, serves the theme root, and screenshots the real stage bundle.
   NOT part of the theme — a dev tool. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";

const ROOT = process.cwd();
const order = ["hero", "problem", "turn", "grip", "soft", "cat-logic", "mirror", "reviews", "how-to", "faq", "final"];

function renderSection(name) {
  let s = readFileSync(join(ROOT, "sections", name + ".liquid"), "utf8");
  s = s.replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, "");
  s = s.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
  s = s.replace(/\{%-?\s*liquid[\s\S]*?-?%\}/g, "");
  // media-slot renders → placeholder markup
  s = s.replace(/\{%-?\s*render\s+'media-slot'[\s\S]*?%\}/g, (m) => {
    const id = (m.match(/id:\s*'([^']+)'/) || [])[1] || "ASSET";
    const asp = (m.match(/aspect:\s*'([^']+)'/) || [])[1] || "16 / 9";
    return `<div class="media-slot" style="aspect-ratio:${asp}"><div class="media-slot__label"><span class="mono-label">${id} &middot; IN PRODUCTION</span></div><svg class="media-slot__line" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" stroke-width="0.25"></line></svg></div>`;
  });
  // silhouette renders
  s = s.replace(/\{%-?\s*render\s+'silhouette'[^%]*%\}/g,
    `<svg viewBox="0 0 64 28" fill="none" style="height:1.25rem;color:var(--ink)"><path d="M2 6 C4 18, 26 22, 38 14 C42 11.5, 44 8.5, 45 6 L62 6 M52 6 L52 14 M46 14 L52 14 M49 14 L49 24 M45.5 24 L52.5 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  // dynamic bits
  s = s.replace(/\{\{\s*price\s*\}\}/g, "$79").replace(/\{\{\s*compare\s*\}\}/g, "$99").replace(/\{\{\s*title\s*\}\}/g, "DeskPaws");
  // remaining liquid tags/objects
  s = s.replace(/\{%[\s\S]*?%\}/g, "").replace(/\{\{[\s\S]*?\}\}/g, "");
  return s;
}

const header = `<header class="dp-nav"><nav class="dp-nav__pill"><a class="dp-nav__brand" href="/"><svg viewBox="0 0 64 28" fill="none" style="height:1rem;color:var(--ink)"><path d="M2 6 C4 18, 26 22, 38 14 C42 11.5, 44 8.5, 45 6 L62 6 M52 6 L52 14 M46 14 L52 14 M49 14 L49 24 M45.5 24 L52.5 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="dp-nav__brand-text">DESKPAWS</span></a><div class="dp-nav__links"><a href="#scene-03">Story</a><a href="#scene-08">Reviews</a><a href="#scene-10">FAQ</a><a class="dp-nav__cart" href="#">Cart (<span id="dp-cart-count">0</span>)</a></div></nav></header>`;

const body = order.map(renderSection).join("\n");

const html = `<!doctype html><html lang="en" class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/assets/deskpaws.css">
</head><body class="grain-layer">
<div id="dp-bg"></div><div id="dp-canvas"></div>
${header}
<main>${body}</main>
<div class="cart-toast" id="dp-cart-toast"><div class="cart-toast__inner"><span id="dp-cart-toast-msg">Added.</span><a class="cart-toast__go" href="#">Checkout</a></div></div>
<script id="dp-config" type="application/json" data-enable-stage="true">{"modelBase":"/models","furLevel":"c","cartUrl":"/cart/add.js","variantId":null}</script>
<script src="/assets/deskpaws-stage.js" defer></script>
<script src="/assets/deskpaws-ui.js" defer></script>
</body></html>`;

writeFileSync(join(ROOT, "_harness.html"), html);

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".glb": "model/gltf-binary", ".webp": "image/webp", ".mp4": "video/mp4", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/_harness.html";
  try {
    const data = readFileSync(join(ROOT, p));
    res.setHeader("Content-Type", MIME[extname(p)] || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end("404");
  }
});
server.listen(4599, () => console.log("harness on http://localhost:4599"));

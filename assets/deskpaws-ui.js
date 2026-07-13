/* DeskPaws — UI behaviours (no framework). Reveals, native AJAX cart, lazy
   video, FAQ (native), cart toast. Loads on every page. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Scroll reveals: add .in-view when [data-reveal] enters viewport ── */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 },
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ── Lazy video: preload + play near viewport, pause when away ── */
  var videos = document.querySelectorAll("video[data-dp-video]");
  if (videos.length) {
    if (reduce) {
      videos.forEach(function (v) {
        v.setAttribute("controls", "");
      });
    } else if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            var v = e.target;
            if (e.isIntersecting) {
              if (v.preload === "none") v.preload = "auto";
              var p = v.play();
              if (p && p.catch) p.catch(function () {});
            } else {
              v.pause();
            }
          });
        },
        { threshold: 0.5 },
      );
      videos.forEach(function (v) {
        vio.observe(v);
      });
    }
  }

  /* ── Native AJAX cart ── */
  var cfgEl = document.getElementById("dp-config");
  var cfg = {};
  try {
    cfg = JSON.parse(cfgEl.textContent);
  } catch (e) {}

  var toast = document.getElementById("dp-cart-toast");
  var toastMsg = document.getElementById("dp-cart-toast-msg");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    if (toastMsg && msg) toastMsg.textContent = msg;
    toast.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-open");
    }, 4000);
  }

  function setCartCount(n) {
    var el = document.getElementById("dp-cart-count");
    if (el) el.textContent = n;
  }

  document.querySelectorAll("[data-dp-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!cfg.variantId) {
        // No product wired yet — send them to the catalog so they can still buy.
        window.location.href = "/collections/all";
        return;
      }
      btn.disabled = true;
      fetch(cfg.cartUrl || "/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ items: [{ id: cfg.variantId, quantity: 1 }] }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function () {
          return fetch("/cart.js", { headers: { Accept: "application/json" } });
        })
        .then(function (r) {
          return r.json();
        })
        .then(function (cart) {
          setCartCount(cart.item_count);
          showToast("Added. One desk, about to get quieter.");
        })
        .catch(function () {
          showToast("Couldn't add just now — try again.");
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  });

  /* ── Nav "Get DeskPaws" pill appears past The Turn ── */
  var turn = document.getElementById("scene-03");
  var nav = document.querySelector(".dp-nav__links");
  if (turn && nav && "IntersectionObserver" in window) {
    var added = false;
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.boundingClientRect.top < 0 && !added) {
          added = true;
          var b = document.createElement("button");
          b.type = "button";
          b.className = "cta";
          b.style.cssText = "padding:.4rem 1rem;font-size:.85rem;margin-left:.25rem";
          b.textContent = "Get DeskPaws";
          b.addEventListener("click", function () {
            var cta = document.getElementById("product-cta");
            if (cta) cta.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
          });
          nav.appendChild(b);
          nio.disconnect();
        }
      });
    });
    nio.observe(turn);
  }
})();

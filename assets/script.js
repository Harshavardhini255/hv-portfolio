(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var loader = $("#loader");
  var loaderFill = $("#loaderFill");
  var body = document.body;

  function finishLoader() {
    if (!loader) return;
    loader.classList.add("is-done");
    body.classList.add("is-ready");
    setTimeout(function () { loader.remove(); }, 700);
  }

  if (loader && !reduced) {
    var pct = 0;
    var tick = setInterval(function () {
      pct = Math.min(100, pct + 12 + Math.random() * 22);
      if (loaderFill) loaderFill.style.width = pct + "%";
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(finishLoader, 260);
      }
    }, 110);
    window.addEventListener("load", function () {
      clearInterval(tick);
      if (loaderFill) loaderFill.style.width = "100%";
      setTimeout(finishLoader, 300);
    });
  } else {
    finishLoader();
  }

  var nav = $("#nav");
  var progressBar = $("#progressBar");

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-stuck", y > 40);
    if (progressBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }

  var queued = false;
  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () { onScroll(); queued = false; });
  }, { passive: true });
  onScroll();

  var revealables = $$("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var delay = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        delay += 70;
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";

    function render(v) {
      var s = Math.round(v).toString();
      while (s.length < pad) s = "0" + s;
      el.textContent = s + suffix;
    }

    if (reduced) { render(target); return; }

    var dur = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      render(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else render(target);
    }
    requestAnimationFrame(step);
  }

  var counters = $$("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(countUp);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  var filters = $("#filters");
  var cards = $$("#workGrid .card");

  if (filters) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      var kind = btn.getAttribute("data-filter");
      $$("button[data-filter]", filters).forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
      });
      cards.forEach(function (card) {
        var match = kind === "all" || card.getAttribute("data-kind") === kind;
        card.classList.toggle("is-hidden", !match);
        if (match) {
          card.classList.remove("is-in");
          requestAnimationFrame(function () { card.classList.add("is-in"); });
        }
      });
    });
  }

  var acc = $("#acc");

  if (acc) {
    acc.addEventListener("click", function (e) {
      var head = e.target.closest(".acc__head");
      if (!head) return;
      var item = head.parentElement;
      var panel = $(".acc__panel", item);
      var isOpen = item.classList.contains("is-open");

      $$(".acc__item", acc).forEach(function (other) {
        if (other === item) return;
        other.classList.remove("is-open");
        $(".acc__head", other).setAttribute("aria-expanded", "false");
        $(".acc__panel", other).style.height = "0px";
      });

      if (isOpen) {
        item.classList.remove("is-open");
        head.setAttribute("aria-expanded", "false");
        panel.style.height = panel.scrollHeight + "px";
        requestAnimationFrame(function () { panel.style.height = "0px"; });
      } else {
        item.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
        panel.style.height = panel.scrollHeight + "px";
        setTimeout(function () {
          if (item.classList.contains("is-open")) panel.style.height = "auto";
        }, 580);
      }
    });

    var firstPanel = $(".acc__item.is-open .acc__panel", acc);
    if (firstPanel) firstPanel.style.height = "auto";
  }

  var sections = ["work", "stack", "experience", "credentials", "contact"];
  var navLinks = $$("[data-navlink]");

  if ("IntersectionObserver" in window && navLinks.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("data-navlink") === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sio.observe(el);
    });
  }

  var burger = $("#burger");
  var menu = $("#menu");

  function setMenu(open) {
    if (!menu || !burger) return;
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
    } else {
      menu.classList.remove("is-open");
      setTimeout(function () { menu.hidden = true; }, 400);
    }
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (nav) nav.classList.toggle("is-menu-open", open);
    body.classList.toggle("is-locked", open);
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && burger.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  var tickerTrack = $("#tickerTrack");
  var words = ["Python", "SQL", "Power BI", "Pandas", "DAX", "Tableau", "Streamlit", "MySQL",
    "BigQuery", "LLMs", "Prompt Engineering", "A/B Testing", "Matplotlib", "Seaborn", "ETL",
    "Random Forest", "Data Modelling", "Query Optimisation"];

  if (tickerTrack) {
    var run = words.map(function (w) { return "<span>" + w + "</span>"; }).join("");
    tickerTrack.innerHTML = run + run;
  }

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();

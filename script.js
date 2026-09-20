document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  const backToTop = document.getElementById("back-to-top");

  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navList.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const onScroll = () => {
    const scrolled = window.scrollY > 20;
    if (header) header.classList.toggle("is-scrolled", scrolled);
    if (backToTop) backToTop.classList.toggle("show", window.scrollY > 400);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");

  if (form && note) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitBtn = form.querySelector("button[type=submit]");
      const name = form.querySelector("#name").value.trim();
      const phone = form.querySelector("#phone").value.trim();
      const age = form.querySelector("#age").value;
      const message = form.querySelector("#message").value.trim();

      const showNote = (text, isError) => {
        note.textContent = text;
        note.style.color = isError ? "#b3261e" : "";
        note.classList.remove("show");
        void note.offsetWidth;
        note.classList.add("show");
      };

      if (typeof supabaseClient === "undefined") {
        showNote("系統暫時無法送出，請稍後再試或直接來電。", true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "送出中...";

      const { error } = await supabaseClient.from("bookings").insert({
        name,
        phone,
        age_range: age,
        message,
      });

      submitBtn.disabled = false;
      submitBtn.textContent = "送出預約";

      if (error) {
        console.error(error);
        showNote("送出失敗，請稍後再試一次，或直接來電預約。", true);
        return;
      }

      showNote(`謝謝 ${name}！我們將盡快與您聯繫安排體驗課程。`, false);
      form.reset();
    });
  }

  // Scroll-reveal for sections and cards
  const supportsObserver = "IntersectionObserver" in window;
  const revealObserver = supportsObserver
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

  const observeReveal = (el, delayIndex = 0) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${(delayIndex % 4) * 0.08}s`;
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add("is-visible");
    }
  };

  const revealSelectors = [
    ".section-title",
    ".section-sub",
    ".card",
    ".plan-card",
    ".quote-card",
    ".faq-item",
    ".steps li",
    ".table-wrap",
    ".contact-text",
    ".contact-form",
  ];
  document
    .querySelectorAll(revealSelectors.join(","))
    .forEach((el, i) => observeReveal(el, i));

  // Animated stat counters
  const counters = document.querySelectorAll(".counter");
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => animateCounter(el));
  }
});

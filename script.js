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
    ".upload-form",
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

  // Before / After progress photo gallery
  const uploadForm = document.getElementById("upload-form");
  const uploadNote = document.getElementById("upload-note");
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryEmpty = document.getElementById("gallery-empty");

  const escapeHtml = (str) =>
    String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const setupDropzone = (inputId, previewId) => {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const dropzone = document.querySelector(`.upload-dropzone[data-target="${inputId}"]`);
    if (!input || !preview || !dropzone) return;

    dropzone.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.hidden = false;
        dropzone.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });
  };
  setupDropzone("before-photo", "before-preview");
  setupDropzone("after-photo", "after-preview");

  const renderGalleryCard = (row) => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.innerHTML = `
      <div class="gallery-compare">
        <div class="gallery-photo before">
          <span class="tag">參加前</span>
          <img src="${row.beforeUrl}" alt="參加前照片" loading="lazy">
        </div>
        <div class="gallery-photo after">
          <span class="tag">參加後</span>
          <img src="${row.afterUrl}" alt="參加後照片" loading="lazy">
        </div>
      </div>
      <div class="gallery-info">
        <p class="gallery-name">${escapeHtml(row.display_name) || "匿名學員"}</p>
        ${row.note ? `<p class="gallery-note">${escapeHtml(row.note)}</p>` : ""}
      </div>
    `;
    return card;
  };

  const loadGallery = async () => {
    if (typeof supabaseClient === "undefined" || !galleryGrid) return;

    const { data, error } = await supabaseClient
      .from("progress_photos")
      .select("id, display_name, before_path, after_path, note, created_at")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      if (galleryEmpty) galleryEmpty.hidden = false;
      return;
    }

    if (galleryEmpty) galleryEmpty.hidden = true;
    galleryGrid.innerHTML = "";

    data.forEach((row, i) => {
      const beforeUrl = supabaseClient.storage
        .from("progress-photos")
        .getPublicUrl(row.before_path).data.publicUrl;
      const afterUrl = supabaseClient.storage
        .from("progress-photos")
        .getPublicUrl(row.after_path).data.publicUrl;

      const card = renderGalleryCard({ ...row, beforeUrl, afterUrl });
      galleryGrid.appendChild(card);
      observeReveal(card, i);
    });
  };

  if (uploadForm && uploadNote) {
    uploadForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitBtn = document.getElementById("upload-submit");
      const beforeFile = document.getElementById("before-photo").files[0];
      const afterFile = document.getElementById("after-photo").files[0];
      const displayName = document.getElementById("photo-name").value.trim();
      const note = document.getElementById("photo-note").value.trim();

      const showNote = (text, isError) => {
        uploadNote.textContent = text;
        uploadNote.style.color = isError ? "#b3261e" : "";
        uploadNote.classList.remove("show");
        void uploadNote.offsetWidth;
        uploadNote.classList.add("show");
      };

      if (typeof supabaseClient === "undefined") {
        showNote("系統暫時無法上傳，請稍後再試。", true);
        return;
      }
      if (!beforeFile || !afterFile) {
        showNote("請選擇參加前與參加後的照片。", true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "上傳中...";

      try {
        const stamp = Date.now();
        const uid = crypto.randomUUID ? crypto.randomUUID() : `${stamp}-${Math.random()}`;
        const ext = (file) => (file.name.split(".").pop() || "jpg").toLowerCase();

        const beforePath = `${uid}/before.${ext(beforeFile)}`;
        const afterPath = `${uid}/after.${ext(afterFile)}`;

        const uploads = await Promise.all([
          supabaseClient.storage.from("progress-photos").upload(beforePath, beforeFile),
          supabaseClient.storage.from("progress-photos").upload(afterPath, afterFile),
        ]);

        const uploadError = uploads.find((u) => u.error);
        if (uploadError) throw uploadError.error;

        const { error: insertError } = await supabaseClient.from("progress_photos").insert({
          display_name: displayName || null,
          note: note || null,
          before_path: beforePath,
          after_path: afterPath,
        });

        if (insertError) throw insertError;

        showNote("上傳成功！感謝您分享訓練成果。", false);
        uploadForm.reset();
        document.querySelectorAll(".upload-preview").forEach((img) => {
          img.hidden = true;
          img.src = "";
        });
        document.querySelectorAll(".upload-dropzone").forEach((dz) => dz.classList.remove("has-image"));
        loadGallery();
      } catch (err) {
        console.error(err);
        showNote("上傳失敗，請確認網路連線後再試一次。", true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "上傳照片";
      }
    });
  }

  loadGallery();
});

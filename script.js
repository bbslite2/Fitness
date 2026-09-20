document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");

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

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");

  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector("#name").value.trim();
      note.textContent = name
        ? `謝謝 ${name}！我們將盡快與您聯繫安排體驗課程。`
        : "謝謝您！我們將盡快與您聯繫安排體驗課程。";
      form.reset();
    });
  }
});

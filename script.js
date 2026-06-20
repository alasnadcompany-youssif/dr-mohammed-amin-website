const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");

function closeMenu() {
  if (!mainNav || !menuToggle) return;
  mainNav.classList.remove("open");
  document.body.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    document.body.classList.toggle("nav-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isActive = item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("active");
      faq.querySelector("button")?.setAttribute("aria-expanded", "false");
    });

    if (!isActive) {
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

document.querySelectorAll("[data-faq-carousel]").forEach((carousel) => {
  const list = carousel.querySelector(".faq-list");
  const slides = Array.from(carousel.querySelectorAll(".faq-category"));
  const prevButton = carousel.querySelector("[data-faq-prev]");
  const nextButton = carousel.querySelector("[data-faq-next]");
  const dotsWrap = carousel.querySelector("[data-faq-dots]");
  let currentIndex = 0;
  let scrollTimer;

  if (!list || !slides.length) return;

  function closeFaqAnswers() {
    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("active");
      faq.querySelector("button")?.setAttribute("aria-expanded", "false");
    });
  }

  function setActiveState() {
    dotsWrap?.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  }

  function goToSlide(index, behavior = "smooth") {
    currentIndex = (index + slides.length) % slides.length;
    const targetLeft = slides[currentIndex].offsetLeft - list.offsetLeft;

    list.scrollTo({ left: targetLeft, behavior });
    closeFaqAnswers();
    setActiveState();
  }

  function syncCurrentFromScroll() {
    const listRect = list.getBoundingClientRect();
    const listCenter = listRect.left + listRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const distance = Math.abs(slideCenter - listCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex = closestIndex;
    setActiveState();
  }

  dotsWrap?.replaceChildren();
  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", slide.querySelector("h3")?.textContent || `FAQ ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsWrap?.append(dot);
  });

  prevButton?.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => goToSlide(currentIndex + 1));

  list.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(syncCurrentFromScroll, 80);
  }, { passive: true });

  list.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentIndex + 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentIndex - 1);
    }
  });

  window.requestAnimationFrame(() => goToSlide(0, "auto"));
});

const sections = Array.from(document.querySelectorAll("main section[id]"));

function setActiveNav() {
  const scrollPoint = window.scrollY + 160;
  let currentId = "home";

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPoint) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === `#${currentId}`;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("scroll", setActiveNav, { passive: true });
window.addEventListener("load", setActiveNav);

document.querySelector(".booking-form")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const name = form.querySelector('[name="name"]').value.trim();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const message = form.querySelector('[name="message"]').value.trim();
  const isEnglish = document.documentElement.lang === "en";
  const text = isEnglish
    ? [
        "Appointment request at Dr. Mohammed Ameen Kadhim Clinic",
        `Name: ${name || "-"}`,
        `Phone: ${phone || "-"}`,
        `Reason for visit: ${message || "-"}`
      ].join("\n")
    : [
        "طلب حجز موعد في عيادة د. محمد أمين كاظم",
        `الاسم: ${name || "-"}`,
        `رقم الهاتف: ${phone || "-"}`,
        `سبب الزيارة: ${message || "-"}`
      ].join("\n");

  window.open(`https://wa.me/9647814444754?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

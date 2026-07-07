async function loadComponent(selector, file, isProjectPage = false) {
  const target = document.querySelector(selector);
  if (!target) return;

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    let html = await response.text();

    // Fix relative asset paths for project detail pages
    if (isProjectPage) {
      html = html
        .replace(/href="index\.html/g, 'href="../index.html')
        .replace(/href="#/g, 'href="../index.html#')
        .replace(/src="assets\//g, 'src="../assets/')
        .replace(/href="assets\//g, 'href="../assets/');
    }

    target.innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

/* =========================
   Header / Mobile Menu Init
========================= */
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const body = document.body;

  if (!menuToggle || !navMenu) return;

  if (menuToggle.dataset.initialized === "true") return;
  menuToggle.dataset.initialized = "true";

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    body.classList.toggle("menu-open");
  });

  const navLinks = navMenu.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("menu-open");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("menu-open");
    }
  });
}

/* =========================
   Projects Slider Init
========================= */
function initProjectsSlider() {
  const slider = document.querySelector(".projects-slider");
  if (!slider) return;

  const track = slider.querySelector(".projects-track");
  const cards = Array.from(slider.querySelectorAll(".project-card"));
  const prevBtn = slider.querySelector(".projects-prev");
  const nextBtn = slider.querySelector(".projects-next");

  if (!track || !cards.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  let maxIndex = getMaxIndex();

  function getCardsPerView() {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 991) return 2;
    return 3;
  }

  function getGap() {
    const trackStyles = window.getComputedStyle(track);
    return parseFloat(trackStyles.columnGap || trackStyles.gap || 0);
  }

  function getCardWidth() {
    return cards[0].getBoundingClientRect().width;
  }

  function getMaxIndex() {
    const perView = getCardsPerView();
    return Math.max(0, cards.length - perView);
  }

  function updateSlider() {
    const gap = getGap();
    const cardWidth = getCardWidth();
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  function handleNext() {
    currentIndex = Math.min(currentIndex + cardsPerView, maxIndex);
    updateSlider();
  }

  function handlePrev() {
    currentIndex = Math.max(currentIndex - cardsPerView, 0);
    updateSlider();
  }

  function handleResize() {
    const newCardsPerView = getCardsPerView();
    const newMaxIndex = getMaxIndex();

    cardsPerView = newCardsPerView;
    maxIndex = newMaxIndex;

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    updateSlider();
  }

  if (slider.dataset.initialized === "true") return;
  slider.dataset.initialized = "true";

  prevBtn.addEventListener("click", handlePrev);
  nextBtn.addEventListener("click", handleNext);
  window.addEventListener("resize", handleResize);

  updateSlider();
}

/* =========================
   App Init
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  const isProjectPage = window.location.pathname.includes("/projects/");
  const componentBase = isProjectPage ? "../components/" : "components/";

  if (isProjectPage) {
    // Project detail pages: only header + footer
    await loadComponent("#header-placeholder", componentBase + "header.html", true);
    await loadComponent("#footer-placeholder", componentBase + "footer.html", true);
  } else {
    // Home page: all homepage sections
    await loadComponent("#header-component", componentBase + "header.html");
    await loadComponent("#hero-component", componentBase + "hero.html");
    await loadComponent("#tech-strip-component", componentBase + "tech-strip.html");
    await loadComponent("#about-component", componentBase + "about.html");
    await loadComponent("#services-component", componentBase + "services.html");
    await loadComponent("#projects-component", componentBase + "projects.html");
    await loadComponent("#cta-component", componentBase + "cta.html");
    await loadComponent("#contact-component", componentBase + "contact.html");
    await loadComponent("#footer-component", componentBase + "footer.html");
  }

  initMobileMenu();
  initProjectsSlider();
});
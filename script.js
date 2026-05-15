const navLinks = Array.from(document.querySelectorAll(".nav-pill"));
const sections = Array.from(document.querySelectorAll("main section"));
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = reduceMotionQuery.matches;

document.body.classList.add("motion-ready");

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

function revealElement(element) {
  element.classList.add("is-revealed");
}

function revealVisibleItems() {
  if (prefersReducedMotion) {
    return;
  }

  const triggerLine = window.innerHeight * 0.92;
  revealItems.forEach((item) => {
    if (item.classList.contains("is-revealed")) {
      return;
    }

    const rect = item.getBoundingClientRect();
    if (rect.top < triggerLine && rect.bottom > 0) {
      revealElement(item);
      revealObserver.unobserve(item);
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      revealElement(entry.target);
      revealObserver.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -16% 0px",
    threshold: 0.18,
  },
);

if (prefersReducedMotion) {
  revealItems.forEach(revealElement);
} else {
  revealItems.forEach((item) => revealObserver.observe(item));
  requestAnimationFrame(revealVisibleItems);
}

function setActiveNav(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function setActiveFromScroll() {
  const probeY = window.scrollY + window.innerHeight * 0.42;
  const current = sections.findLast((section) => section.offsetTop <= probeY) || sections[0];
  setActiveNav(current.id);
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setActiveNav(visible.target.id);
    }
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.15, 0.35, 0.55],
  },
);

sections.forEach((section) => observer.observe(section));
function syncHashTarget() {
  const id = window.location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;

  if (target) {
    target.scrollIntoView({ block: "start" });
    setActiveNav(id);
    requestAnimationFrame(revealVisibleItems);
    return;
  }

  setActiveFromScroll();
  requestAnimationFrame(revealVisibleItems);
}

window.addEventListener("load", syncHashTarget);
window.addEventListener("scroll", () => {
  setActiveFromScroll();
  revealVisibleItems();
}, { passive: true });
window.addEventListener("hashchange", syncHashTarget);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNav(link.getAttribute("href").slice(1));
  });
});

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const target = entry.target;
      const finalValue = Number(target.dataset.count);
      const duration = 900;
      const start = performance.now();

      if (prefersReducedMotion) {
        target.textContent = Math.round(finalValue);
        counterObserver.unobserve(target);
        return;
      }

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        target.textContent = Math.round(finalValue * eased);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(target);
    });
  },
  { threshold: 0.6 },
);

document.querySelectorAll("[data-count]").forEach((counter) => counterObserver.observe(counter));

function animateStatNumber(element) {
  const target = Number(element.dataset.countTarget);
  const decimals = Number(element.dataset.decimals || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 620;
  const start = performance.now();

  if (!Number.isFinite(target)) {
    return;
  }

  if (prefersReducedMotion) {
    element.textContent = `${target.toFixed(decimals)}${suffix}`;
    element.classList.add("is-count-complete");
    return;
  }

  if (element.animationFrameId) {
    cancelAnimationFrame(element.animationFrameId);
  }

  function render(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const value = target * eased;
    element.textContent = `${value.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      element.animationFrameId = requestAnimationFrame(render);
      return;
    }

    element.textContent = `${target.toFixed(decimals)}${suffix}`;
    element.classList.remove("is-counting");
    element.classList.add("is-count-complete");
  }

  element.classList.add("is-counting");
  element.textContent = `${(0).toFixed(decimals)}${suffix}`;
  element.animationFrameId = requestAnimationFrame(render);
}

let dataStatsPlayed = false;
const dataCardsSection = document.querySelector(".data-cards");

const dataStatsObserver = new IntersectionObserver(
  (entries) => {
    const dataEntry = entries.find((entry) => entry.target === dataCardsSection);

    if (!dataEntry?.isIntersecting || dataStatsPlayed) {
      return;
    }

    dataStatsPlayed = true;
    document.querySelectorAll(".stat-number").forEach(animateStatNumber);
    dataStatsObserver.disconnect();
  },
  {
    rootMargin: "-8% 0px -18% 0px",
    threshold: 0.22,
  },
);

if (dataCardsSection) {
  dataStatsObserver.observe(dataCardsSection);
}

const resumeOverlay = document.querySelector(".resume-overlay");
const resumeOpenBtn = document.querySelector(".floating-resume");
const resumeCloseBtn = document.querySelector(".resume-overlay-close");

function openResume(e) {
  e.preventDefault();
  if (!resumeOverlay) return;
  resumeOverlay.classList.add("is-open");
  resumeOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-previewing");
  resumeOverlay.querySelector(".resume-modal").scrollTop = 0;
}

function closeResume() {
  if (!resumeOverlay) return;
  resumeOverlay.classList.remove("is-open");
  resumeOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-previewing");
}

if (resumeOpenBtn) {
  resumeOpenBtn.addEventListener("click", openResume);
}

if (resumeCloseBtn) {
  resumeCloseBtn.addEventListener("click", closeResume);
}

if (resumeOverlay) {
  resumeOverlay.addEventListener("click", function(e) {
    if (e.target === resumeOverlay) {
      closeResume();
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && resumeOverlay.classList.contains("is-open")) {
      closeResume();
    }
  });
}


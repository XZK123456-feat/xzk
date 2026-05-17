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
  let current = sections[0];

  for (let index = sections.length - 1; index >= 0; index -= 1) {
    if (sections[index].offsetTop <= probeY) {
      current = sections[index];
      break;
    }
  }

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
    window.scrollTo({ top: Math.max(0, target.offsetTop), behavior: "auto" });
    setActiveNav(id);
    requestAnimationFrame(revealVisibleItems);
    return;
  }

  setActiveFromScroll();
  requestAnimationFrame(revealVisibleItems);
}

window.addEventListener("load", () => {
  syncHashTarget();
  window.setTimeout(syncHashTarget, 120);
  window.setTimeout(syncHashTarget, 420);
});
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

/* ── Lightbox arrow navigation ── */
(function() {
  const lightbox = document.querySelector(".website-lightbox");
  if (!lightbox) return;

  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  if (!prevBtn || !nextBtn) return;

  let currentButton = null;

  // Track which button opened the lightbox
  document.addEventListener("click", function(e) {
    const previewBtn = e.target.closest("[data-detail-preview]");
    if (previewBtn) {
      currentButton = previewBtn;
    }
  }, true);

  function getAllPreviews() {
    if (!currentButton) return [];
    const gallery = currentButton.closest(".detail-gallery");
    if (!gallery) return [];
    return Array.from(gallery.querySelectorAll("[data-detail-preview]"));
  }

  let navigateCooldown = false;
  const NAV_COOLDOWN_MS = 800;

  function navigate(direction) {
    if (!lightbox.classList.contains("is-open")) return;
    if (navigateCooldown) return;
    const all = getAllPreviews();
    if (all.length === 0) return;
    const idx = all.indexOf(currentButton);
    if (idx === -1) return;
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= all.length) return;

    navigateCooldown = true;
    currentButton = all[nextIdx];
    currentButton.click();

    setTimeout(function () {
      navigateCooldown = false;
    }, NAV_COOLDOWN_MS);
  }

  prevBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    navigate(-1);
  });

  nextBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    navigate(1);
  });

  document.addEventListener("keydown", function(e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigate(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigate(1);
    }
  });

  /* ── Touch swipe + pinch zoom ── */
  const lightboxImage = lightbox.querySelector("img");
  if (!lightboxImage) return;

  let touchZoom = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
  let touchStartDist = 0;
  let touchStartScale = 1;
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeStartX = 0;
  let swipeActive = false;
  let touchCount = 0;
  const SWIPE_THRESHOLD = 60;

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function applyTouchZoom() {
    if (!lightboxImage) return;
    lightboxImage.style.transform = "translate(" + touchZoom.x + "px, " + touchZoom.y + "px) scale(" + touchZoom.scale + ")";
    lightboxImage.style.cursor = touchZoom.scale > 1 ? (touchZoom.dragging ? "grabbing" : "grab") : "default";
    lightboxImage.style.transition = touchZoom.dragging ? "none" : "";
  }

  function resetTouchZoom() {
    touchZoom = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
    applyTouchZoom();
  }

  lightbox.addEventListener("touchstart", function(e) {
    touchCount = e.touches.length;

    if (e.touches.length === 1) {
      swipeStartX = e.touches[0].clientX;
      swipeActive = true;
      if (touchZoom.scale > 1) {
        touchZoom.dragging = true;
        touchZoom.lastX = e.touches[0].clientX;
        touchZoom.lastY = e.touches[0].clientY;
      }
    } else if (e.touches.length === 2) {
      swipeActive = false;
      touchStartDist = getTouchDist(e.touches);
      touchStartScale = touchZoom.scale;
      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchStartX = midX;
      touchStartY = midY;
    }
  }, { passive: false });

  lightbox.addEventListener("touchmove", function(e) {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.touches.length === 2) {
      e.preventDefault();
      var dist = getTouchDist(e.touches);
      var scale = Math.min(5, Math.max(0.5, touchStartScale * (dist / touchStartDist)));
      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchZoom.scale = scale;
      if (scale <= 1) {
        touchZoom.x = 0;
        touchZoom.y = 0;
      } else {
        touchZoom.x += midX - touchStartX;
        touchZoom.y += midY - touchStartY;
        touchStartX = midX;
        touchStartY = midY;
      }
      applyTouchZoom();
      return;
    }

    if (e.touches.length === 1 && touchZoom.dragging && touchZoom.scale > 1) {
      e.preventDefault();
      touchZoom.x += e.touches[0].clientX - touchZoom.lastX;
      touchZoom.y += e.touches[0].clientY - touchZoom.lastY;
      touchZoom.lastX = e.touches[0].clientX;
      touchZoom.lastY = e.touches[0].clientY;
      applyTouchZoom();
    }
  }, { passive: false });

  lightbox.addEventListener("touchend", function(e) {
    if (touchCount === 1 && swipeActive && touchZoom.scale <= 1) {
      var dx = (e.changedTouches[0] ? e.changedTouches[0].clientX : 0) - swipeStartX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        e.preventDefault();
        navigate(dx < 0 ? 1 : -1);
      }
    }

    if (e.touches.length === 0) {
      touchZoom.dragging = false;
      swipeActive = false;
      applyTouchZoom();
    }

    touchCount = e.touches.length;
  });

  // Reset zoom when opening a new image
  document.addEventListener("click", function(e) {
    var previewBtn = e.target.closest("[data-detail-preview]");
    if (previewBtn) {
      resetTouchZoom();
    }
  }, true);
})();


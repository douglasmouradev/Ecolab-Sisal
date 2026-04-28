const form = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const newsletterForm = document.querySelector(".newsletter-form");
const newsletterStatus = document.querySelector(".newsletter-status");
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector("#nav-primary");
const navLinks = primaryNav ? Array.from(primaryNav.querySelectorAll("a[href^='#']")) : [];
const siteHeader = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress-bar");
const revealElements = document.querySelectorAll(".reveal");
const scrollTransitions = document.querySelectorAll(".scroll-transition");
const countupElements = document.querySelectorAll("[data-countup]");
const bgPrimary = document.querySelector(".scroll-bg-primary");
const bgSecondary = document.querySelector(".scroll-bg-secondary");
const siteLoader = document.querySelector(".site-loader");
const rootStyle = document.documentElement.style;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollStateTimeout;

const transitionPalettes = [
  { start: "#206986", end: "#74d2dc", glow: "rgba(89, 206, 219, 0.72)" },
  { start: "#1f6a43", end: "#84d49f", glow: "rgba(99, 207, 136, 0.75)" },
  { start: "#6f5a2d", end: "#d3b67c", glow: "rgba(215, 187, 116, 0.72)" },
  { start: "#4a6f3f", end: "#a7d896", glow: "rgba(151, 212, 126, 0.72)" }
];

const backgroundImages = [
  "assets/images/imagem-02.jpeg",
  "assets/images/imagem-03.jpeg",
  "assets/images/imagem-04.jpeg",
  "assets/images/imagem-05.jpeg",
  "assets/images/imagem-06.jpeg"
];

const state = {
  progressWidth: 0,
  targetProgressWidth: 0,
  transitionProgress: scrollTransitions.map(() => 0),
  transitionTargets: scrollTransitions.map(() => 0),
  parallaxShift: scrollTransitions.map(() => 0),
  parallaxScale: scrollTransitions.map(() => 1.12),
  activeBackgroundIndex: 0,
  candidateBackgroundIndex: 0,
  candidateSince: 0,
  backgroundMix: 0,
  targetBackgroundMix: 0,
  ambientPhase: Math.random() * Math.PI * 2
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, factor) => start + (end - start) * factor;
const easeInOut = (t) => 0.5 - Math.cos(Math.PI * clamp(t, 0, 1)) / 2;

document.body.classList.remove("no-js");
document.body.classList.add("js-enabled");

const loaderStartTime = performance.now();
const minimumLoaderDuration = prefersReducedMotion.matches ? 220 : 1400;
const maximumLoaderDuration = prefersReducedMotion.matches ? 900 : 3200;
let loaderDismissed = false;

const dismissLoader = () => {
  if (loaderDismissed) return;
  loaderDismissed = true;
  document.body.classList.add("is-loaded");
  document.body.classList.remove("is-loading");
  if (siteLoader) {
    window.setTimeout(() => {
      siteLoader.setAttribute("aria-hidden", "true");
    }, 550);
  }
};

const scheduleLoaderDismiss = () => {
  const elapsed = performance.now() - loaderStartTime;
  const remaining = Math.max(0, minimumLoaderDuration - elapsed);
  window.setTimeout(dismissLoader, remaining);
};

if (!siteLoader) {
  dismissLoader();
} else {
  const forceDismissTimeout = window.setTimeout(dismissLoader, maximumLoaderDuration);
  const resolveLoader = () => {
    window.clearTimeout(forceDismissTimeout);
    scheduleLoaderDismiss();
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    resolveLoader();
  } else {
    document.addEventListener("DOMContentLoaded", resolveLoader, { once: true });
    window.addEventListener("load", resolveLoader, { once: true });
  }
}

if (bgPrimary) {
  bgPrimary.style.backgroundImage = `url("${backgroundImages[0]}")`;
}

if (bgSecondary) {
  bgSecondary.style.backgroundImage = `url("${backgroundImages[1]}")`;
}

if (navToggle && primaryNav) {
  const setNavOpen = (open) => {
    navToggle.setAttribute("aria-expanded", String(open));
    primaryNav.classList.toggle("is-open", open);
    navToggle.setAttribute(
      "aria-label",
      open ? "Fechar menu de navegação" : "Abrir menu de navegação"
    );
  };

  navToggle.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) {
      setNavOpen(false);
    }
  });
}

if (form) {
  const validateField = (field) => {
    const isValid = field.checkValidity();
    field.classList.toggle("is-invalid", !isValid);
    return isValid;
  };

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("blur", () => {
      validateField(field);
    });
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const endpoint = form.getAttribute("action");
    const invalidFields = Array.from(form.querySelectorAll("input, textarea, select")).filter(
      (field) => !validateField(field)
    );

    if (invalidFields.length) {
      if (formStatus) {
        formStatus.textContent = "Revise os campos destacados e tente novamente.";
        formStatus.className = "form-status is-error";
      }
      invalidFields[0]?.focus({ preventScroll: false });
      return;
    }

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Enviando...";
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "form-status";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (formStatus) {
          formStatus.textContent =
            "Mensagem enviada com sucesso! Retornaremos em breve pelo e-mail informado.";
          formStatus.className = "form-status is-success";
        }
        form.reset();
        form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
      } else {
        const fromErrors =
          data.errors &&
          Object.values(data.errors)
            .flat()
            .filter(Boolean)
            .join(" ");
        const message =
          (typeof data.error === "string" && data.error) ||
          fromErrors ||
          "Não foi possível enviar agora. Tente novamente em alguns instantes.";
        throw new Error(message);
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent =
          error instanceof Error ? error.message : "Erro de rede. Verifique sua conexão e tente de novo.";
        formStatus.className = "form-status is-error";
      }
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

if (newsletterForm) {
  const newsletterInput = newsletterForm.querySelector('input[type="email"]');

  newsletterInput?.addEventListener("blur", () => {
    newsletterInput.classList.toggle("is-invalid", !newsletterInput.checkValidity());
  });

  newsletterInput?.addEventListener("input", () => {
    if (newsletterInput.classList.contains("is-invalid")) {
      newsletterInput.classList.toggle("is-invalid", !newsletterInput.checkValidity());
    }
  });

  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = newsletterForm.querySelector('button[type="submit"]');
    const endpoint = newsletterForm.getAttribute("action");

    if (!newsletterInput || !newsletterInput.checkValidity()) {
      newsletterInput?.classList.add("is-invalid");
      if (newsletterStatus) {
        newsletterStatus.textContent = "Digite um e-mail valido para assinar a newsletter.";
        newsletterStatus.className = "newsletter-status is-error";
      }
      newsletterInput?.focus({ preventScroll: false });
      return;
    }

    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    if (newsletterStatus) {
      newsletterStatus.textContent = "";
      newsletterStatus.className = "newsletter-status";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(newsletterForm)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (newsletterStatus) {
          newsletterStatus.textContent =
            "Inscricao enviada com sucesso! Em breve voce recebera novidades no seu e-mail.";
          newsletterStatus.className = "newsletter-status is-success";
        }
        newsletterForm.reset();
        newsletterInput.classList.remove("is-invalid");
      } else {
        const fromErrors =
          data.errors &&
          Object.values(data.errors)
            .flat()
            .filter(Boolean)
            .join(" ");
        const message =
          (typeof data.error === "string" && data.error) ||
          fromErrors ||
          "Nao foi possivel concluir o envio. Tente novamente em alguns instantes.";
        throw new Error(message);
      }
    } catch (error) {
      if (newsletterStatus) {
        newsletterStatus.textContent =
          error instanceof Error ? error.message : "Erro de rede. Verifique sua conexão e tente de novo.";
        newsletterStatus.className = "newsletter-status is-error";
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
}

const updateScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  state.targetProgressWidth = Math.min(progress, 100);
};

const updateHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-compact", window.scrollY > 24);
};

const updateActiveNavLink = () => {
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return null;
      const section = document.getElementById(id);
      if (!section) return null;
      return { link, section };
    })
    .filter(Boolean);

  const viewportMiddle = window.innerHeight * 0.35;
  let current = null;

  sections.forEach(({ link, section }) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle * 0.4) {
      current = link;
    }
  });

  navLinks.forEach((link) => link.classList.remove("is-active"));
  if (current) {
    current.classList.add("is-active");
  }
};

const updateImageTransitions = () => {
  if (!scrollTransitions.length) {
    return;
  }

  const viewportHeight = window.innerHeight;
  let strongestIndex = 0;
  let strongestValue = -1;

  scrollTransitions.forEach((transition, index) => {
    const rect = transition.getBoundingClientRect();
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const normalized = Math.max(0, Math.min(progress, 1));
    const eased = easeInOut(normalized);
    const shift = (eased - 0.5) * 48;
    const scale = 1.16 - eased * 0.11;
    const visibility = clamp(1 - Math.abs(normalized - 0.5) * 2, 0, 1);
    const smoothVisibility = easeInOut(visibility);

    state.parallaxShift[index] = shift;
    state.parallaxScale[index] = scale;
    transition.style.setProperty("--overlay-opacity", (1 - smoothVisibility * 0.32).toFixed(3));
    transition.style.setProperty("--media-opacity", (0.88 + smoothVisibility * 0.12).toFixed(3));
    transition.style.setProperty("--media-saturation", (1.02 + smoothVisibility * 0.2).toFixed(3));
    transition.style.setProperty("--media-contrast", (1.01 + smoothVisibility * 0.09).toFixed(3));

    state.transitionTargets[index] = smoothVisibility;
    if (smoothVisibility > strongestValue) {
      strongestValue = smoothVisibility;
      strongestIndex = index;
    }
  });

  const activePalette = transitionPalettes[strongestIndex] || transitionPalettes[0];
  const influence = strongestValue > 0 ? strongestValue : 0;
  const defaultPalette = transitionPalettes[0];

  rootStyle.setProperty("--progress-start", influence > 0.08 ? activePalette.start : defaultPalette.start);
  rootStyle.setProperty("--progress-end", influence > 0.08 ? activePalette.end : defaultPalette.end);
  rootStyle.setProperty("--progress-glow", influence > 0.08 ? activePalette.glow : defaultPalette.glow);

  const targetIndex = strongestIndex % backgroundImages.length;
  const now = performance.now();
  if (targetIndex !== state.activeBackgroundIndex && strongestValue > 0.28 && bgSecondary) {
    if (state.candidateBackgroundIndex !== targetIndex) {
      state.candidateBackgroundIndex = targetIndex;
      state.candidateSince = now;
    } else if (now - state.candidateSince > 220) {
      state.activeBackgroundIndex = targetIndex;
      bgSecondary.style.backgroundImage = `url("${backgroundImages[targetIndex]}")`;
      state.targetBackgroundMix = 1;
    }
  } else {
    state.candidateBackgroundIndex = state.activeBackgroundIndex;
    state.candidateSince = now;
  }
};

let ticking = false;
const onScroll = () => {
  updateScrollProgress();
  updateActiveNavLink();
  updateHeaderState();
  document.body.classList.add("is-scrolling");
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.body.classList.toggle("is-deep-scroll", scrollRatio > 0.42);
  clearTimeout(scrollStateTimeout);
  scrollStateTimeout = window.setTimeout(() => {
    document.body.classList.remove("is-scrolling");
  }, 220);
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateImageTransitions();
      ticking = false;
    });
    ticking = true;
  }
};

const animate = () => {
  state.progressWidth = lerp(state.progressWidth, state.targetProgressWidth, 0.18);
  if (progressBar) {
    progressBar.style.width = `${state.progressWidth.toFixed(2)}%`;
  }

  scrollTransitions.forEach((transition, index) => {
    state.transitionProgress[index] = lerp(state.transitionProgress[index], state.transitionTargets[index], 0.14);
    transition.style.setProperty("--parallax-shift", `${state.parallaxShift[index].toFixed(2)}px`);
    transition.style.setProperty("--parallax-scale", state.parallaxScale[index].toFixed(3));
  });

  if (bgPrimary && bgSecondary) {
    state.backgroundMix = lerp(state.backgroundMix, state.targetBackgroundMix, 0.06);
    bgSecondary.style.opacity = state.backgroundMix.toFixed(3);
    const reduceMotion = prefersReducedMotion.matches;
    const t = performance.now() * 0.00025 + state.ambientPhase;
    const driftX = reduceMotion ? 0 : Math.sin(t) * 7;
    const driftY = reduceMotion ? 0 : Math.cos(t * 1.25) * 5;
    const driftXSecondary = reduceMotion ? 0 : Math.sin(t + 1.8) * 9;
    const driftYSecondary = reduceMotion ? 0 : Math.cos(t * 1.12 + 1.2) * 7;
    bgPrimary.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0) scale(${(1.08 - state.backgroundMix * 0.02).toFixed(3)})`;
    bgSecondary.style.transform = `translate3d(${driftXSecondary.toFixed(2)}px, ${driftYSecondary.toFixed(2)}px, 0) scale(${(1.1 - state.backgroundMix * 0.02).toFixed(3)})`;

    if (Math.abs(state.backgroundMix - state.targetBackgroundMix) < 0.01 && state.targetBackgroundMix === 1) {
      bgPrimary.style.backgroundImage = bgSecondary.style.backgroundImage;
      state.backgroundMix = 0;
      state.targetBackgroundMix = 0;
      bgSecondary.style.opacity = "0";
      bgPrimary.style.transform = "scale(1.08)";
      bgSecondary.style.transform = "scale(1.1)";
    }
  }

  window.requestAnimationFrame(animate);
};

const countupObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.getAttribute("data-countup"));
      if (!target || element.dataset.animated === "true") return;

      element.dataset.animated = "true";
      if (prefersReducedMotion.matches) {
        element.textContent = `${target}${target === 320 ? " mil+" : "+"}`.replace("28+", "28").replace("17+", "17");
        if (target === 320) element.textContent = "320 mil+";
        if (target === 120) element.textContent = "120+";
        if (target === 28) element.textContent = "28";
        if (target === 17) element.textContent = "17";
        countupObserver.unobserve(element);
        return;
      }

      const startTime = performance.now();
      const duration = 1200;
      const formatValue = (value) => {
        const rounded = Math.round(value);
        if (target === 320) return `${rounded} mil+`;
        if (target === 120) return `${rounded}+`;
        return `${rounded}`;
      };

      const tick = (now) => {
        const progress = clamp((now - startTime) / duration, 0, 1);
        const eased = easeInOut(progress);
        element.textContent = formatValue(target * eased);
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          countupObserver.unobserve(element);
        }
      };

      window.requestAnimationFrame(tick);
    });
  },
  { threshold: 0.45 }
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

countupElements.forEach((element) => {
  countupObserver.observe(element);
});

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  updateImageTransitions();
  updateActiveNavLink();
  updateHeaderState();
});
updateScrollProgress();
updateImageTransitions();
updateActiveNavLink();
updateHeaderState();
animate();

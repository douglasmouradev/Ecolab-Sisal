const form = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const newsletterForm = document.querySelector(".newsletter-form");
const newsletterStatus = document.querySelector(".newsletter-status");
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector("#nav-primary");
const navLinks = primaryNav
  ? Array.from(primaryNav.querySelectorAll("a[href^='#']:not(.btn-nav)"))
  : [];
const siteHeader = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress-bar");
const revealElements = document.querySelectorAll(".reveal");
const editorialBreaks = document.querySelectorAll(".editorial-break");
const countupElements = document.querySelectorAll("[data-countup]");
const siteLoader = document.querySelector(".site-loader");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const MOTION_KEY = "sisal-reduce-motion";
const siteConfig = window.SISAL_SITE || {};

if (localStorage.getItem(MOTION_KEY) === "1") {
  document.body.classList.add("reduce-motion-user");
}

const isMotionReduced = () =>
  prefersReducedMotion.matches ||
  document.body.classList.contains("reduce-motion-user");

const state = {
  progressWidth: 0,
  targetProgressWidth: 0,
  parallaxY: editorialBreaks.map(() => 0)
};

const scroll3dSelectorsFull = [
  ".editorial-break",
  ".hero-card",
  ".case-card",
  ".cards .card",
  ".timeline article",
  ".inline-cta",
  ".testimonial",
  ".newsletter-wrap",
  ".quote blockquote"
];

const scroll3dSelectorsLite = [".editorial-break", ".hero-card"];

const getScroll3dSelectors = () => {
  if (window.innerWidth <= 920) return scroll3dSelectorsLite;
  return scroll3dSelectorsFull;
};

const scroll3dElements = [];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const focusStatus = (node) => {
  if (!node) return;
  node.scrollIntoView({
    behavior: isMotionReduced() ? "auto" : "smooth",
    block: "nearest"
  });
};
const lerp = (start, end, factor) => start + (end - start) * factor;
const easeInOut = (t) => 0.5 - Math.cos(Math.PI * clamp(t, 0, 1)) / 2;
const fieldErrorMap = new WeakMap();
let animationFrameId = 0;
let shouldAnimate = true;

const clearFieldError = (field) => {
  if (!field) return;
  field.classList.remove("is-invalid");
  field.setAttribute("aria-invalid", "false");
  const helper = fieldErrorMap.get(field);
  if (helper) {
    helper.textContent = "";
    helper.hidden = true;
  }
};

const setFieldError = (field, message) => {
  if (!field) return;
  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");
  const helper = fieldErrorMap.get(field);
  if (helper) {
    helper.textContent = message;
    helper.hidden = false;
  }
};

const getFieldErrorMessage = (field) => {
  if (!field.validity) return "Verifique este campo.";
  if (field.validity.valueMissing) return "Preencha este campo obrigatório.";
  if (field.validity.typeMismatch) return "Digite um valor válido.";
  if (field.validity.tooShort) return `Use pelo menos ${field.minLength} caracteres.`;
  if (field.validity.tooLong) return `Use no máximo ${field.maxLength} caracteres.`;
  if (field.validity.patternMismatch) return "Formato inválido.";
  return "Verifique este campo.";
};

const registerFieldHelper = (field, prefix) => {
  if (!field || !field.id || fieldErrorMap.has(field)) return;
  const helper = document.createElement("p");
  helper.id = `${prefix}-${field.id}-error`;
  helper.className = "field-error";
  helper.hidden = true;
  field.insertAdjacentElement("afterend", helper);
  field.setAttribute("aria-describedby", helper.id);
  field.setAttribute("aria-invalid", "false");
  fieldErrorMap.set(field, helper);
};

let siteReady = false;

const finishSiteReady = () => {
  if (siteReady) return;
  siteReady = true;
  document.body.classList.remove("no-js");
  document.body.classList.add("js-enabled", "is-loaded", "is-ready");
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
  const barFill = document.querySelector(".site-loader__fill");
  const loaderTrack = document.querySelector(".site-loader__track");
  if (barFill) barFill.style.width = "100%";
  if (loaderTrack) loaderTrack.setAttribute("aria-valuenow", "100");
  if (siteLoader) {
    siteLoader.classList.add("is-done");
    siteLoader.setAttribute("aria-hidden", "true");
    siteLoader.setAttribute("aria-busy", "false");
  }
  initScroll3D();
  syncAnimationState();
};

const initSiteLoader = () => {
  if (!siteLoader) {
    finishSiteReady();
    return;
  }
  const barFill = siteLoader.querySelector(".site-loader__fill");
  const loaderTrack = siteLoader.querySelector(".site-loader__track");
  let progress = 0;

  const tick = () => {
    if (siteReady) return;
    progress = Math.min(100, progress + (isMotionReduced() ? 50 : 14));
    if (barFill) barFill.style.width = `${progress}%`;
    if (loaderTrack) loaderTrack.setAttribute("aria-valuenow", String(Math.round(progress)));
    if (progress < 100) window.setTimeout(tick, isMotionReduced() ? 40 : 70);
  };
  tick();

  const delay = isMotionReduced() ? 120 : siteConfig.loaderMs || 750;
  const maxDelay = siteConfig.loaderMaxMs || 2600;
  window.setTimeout(finishSiteReady, delay);
  window.setTimeout(finishSiteReady, maxDelay);
};

const initMotionToggle = () => {
  const toggle = document.querySelector("[data-motion-toggle]");
  if (!toggle) return;

  const syncToggle = () => {
    const reduced = localStorage.getItem(MOTION_KEY) === "1";
    document.body.classList.toggle("reduce-motion-user", reduced);
    toggle.setAttribute("aria-pressed", String(reduced));
    toggle.textContent = reduced ? "Restaurar animações" : "Reduzir animações";
    initScroll3D();
    syncAnimationState();
  };

  syncToggle();
  toggle.addEventListener("click", () => {
    const next = localStorage.getItem(MOTION_KEY) !== "1";
    localStorage.setItem(MOTION_KEY, next ? "1" : "0");
    syncToggle();
  });
};

const startApp = () => {
  initSiteLoader();
  initMotionToggle();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}

window.addEventListener(
  "load",
  () => {
    if (!siteReady) finishSiteReady();
    updateScroll3D();
    primeVisibleReveals();
  },
  { once: true }
);

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

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id);
    });
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
  const contactHoneypot = form.querySelector('input[name="company"]');

  const validateField = (field) => {
    const isValid = field.checkValidity();
    if (isValid) {
      clearFieldError(field);
    } else {
      setFieldError(field, getFieldErrorMessage(field));
    }
    return isValid;
  };

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    if (field === contactHoneypot) return;
    registerFieldHelper(field, "contact");
  });

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    if (field === contactHoneypot) return;
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
    const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(
      (field) => field !== contactHoneypot
    );

    if (contactHoneypot?.value.trim()) {
      form.reset();
      fields.forEach((field) => clearFieldError(field));
      if (formStatus) {
        formStatus.textContent = "Mensagem enviada com sucesso! Retornaremos em breve pelo e-mail informado.";
        formStatus.className = "form-status is-success";
        focusStatus(formStatus);
      }
      return;
    }

    const invalidFields = fields.filter((field) => !validateField(field));

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
          focusStatus(formStatus);
        }
        form.reset();
        fields.forEach((field) => clearFieldError(field));
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
  const newsletterHoneypot = newsletterForm.querySelector('input[name="company"]');
  registerFieldHelper(newsletterInput, "newsletter");

  newsletterInput?.addEventListener("blur", () => {
    if (newsletterInput.checkValidity()) {
      clearFieldError(newsletterInput);
    } else {
      setFieldError(newsletterInput, getFieldErrorMessage(newsletterInput));
    }
  });

  newsletterInput?.addEventListener("input", () => {
    if (newsletterInput.classList.contains("is-invalid") && newsletterInput.checkValidity()) {
      clearFieldError(newsletterInput);
    }
  });

  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = newsletterForm.querySelector('button[type="submit"]');
    const endpoint = newsletterForm.getAttribute("action");

    if (newsletterHoneypot?.value.trim()) {
      newsletterForm.reset();
      clearFieldError(newsletterInput);
      if (newsletterStatus) {
        newsletterStatus.textContent =
          "Inscrição enviada com sucesso! Em breve você receberá novidades no seu e-mail.";
        newsletterStatus.className = "newsletter-status is-success";
        focusStatus(newsletterStatus);
      }
      return;
    }

    if (!newsletterInput || !newsletterInput.checkValidity()) {
      if (newsletterInput) {
        setFieldError(newsletterInput, getFieldErrorMessage(newsletterInput));
      }
      if (newsletterStatus) {
        newsletterStatus.textContent = "Digite um e-mail válido para assinar a newsletter.";
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
            "Inscrição enviada com sucesso! Em breve você receberá novidades no seu e-mail.";
          newsletterStatus.className = "newsletter-status is-success";
          focusStatus(newsletterStatus);
        }
        newsletterForm.reset();
        clearFieldError(newsletterInput);
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
          "Não foi possível concluir o envio. Tente novamente em alguns instantes.";
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

const clearScroll3DStyles = (element) => {
  element.classList.remove("scroll-3d");
  element.style.removeProperty("--rx");
  element.style.removeProperty("--sy");
  element.style.removeProperty("--sz");
  element.style.removeProperty("--sc");
};

const initScroll3D = () => {
  scroll3dElements.length = 0;
  document.body.classList.remove("has-scroll-3d");
  document.querySelectorAll(".scroll-3d").forEach(clearScroll3DStyles);

  if (isMotionReduced()) {
    return;
  }

  getScroll3dSelectors().forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add("scroll-3d");
      scroll3dElements.push(element);
    });
  });

  if (scroll3dElements.length) {
    document.body.classList.add("has-scroll-3d");
    updateScroll3D();
  }
};

const updateScroll3D = () => {
  if (!scroll3dElements.length || isMotionReduced()) {
    return;
  }

  const viewportHeight = window.innerHeight;
  const motionScale = viewportHeight <= 920 ? 0.5 : 1;

  scroll3dElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < -viewportHeight * 0.25 || rect.top > viewportHeight * 1.25) {
      return;
    }

    const isEditorial = element.classList.contains("editorial-break");
    const center = rect.top + rect.height * 0.5;
    const delta = (center - viewportHeight * 0.5) / viewportHeight;
    const focus = clamp(1 - Math.abs(delta) * 1.25, 0, 1);
    const weight = isEditorial ? 1.35 : 1;

    const rotateX = clamp(delta * -16 * weight * motionScale, -22, 22);
    const translateY = delta * -32 * weight * motionScale;
    const translateZ = (focus - 0.45) * 90 * weight * motionScale;
    const scale = 0.94 + focus * 0.06;

    element.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--sy", `${translateY.toFixed(1)}px`);
    element.style.setProperty("--sz", `${translateZ.toFixed(1)}px`);
    element.style.setProperty("--sc", scale.toFixed(3));

    if (isEditorial) {
      const media = element.querySelector(".editorial-break__media");
      const copy = element.querySelector(".editorial-break__copy");
      if (media) {
        const parallaxY = delta * -42 * motionScale;
        media.style.setProperty("--parallax-y", `${parallaxY.toFixed(1)}px`);
        media.style.setProperty("--media-rx", `${(rotateX * 0.35).toFixed(2)}deg`);
      }
      if (copy) {
        copy.style.setProperty("--copy-z", `${(36 + focus * 28).toFixed(0)}px`);
      }
    }
  });
};

const updateEditorialParallax = () => {
  if (isMotionReduced()) {
    return;
  }
  if (document.body.classList.contains("has-scroll-3d")) {
    return;
  }

  const viewportHeight = window.innerHeight;
  editorialBreaks.forEach((block, index) => {
    const media = block.querySelector(".editorial-break__media");
    if (!media) return;
    const rect = block.getBoundingClientRect();
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const normalized = clamp(progress, 0, 1);
    const shift = (normalized - 0.5) * 36;
    state.parallaxY[index] = shift;
    media.style.setProperty("--parallax-y", `${shift.toFixed(1)}px`);
  });
};

let ticking = false;
const onScroll = () => {
  updateScrollProgress();
  updateActiveNavLink();
  updateHeaderState();
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateScroll3D();
      updateEditorialParallax();
      ticking = false;
    });
    ticking = true;
  }
};

const animate = () => {
  if (!shouldAnimate) {
    animationFrameId = 0;
    return;
  }

  state.progressWidth = lerp(state.progressWidth, state.targetProgressWidth, 0.18);
  if (progressBar) {
    progressBar.style.width = `${state.progressWidth.toFixed(2)}%`;
  }

  animationFrameId = window.requestAnimationFrame(animate);
};

const countupObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.getAttribute("data-countup"));
      if (!target || element.dataset.animated === "true") return;

      element.dataset.animated = "true";
      if (isMotionReduced()) {
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
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

const primeVisibleReveals = () => {
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      element.classList.add("is-visible");
    }
  });
};

revealElements.forEach((element, index) => {
  const parent = element.parentElement;
  const siblings = parent ? Array.from(parent.children).filter((child) => child.classList.contains("reveal")) : [];
  const siblingIndex = siblings.indexOf(element);
  const delay = siblingIndex >= 0 ? siblingIndex * 70 : index % 5 * 70;
  element.style.setProperty("--reveal-delay", `${delay}ms`);
  if (!document.body.classList.contains("is-loaded")) {
    revealObserver.observe(element);
  } else if (!element.classList.contains("is-visible")) {
    revealObserver.observe(element);
  }
});

if (document.body.classList.contains("is-loaded")) {
  primeVisibleReveals();
} else {
  window.addEventListener(
    "load",
    () => {
      if (document.body.classList.contains("is-loaded")) {
        primeVisibleReveals();
      }
    },
    { once: true }
  );
}

countupElements.forEach((element) => {
  countupObserver.observe(element);
});

window.addEventListener("scroll", onScroll, { passive: true });
const syncAnimationState = () => {
  const reducedMotion = isMotionReduced();
  shouldAnimate = !document.hidden && !reducedMotion;
  initScroll3D();

  if (!shouldAnimate) {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    if (progressBar) {
      progressBar.style.width = `${state.targetProgressWidth.toFixed(2)}%`;
    }
    updateScroll3D();
    return;
  }

  if (!animationFrameId) {
    animationFrameId = window.requestAnimationFrame(animate);
  }
};

prefersReducedMotion.addEventListener("change", syncAnimationState);
document.addEventListener("visibilitychange", syncAnimationState);
window.addEventListener("resize", () => {
  initScroll3D();
  updateScroll3D();
  updateEditorialParallax();
  updateActiveNavLink();
  updateHeaderState();
});
updateScrollProgress();
updateScroll3D();
updateEditorialParallax();
updateActiveNavLink();
updateHeaderState();
syncAnimationState();

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const loader = $(".page-loader");
  const finishLoading = () => {
    if (!loader) return;
    if (window.gsap && !reducedMotion) {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.85,
        delay: 0.15,
        ease: "power4.inOut",
        onComplete: () => loader.remove(),
      });
    } else {
      loader.style.display = "none";
    }
  };
  window.addEventListener("load", finishLoading);
  setTimeout(finishLoading, 2600);

  const header = $("[data-header]");
  let lastScroll = 0;
  const updateHeader = () => {
    const y = window.scrollY;
    header?.classList.toggle(
      "scrolled",
      y > 40 && !document.body.classList.contains("menu-open"),
    );
    if (
      y > lastScroll &&
      y > 500 &&
      window.innerWidth > 980 &&
      !document.body.classList.contains("menu-open")
    )
      header.style.transform = "translateY(-100%)";
    else header.style.transform = "";
    lastScroll = y;
  };
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuButton = $(".menu-button");
  const mobileMenu = $(".mobile-menu");
  const toggleMenu = (force) => {
    const open =
      typeof force === "boolean"
        ? force
        : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuButton.classList.toggle("active", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (header) {
      header.style.transform = "";
      header.classList.remove("scrolled");
    }
  };
  menuButton?.addEventListener("click", () => toggleMenu());
  $$(".mobile-menu a").forEach((link) =>
    link.addEventListener("click", () => toggleMenu(false)),
  );

  const searchPanel = $(".search-panel");
  const openSearch = () => {
    searchPanel.classList.add("open");
    searchPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => $("#site-search")?.focus(), 350);
  };
  const closeSearch = () => {
    searchPanel.classList.remove("open");
    searchPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
  $(".search-trigger")?.addEventListener("click", openSearch);
  $(".search-close")?.addEventListener("click", closeSearch);
  $(".search-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    closeSearch();
    document
      .querySelector("#familia")
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });

  const toast = $(".toast");
  $(".bag-trigger")?.addEventListener("click", () => {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  });

  const scrollCarousel = (name, direction) => {
    const track = $(`[data-carousel="${name}"]`);
    if (!track) return;
    const horizontalTrigger = window.ScrollTrigger?.getById(
      `${name}-horizontal`,
    );
    if (horizontalTrigger && window.innerWidth > 980) {
      const currentProgress = horizontalTrigger.progress;
      const targetProgress = Math.max(
        0,
        Math.min(1, currentProgress + direction * 0.24),
      );
      const targetScroll =
        horizontalTrigger.start +
        (horizontalTrigger.end - horizontalTrigger.start) * targetProgress;
      const smoother = window.ScrollSmoother?.get();
      if (smoother) smoother.scrollTo(targetScroll, true);
      else window.scrollTo({ top: targetScroll, behavior: "smooth" });
      return;
    }
    track.scrollBy({
      left: direction * Math.min(track.clientWidth * 0.78, 520),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };
  $$("[data-carousel-prev]").forEach((button) =>
    button.addEventListener("click", () =>
      scrollCarousel(button.dataset.carouselPrev, -1),
    ),
  );
  $$("[data-carousel-next]").forEach((button) =>
    button.addEventListener("click", () =>
      scrollCarousel(button.dataset.carouselNext, 1),
    ),
  );

  const modal = $(".detail-modal");
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
  $$(".plus-button").forEach((button) =>
    button.addEventListener("click", () => {
      $("#modal-title").textContent = button.dataset.modalTitle;
      $(".modal-copy").textContent = button.dataset.modalCopy;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      $(".modal-close").focus();
    }),
  );
  $(".modal-close")?.addEventListener("click", closeModal);
  $(".modal-backdrop")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modal?.classList.contains("open")) closeModal();
    if (searchPanel?.classList.contains("open")) closeSearch();
    if (mobileMenu?.classList.contains("open")) toggleMenu(false);
  });

  if (!window.gsap || reducedMotion) return;

  const plugins = [
    window.ScrollTrigger,
    window.ScrollSmoother,
    window.SplitText,
  ].filter(Boolean);
  gsap.registerPlugin(...plugins);

  if (
    window.ScrollSmoother &&
    window.ScrollTrigger &&
    window.innerWidth > 767
  ) {
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const wrapper = document.createElement("div");
    const content = document.createElement("div");
    wrapper.id = "smooth-wrapper";
    content.id = "smooth-content";
    main.parentNode.insertBefore(wrapper, main);
    wrapper.appendChild(content);
    content.appendChild(main);
    content.appendChild(footer);
    ScrollSmoother.create({
      wrapper,
      content,
      smooth: 1.15,
      effects: true,
      normalizeScroll: true,
    });
  }

  const intro = gsap.timeline({ delay: 0.7 });
  intro
    .fromTo(
      ".hero-image",
      { scale: 1.14, filter: "brightness(.45)" },
      {
        scale: 1.01,
        filter: "brightness(1)",
        duration: 1.6,
        ease: "power3.out",
      },
    )
    .from(".hero-eyebrow", {
      y: 18,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    })
    .from(
      ".hero-title",
      { y: 70, opacity: 0, duration: 1, ease: "power4.out" },
      "-=.55",
    )
    .from(
      ".hero-copy",
      { y: 25, opacity: 0, duration: 0.7, ease: "power3.out" },
      "-=.5",
    )
    .from(
      ".hero-cta-row",
      { y: 20, opacity: 0, duration: 0.65, ease: "power3.out" },
      "-=.45",
    )
    .from(".hero-meta, .scroll-cue", { opacity: 0, duration: 0.7 }, "-=.4");

  if (window.SplitText) {
    $$(".split-title:not(.hero-title)").forEach((title) => {
      const split = new SplitText(title, {
        type: "lines",
        linesClass: "split-line",
      });
      split.lines.forEach((line) => {
        const wrapper = document.createElement("span");
        wrapper.className = "split-mask";
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.05,
        stagger: 0.09,
        ease: "power4.out",
        scrollTrigger: { trigger: title, start: "top 88%", once: true },
      });
    });
  }

  gsap.to(".hero-image", {
    scale: 1.1,
    yPercent: 6,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.2,
    },
  });
  gsap.to(".hero-content", {
    yPercent: 22,
    opacity: 0.15,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "85% top",
      scrub: 1,
    },
  });

  gsap.from(".product-card", {
    y: 90,
    rotate: 1.5,
    opacity: 0,
    duration: 1,
    stagger: 0.11,
    ease: "power3.out",
    scrollTrigger: { trigger: ".product-scroll", start: "top 85%", once: true },
  });

  const horizontalSections = [
    {
      section: ".family",
      pin: ".family-pin",
      track: ".product-scroll",
      id: "products-horizontal",
    },
    {
      section: ".details",
      pin: ".details-pin",
      track: ".highlights-scroll",
      id: "highlights-horizontal",
    },
  ];
  const horizontalMedia = gsap.matchMedia();
  horizontalMedia.add("(min-width: 981px)", () => {
    horizontalSections.forEach(({ section, pin, track, id }) => {
      const trackElement = $(track);
      const distance = () =>
        Math.max(0, trackElement.scrollWidth - window.innerWidth);
      gsap.to(trackElement, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          id,
          trigger: section,
          pin,
          start: "top top",
          end: () => `+=${distance() + window.innerWidth * 0.6}`,
          scrub: 1.15,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });
  });

  gsap.to(".marquee-one", {
    xPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: ".statement",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
  gsap.to(".marquee-two", {
    xPercent: 18,
    ease: "none",
    scrollTrigger: {
      trigger: ".statement",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  const aboutTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".about",
      start: "top 72%",
      end: "55% 55%",
      scrub: 0.65,
    },
  });
  aboutTimeline
    .from(".about .eyebrow", { x: -35, opacity: 0, duration: 0.35 })
    .from(
      ".about-copy .about-lead",
      {
        y: 75,
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.65,
        ease: "power3.out",
      },
      "-=.1",
    )
    .from(
      ".about-copy p:not(.about-lead)",
      {
        y: 55,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.55,
        ease: "power3.out",
      },
      "-=.35",
    )
    .from(
      ".about-link",
      { y: 30, scale: 0.88, opacity: 0, duration: 0.45, ease: "back.out(1.8)" },
      "-=.2",
    );

  gsap.from(".highlight-card", {
    y: 95,
    rotate: 1.2,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".highlights-scroll",
      start: "top 85%",
      once: true,
    },
  });
  gsap.to(".compare-orb", {
    yPercent: -22,
    rotation: 25,
    ease: "none",
    scrollTrigger: {
      trigger: ".compare",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.1,
    },
  });

  gsap.from(".footer-directory > *", {
    y: 35,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".footer-directory",
      start: "top 88%",
      once: true,
    },
  });

  $$(".magnetic").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      gsap.to(button, {
        x: (event.clientX - rect.left - rect.width / 2) * 0.18,
        y: (event.clientY - rect.top - rect.height / 2) * 0.25,
        duration: 0.35,
        ease: "power2.out",
      });
    });
    button.addEventListener("mouseleave", () =>
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1,.35)",
      }),
    );
  });
})();

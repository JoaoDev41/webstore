(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => motionQuery.matches;
  const arrow =
    '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  let smoother = null;
  let activeDialog = null;
  let dialogOpener = null;
  const header = $("[data-header]");
  const menu = $("#mobile-menu");
  const menuButton = $(".menu-button");
  const search = $("#search-panel");
  const modal = $(".detail-modal");
  const track = $('[data-carousel="products"]');
  const cards = $$(".product-card");
  // The existing HTML catalog is the source of truth: preserve names and prices.
  // Add verified technical fields to specifications when source material exists.
  const products = cards.map((card) => ({
    id: card.id,
    name: $("h3", card).textContent,
    description: $("p:not(.product-color)", card).textContent.trim(),
    price: $("strong", card).textContent,
    image: $("img", card).getAttribute("src"),
    alt: $("img", card).alt,
    colors: [
      { name: card.dataset.color, image: $("img", card).getAttribute("src") },
    ],
    specifications: null,
  }));
  const productById = (id) => products.find((product) => product.id === id);

  function openDialog(dialog, opener) {
    if (activeDialog) closeDialog(false);
    dialogOpener = opener || document.activeElement;
    activeDialog = dialog;
    smoother?.paused(true);
    document.body.classList.add("overlay-open");
    dialog.showModal();
    if (dialog === menu) menuButton.setAttribute("aria-expanded", "true");
    if (dialog === search) $("#site-search").focus();
    else $("[data-close]", dialog).focus();
  }
  function closeDialog(restoreFocus = true) {
    if (!activeDialog) return;
    const dialog = activeDialog;
    activeDialog = null;
    dialog.close();
    document.body.classList.remove("overlay-open");
    smoother?.paused(false);
    menuButton.setAttribute("aria-expanded", "false");
    if (restoreFocus && dialogOpener?.isConnected)
      dialogOpener.focus({ preventScroll: true });
  }
  $$("dialog").forEach((dialog) => {
    $("[data-close]", dialog).addEventListener("click", () => closeDialog());
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog || dialog === menu) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        closeDialog();
    });
  });
  menuButton.addEventListener("click", () => openDialog(menu, menuButton));
  $(".search-trigger").addEventListener("click", (event) => {
    $("#site-search").value = "";
    renderSearch("");
    openDialog(search, event.currentTarget);
  });
  matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
    if (event.matches && activeDialog === menu) closeDialog();
  });

  function navigateTo(target, focus = true) {
    if (!target) return;
    if (activeDialog) closeDialog(false);
    if (smoother)
      smoother.scrollTo(
        Math.max(0, smoother.offset(target, "top top") - 95),
        !reduced(),
      );
    else
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + scrollY - 90),
        behavior: reduced() ? "instant" : "smooth",
      });
    if (focus) {
      if (!target.hasAttribute("tabindex"))
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
  function navigateProduct(id) {
    const index = products.findIndex((product) => product.id === id);
    if (index < 0) return;
    navigateTo($("#familia"), false);
    galleryTo(index);
    const target = $(".product-visual", cards[index]);
    target.focus({ preventScroll: true });
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (link.dataset.productDetails) {
      event.preventDefault();
      showProduct(link.dataset.productDetails, link);
      return;
    }
    if (link.dataset.compareProduct) {
      event.preventDefault();
      selectForComparison(link.dataset.compareProduct);
      navigateTo($("#comparar"));
      return;
    }
    if (link.dataset.showProduct) {
      event.preventDefault();
      navigateProduct(link.dataset.showProduct);
      return;
    }
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      event.preventDefault();
      navigateTo(target);
    }
  });

  const normalized = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  function renderSearch(query) {
    const terms = normalized(query).split(/\s+/).filter(Boolean);
    const results = products.filter((product) => {
      const haystack = normalized(`${product.name} ${product.colors[0].name}`);
      return terms.every((term) => haystack.includes(term));
    });
    $("#search-count").textContent =
      `${results.length} ${results.length === 1 ? "modelo encontrado" : "modelos encontrados"}`;
    const container = $(".search-results");
    container.replaceChildren();
    if (!results.length) {
      const empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent =
        "Nenhum modelo encontrado. Tente “iPhone 17”, “Air” ou uma cor, como “lavanda”.";
      container.append(empty);
    }
    results.forEach((product) => {
      const link = document.createElement("a");
      link.className = "search-result";
      link.href = `#${product.id}`;
      link.dataset.showProduct = product.id;
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = "";
      img.width = 50;
      img.height = 54;
      const text = document.createElement("span");
      text.textContent = product.name;
      const small = document.createElement("small");
      small.textContent = `${product.colors[0].name} · ${product.price}`;
      text.append(small);
      link.append(img, text);
      link.insertAdjacentHTML("beforeend", arrow);
      container.append(link);
    });
  }
  $("#site-search").addEventListener("input", (event) =>
    renderSearch(event.target.value),
  );
  $(".search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const first = $(".search-result");
    if (first) navigateProduct(first.dataset.showProduct);
  });

  let galleryIndex = 0;
  const prev = $("[data-carousel-prev]");
  const next = $("[data-carousel-next]");
  function updateGallery() {
    const max = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft <= 2) galleryIndex = 0;
    else if (track.scrollLeft >= max - 3) galleryIndex = products.length - 1;
    else {
      const edge =
        track.getBoundingClientRect().left +
        parseFloat(getComputedStyle(track).paddingLeft);
      galleryIndex = cards.reduce(
        (best, card, index) =>
          Math.abs(card.getBoundingClientRect().left - edge) <
          Math.abs(cards[best].getBoundingClientRect().left - edge)
            ? index
            : best,
        0,
      );
    }
    $("#gallery-index").textContent = String(galleryIndex + 1).padStart(2, "0");
    $(".gallery-progress span").style.width =
      `${((galleryIndex + 1) / products.length) * 100}%`;
    cards.forEach((card, index) =>
      card.classList.toggle("is-active", index === galleryIndex),
    );
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 3;
  }
  function galleryTo(index) {
    const bounded = Math.max(0, Math.min(products.length - 1, index));
    const padding = parseFloat(getComputedStyle(track).paddingLeft);
    const left =
      cards[bounded].getBoundingClientRect().left -
      track.getBoundingClientRect().left +
      track.scrollLeft -
      padding;
    track.scrollTo({ left, behavior: reduced() ? "instant" : "smooth" });
  }
  prev.addEventListener("click", () => galleryTo(galleryIndex - 1));
  next.addEventListener("click", () => galleryTo(galleryIndex + 1));
  track.addEventListener("scroll", updateGallery, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    galleryTo(
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? products.length - 1
          : galleryIndex + (event.key === "ArrowRight" ? 1 : -1),
    );
  });
  new ResizeObserver(updateGallery).observe(track);
  updateGallery();

  const selectors = [$("#compare-a"), $("#compare-b")];
  const selection = [products[0].id, products[1].id];
  selectors.forEach((select, side) => {
    products.forEach((product) =>
      select.add(new Option(product.name, product.id)),
    );
    select.value = selection[side];
    select.addEventListener("change", () => {
      const previous = selection[side];
      selection[side] = select.value;
      if (selection[1 - side] === select.value) selection[1 - side] = previous;
      renderComparison();
    });
  });
  function renderComparison() {
    selection.forEach((id, side) => {
      const product = productById(id);
      selectors[side].value = id;
      const target = $(`#compare-product-${side ? "b" : "a"}`);
      // All interpolated values below come from the repository's static catalog.
      target.innerHTML = `<img src="${product.image}" alt="${product.alt}" width="372" height="395" loading="lazy" /><dl><div><dt>Preço de referência</dt><dd class="compare-price">${product.price}</dd></div><div><dt>Em poucas palavras</dt><dd>${product.description}</dd></div><div><dt>Acabamento apresentado</dt><dd>${product.colors[0].name}</dd></div></dl><a class="text-link" href="#${id}" data-product-details="${id}">Explorar modelo ${arrow}</a>`;
      target.classList.remove("is-changing");
      requestAnimationFrame(() => target.classList.add("is-changing"));
    });
    $(".compare-status").textContent =
      `Comparando ${productById(selection[0]).name} e ${productById(selection[1]).name}.`;
  }
  function selectForComparison(id) {
    if (selection[0] === id) return;
    if (selection[1] === id)
      [selection[0], selection[1]] = [selection[1], selection[0]];
    else selection[0] = id;
    renderComparison();
  }
  renderComparison();

  function showProduct(id, opener) {
    const product = productById(id);
    if (!product) return;
    modal.classList.remove("no-image");
    $(".modal-image").innerHTML =
      `<img src="${product.image}" alt="${product.alt}" width="372" height="395" />`;
    $("#modal-title").textContent = product.name;
    $(".modal-copy").textContent = product.description;
    $(".modal-extra").innerHTML =
      `<strong>${product.price}</strong><p>Acabamento apresentado: ${product.colors[0].name}.</p><a class="text-link" href="#comparar" data-compare-product="${id}">Comparar este modelo ${arrow}</a><small>Preço preservado do catálogo original. Experiência conceitual, sem venda ou checkout.</small>`;
    openDialog(modal, opener);
  }
  const stories = {
    camera: {
      title: "Um outro ponto de vista.",
      copy: "Luz, composição e expressão fazem parte de cada fotografia. Esta seleção visual apresenta o tema de câmeras do catálogo original; os recursos disponíveis variam entre os modelos.",
      image: "IMGS/List%20Item-2.jpg",
      alt: "Retrato em preto e branco",
    },
    performance: {
      title: "Potência para as suas ideias.",
      copy: "Criar, jogar e alternar entre tarefas são diferentes formas de explorar um iPhone. A imagem do A19 Pro pertence ao material do iPhone 17 Pro. Nenhuma especificação de desempenho é atribuída ao conceito iPhone 18 Pro.",
      image: "IMGS/Container-2.jpg",
      alt: "Chip A19 Pro do material do iPhone 17 Pro",
    },
    system: {
      title: "Simples. Útil. Pessoal.",
      copy: "Hardware e software encontram uma linguagem em comum: uma experiência intuitiva, do primeiro toque à personalização da tela. A disponibilidade de recursos depende do modelo e da versão do sistema.",
      image: "IMGS/Container-1.jpg",
      alt: "Tela de um iPhone personalizada com uma fotografia",
    },
    privacy: {
      title: "Seu espaço é pessoal.",
      copy: "Privacidade faz parte da experiência: conhecer as permissões dos aplicativos e escolher como compartilhar informações ajuda você a manter o controle. Este conceito não solicita dados pessoais e a busca acontece inteiramente no seu navegador.",
      image: "IMGS/List%20Item-1.jpg",
      alt: "Símbolo de privacidade",
    },
  };
  $$("[data-story]").forEach((button) =>
    button.addEventListener("click", () => {
      const story = stories[button.dataset.story];
      modal.classList.remove("no-image");
      $(".modal-image").innerHTML =
        `<img src="${story.image}" alt="${story.alt}" width="372" height="680" />`;
      $("#modal-title").textContent = story.title;
      $(".modal-copy").textContent = story.copy;
      $(".modal-extra").replaceChildren();
      openDialog(modal, button);
    }),
  );

  // Real local movie, with a real extracted poster. A future asset can replace
  // data-src with assets/iphone-18-hero.mp4; never request an unprovided path.
  const video = $(".hero-video");
  const videoButton = $(".video-toggle");
  let heroVisible = true;
  let userPaused = false;
  let videoFailed = false;
  const constrained =
    navigator.connection?.saveData ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2);
  function updateVideoButton() {
    const playing = !video.paused;
    videoButton.innerHTML = `${playing ? "Pausar vídeo" : "Reproduzir vídeo"} <svg viewBox="0 0 24 24" aria-hidden="true">${playing ? '<path d="M8 6v12M16 6v12"/>' : '<path d="m8 5 11 7-11 7z"/>'}</svg>`;
    videoButton.setAttribute(
      "aria-label",
      `${playing ? "Pausar" : "Reproduzir"} vídeo do conceito`,
    );
  }
  function loadVideo() {
    if (!video.getAttribute("src")) {
      video.src = video.dataset.src;
      video.load();
    }
  }
  function syncVideo() {
    videoButton.hidden = reduced() || videoFailed;
    if (
      reduced() ||
      !heroVisible ||
      document.hidden ||
      userPaused ||
      constrained ||
      videoFailed
    ) {
      video.pause();
      return;
    }
    loadVideo();
    video.play().catch(() => {
      updateVideoButton();
    });
  }
  video.addEventListener("playing", () => {
    video.classList.add("is-playing");
    updateVideoButton();
  });
  video.addEventListener("pause", updateVideoButton);
  video.addEventListener("error", () => {
    videoFailed = true;
    video.classList.remove("is-playing");
    videoButton.hidden = true;
  });
  videoButton.addEventListener("click", () => {
    if (video.paused) {
      userPaused = false;
      loadVideo();
      video.play().catch(updateVideoButton);
    } else {
      userPaused = true;
      video.pause();
    }
  });
  new IntersectionObserver(
    (entries) => {
      heroVisible = entries[0].isIntersecting;
      syncVideo();
    },
    { threshold: 0.1 },
  ).observe($(".hero"));
  document.addEventListener("visibilitychange", syncVideo);
  motionQuery.addEventListener("change", syncVideo);

  let headerFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (headerFrame) return;
      headerFrame = requestAnimationFrame(() => {
        header.classList.toggle("scrolled", scrollY > 40);
        headerFrame = 0;
      });
    },
    { passive: true },
  );
  header.classList.toggle("scrolled", scrollY > 40);
  const navLinks = $$(".desktop-nav a");
  const observed = [
    $("#inicio"),
    $("#familia"),
    $("#detalhes"),
    $("#comparar"),
  ];
  const visibleSections = new Map();
  const navigationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        visibleSections.set(entry.target.id, entry.isIntersecting),
      );
      const id = observed.find((section) =>
        visibleSections.get(section.id),
      )?.id;
      if (!id) return;
      navLinks.forEach((link) => {
        if (link.hash === `#${id}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-15% 0px -45% 0px" },
  );
  observed.forEach((section) => navigationObserver.observe(section));

  // Interaction works even if any animation dependency fails to load.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(
    ...[window.ScrollTrigger, window.ScrollSmoother, window.SplitText].filter(
      Boolean,
    ),
  );
  const media = gsap.matchMedia();
  let introPlayed = false;
  media.add(
    {
      desktop: "(min-width: 1001px) and (pointer: fine)",
      mobile: "(max-width: 1000px), (pointer: coarse)",
      tall: "(min-height: 850px)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { desktop, reduce, tall } = context.conditions;
      if (reduce) return;
      const splits = [];
      if (desktop && window.ScrollSmoother) {
        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 0.85,
          effects: false,
          smoothTouch: false,
        });
      }
      if (!introPlayed && scrollY < 100) {
        introPlayed = true;
        const title = $("#hero-title");
        const split = window.SplitText
          ? SplitText.create(title, { type: "chars", aria: "auto" })
          : null;
        if (split) splits.push(split);
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".hero-media", { opacity: 0, duration: 1.5 }, 0)
          .from(".hero-eyebrow", { y: 12, opacity: 0, duration: 0.8 }, 0.2)
          .from(
            split?.chars || title,
            { yPercent: 50, opacity: 0, duration: 1.1, stagger: 0.025 },
            0.35,
          )
          .from(".hero-content", { y: 24, opacity: 0, duration: 0.9 }, 0.75)
          .from(".hero-bottom", { opacity: 0, duration: 0.8 }, 1);
      }
      if (desktop) {
        gsap.to(".hero-media", {
          scale: 1.055,
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        gsap.to(".hero-heading", {
          y: -45,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "70% top",
            scrub: 0.7,
          },
        });
        const reveal = gsap.timeline({
          scrollTrigger: {
            id: "concept-reveal",
            trigger: ".product-reveal",
            start: "top 84px",
            end: "+=450",
            pin: tall ? ".reveal-stage" : false,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        reveal
          .fromTo(
            ".reveal-figure img",
            { scale: 1.12, xPercent: 3 },
            { scale: 1, xPercent: 0, ease: "none" },
            0,
          )
          .fromTo(
            ".reveal-figure",
            { clipPath: "inset(7% 0 7% 10%)" },
            { clipPath: "inset(0% 0 0% 0%)", ease: "none" },
            0,
          )
          .fromTo(".reveal-counter", { opacity: 0.25 }, { opacity: 1 }, 0);
        gsap.from(".portrait-figure img", {
          yPercent: -5,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: ".camera-story",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        });
        gsap.from(".material-visual img", {
          scale: 1.1,
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: ".material-story",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        gsap.from(".performance-story figure", {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: ".performance-story",
            start: "top bottom",
            end: "bottom center",
            scrub: 0.6,
          },
        });
      }
      gsap.from(".statement-line", {
        xPercent: (index) => (index ? 5 : -4),
        ease: "none",
        scrollTrigger: {
          trigger: ".statement",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      gsap.fromTo(
        ".statement",
        { backgroundColor: "#bfa6b6" },
        {
          backgroundColor: "#ded3da",
          ease: "none",
          scrollTrigger: {
            trigger: ".statement",
            start: "top bottom",
            end: "center center",
            scrub: 0.6,
          },
        },
      );
      $$(".split-title").forEach((title) => {
        if (window.SplitText) {
          const split = SplitText.create(title, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            aria: "auto",
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 105,
                duration: 0.9,
                stagger: 0.07,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: title,
                  start: "top 91%",
                  toggleActions: "play none none reverse",
                },
              });
            },
          });
          splits.push(split);
        } else
          gsap.from(title, {
            y: 25,
            opacity: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: title,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          });
      });
      gsap.from(".final-experience > img", {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: ".final-experience",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      return () => {
        splits.forEach((split) => split.revert());
        smoother?.kill();
        smoother = null;
      };
    },
  );
  window.addEventListener(
    "load",
    () => {
      ScrollTrigger.refresh();
      const id = location.hash.slice(1);
      if (productById(id)) navigateProduct(id);
      else if (id) navigateTo(document.getElementById(id), false);
    },
    { once: true },
  );
})();

const cursor_circle = document.querySelector(".cursor-circle"),
  cursor = document.querySelectorAll(".cursor"),
  image_wrap = document.querySelector(".image-wrap");

const touchNoHover = window.matchMedia(
  "(hover: none), (pointer: coarse)",
).matches;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ===================================================
   1. CURSEUR PERSONNALISÉ
=================================================== */
if (!touchNoHover && cursor.length) {
  const interactiveSelector =
    "a, button, .btn, .more-btn, .getHover, .board-card, input[type='submit'], input[type='button'], summary, [role='button']";

  window.addEventListener("mousemove", (e) => {
    const target =
      e.target instanceof Element
        ? e.target
        : e.target && e.target.parentElement;

    cursor.forEach((el) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.classList.add("is-visible");
    });

    if (cursor_circle) {
      cursor_circle.classList.toggle(
        "biggerCursor",
        Boolean(target && target.closest(interactiveSelector)),
      );
    }
  });

  document.documentElement.addEventListener("mouseleave", () => {
    cursor.forEach((el) => {
      el.classList.remove("is-visible");
    });
    if (cursor_circle) cursor_circle.classList.remove("biggerCursor");
  });
} else {
  document.body.style.cursor = "auto";
}

/* ===================================================
   2. MENU MOBILE TOGGLE (RESPONSIVE COLLÈGUE)
=================================================== */
const heroNav = document.querySelector(".showcase-area nav");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

if (heroNav && mobileMenuToggle) {
  const closeMobileMenu = () => {
    heroNav.classList.remove("is-open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
  };

  mobileMenuToggle.addEventListener("click", () => {
    const willOpen = !heroNav.classList.contains("is-open");
    heroNav.classList.toggle("is-open", willOpen);
    mobileMenuToggle.setAttribute("aria-expanded", String(willOpen));
  });

  heroNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
      mobileMenuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!heroNav.contains(event.target)) closeMobileMenu();
  });
}

/* ===================================================
   3. HERO TIMELINE (DESKTOP & MOBILE)
=================================================== */
gsap.registerPlugin(ScrollTrigger);

let timeline = gsap.timeline({ paused: true });
const heroMm = typeof gsap.matchMedia === "function" ? gsap.matchMedia() : null;

if (heroMm) {
  heroMm.add(
    "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    () => {
      timeline = gsap.timeline({
        defaults: { duration: 1.3, ease: "power3.inOut" },
      });
      timeline
        .to(".image-wrap", {
          height: "440px",
          backgroundSize: "105%",
          duration: 1.5,
          ease: "power4.inOut",
        })
        .to(
          ".image-wrap",
          {
            height: "200px",
            backgroundPosition: "50% 58%",
            y: "0",
          },
          1.5,
        )
        .from(
          ".big-name",
          {
            y: getYDistance(".big-name"),
          },
          1.5,
        )
        .from(
          ".hide",
          {
            opacity: "0",
            duration: 1.3,
          },
          1.5,
        );
    },
  );

  heroMm.add(
    "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
    () => {
      timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });
      timeline
        .from(".showcase-area nav", {
          y: -16,
          opacity: 0,
          duration: 0.55,
        })
        .from(
          ".mobile-hero-eyebrow",
          { y: 14, opacity: 0, duration: 0.45 },
          0.12,
        )
        .from(".big-name", { y: 36, opacity: 0, duration: 0.75 }, 0.18)
        .fromTo(
          ".image-wrap",
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.9 },
          0.38,
        )
        .from(
          ".mobile-hero-actions",
          { y: 16, opacity: 0, duration: 0.5 },
          0.72,
        )
        .from(".bottom-section", { y: 12, opacity: 0, duration: 0.5 }, 0.82);
    },
  );

  heroMm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(
      ".showcase-area nav, .mobile-hero-eyebrow, .big-name, .image-wrap, .mobile-hero-actions, .bottom-section",
      { clearProps: "transform,opacity,clipPath" },
    );
  });
}

function getYDistance(el) {
  const node = document.querySelector(el);
  return node ? window.innerHeight - node.getBoundingClientRect().top : 0;
}

/* ===================================================
   4. SECTION ABOUT (CORRIGÉ : SANS TWEENS DE SORTIE)
=================================================== */
const aboutMm =
  typeof gsap.matchMedia === "function" ? gsap.matchMedia() : null;

if (aboutMm) {
  aboutMm.add(
    "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    () => {
      gsap.fromTo(
        ".about .title-grid--one",
        { y: 150 },
        {
          y: 0,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );

      gsap.fromTo(
        ".about2",
        { y: -150, x: -150 },
        {
          y: 0,
          x: 0,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );

      gsap.fromTo(
        ".about-text",
        { y: 100 },
        {
          y: -28,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );

      gsap.fromTo(
        ".about3",
        { x: 75, y: 100 },
        {
          x: 0,
          y: 0,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );

      gsap.fromTo(
        ".about4",
        { x: -75, y: 100 },
        {
          x: 0,
          y: 0,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );

      gsap.fromTo(
        ".about .title-grid--two",
        { y: 70 },
        {
          y: 0,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );

      gsap.fromTo(
        ".more-btn--desktop",
        { y: 40 },
        {
          y: 0,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "top 10%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          ease: "none",
        },
      );
    },
  );

  aboutMm.add(
    "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
    () => {
      const mobileReveals = [
        [".about .title-grid--two", ".about", "top 88%", "top 58%"],
        [".about .about0", ".about", "top 78%", "top 42%"],
        [".about-text", ".about-text", "top 92%", "top 62%"],
        [".more-btn--mobile", ".more-btn--mobile", "top 96%", "top 76%"],
      ];
      mobileReveals.forEach(([target, trigger, start, end], index) => {
        gsap.fromTo(
          target,
          { y: index === 0 ? 40 : 28, opacity: 0.2 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger,
              start,
              end,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
            ease: "none",
          },
        );
      });
    },
  );
}

/* ===================================================
   5. SECTION MISSION (ENTRÉE SEULE : PAS D'EXIT QUI EFFACE)
=================================================== */
if (!prefersReducedMotion) {
  gsap.fromTo(
    ".mission-grid .card",
    {
      x: () => (window.innerWidth <= 768 ? 36 : 120),
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: ".mission",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
      },
      ease: "none",
    },
  );
}

/* ===================================================
   6. SECTION CONTACT (RESPONSIVE & TOGGLE SAFE)
=================================================== */
const contactMm =
  typeof gsap.matchMedia === "function" ? gsap.matchMedia() : null;

if (contactMm) {
  const createContactReveal = (isMobile) => {
    const introItems =
      ".contact .contact-eyebrow, .contact .section-heading, .contact .section-description, .contact .contact-meta";
    const formItems =
      ".contact .contact-form__header, .contact .input-wrap, .contact .submit-wrap";

    gsap.set(introItems, { opacity: 0, y: isMobile ? 28 : 42 });
    gsap.set(".contact .contact-form", {
      clipPath: isMobile ? "inset(100% 0 0 0)" : "inset(0 0 0 100%)",
    });
    gsap.set(formItems, { opacity: 0, y: 18 });

    const contactTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: ".contact",
        start: isMobile ? "top 84%" : "top 74%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    contactTl
      .to(introItems, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
      })
      .to(
        ".contact .contact-form",
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
        0.18,
      )
      .to(formItems, { opacity: 1, y: 0, duration: 0.5, stagger: 0.055 }, 0.48);
  };

  contactMm.add(
    "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    () => createContactReveal(false),
  );
  contactMm.add(
    "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
    () => createContactReveal(true),
  );
  contactMm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(
      ".contact .contact-eyebrow, .contact .section-heading, .contact .section-description, .contact .contact-meta, .contact .contact-form, .contact .contact-form__header, .contact .input-wrap, .contact .submit-wrap",
      { clearProps: "all" },
    );
  });
}

/* ===================================================
   7. SECTION BOARD (SWIPER + BREAKPOINTS)
=================================================== */
const boardSwiper = new Swiper("#boardSwiper", {
  slidesPerView: "auto",
  spaceBetween: 24,
  grabCursor: false,
  resistance: true,
  resistanceRatio: 0.85,
  loop: true,
  speed: 800,
  autoplay: prefersReducedMotion
    ? false
    : {
        delay: 3200,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
  breakpoints: {
    769: {
      spaceBetween: 24,
    },
    0: {
      spaceBetween: 16,
    },
  },
});

if (!prefersReducedMotion) {
  gsap.fromTo(
    ".board .board-flex",
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: ".board",
        start: "top 80%",
        end: "top 45%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
      ease: "none",
    },
  );
}

/* ===================================================
   8. SECTION CTA & FOOTER (TOGGLE SAFE)
=================================================== */
const ctaMm = typeof gsap.matchMedia === "function" ? gsap.matchMedia() : null;

if (ctaMm) {
  ctaMm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(".cta .cta-eyebrow", { opacity: 0, x: -24 });
    gsap.set(".cta .cta-line", { y: 64, opacity: 0 });
    gsap.set(".cta .cta-block-dark", { y: 72, opacity: 0 });
    gsap.set(".cta .cta-img", { clipPath: "inset(0 0 0 100%)", scale: 1.12 });
    gsap.set(".cta .cta-join", { opacity: 0, y: 28, scale: 0.92 });

    const ctaTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: ".cta",
        start: "top 72%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    ctaTl
      .to(".cta .cta-eyebrow", { opacity: 1, x: 0, duration: 0.55 })
      .to(
        ".cta .cta-line",
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.7 },
        0.12,
      )
      .to(".cta .cta-block-dark", { y: 0, opacity: 1, duration: 0.65 }, 0.28)
      .to(
        ".cta .cta-img",
        { clipPath: "inset(0 0 0 0%)", scale: 1, duration: 0.95 },
        0.2,
      )
      .to(
        ".cta .cta-join",
        { opacity: 1, y: 0, scale: 1, duration: 0.5 },
        0.55,
      );
  });

  ctaMm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(
      ".cta .cta-eyebrow, .cta .cta-line, .cta .cta-block-dark, .cta .cta-img, .cta .cta-join",
      { clearProps: "all" },
    );
  });

  // Footer Timeline
  ctaMm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(".site-footer__meta", { opacity: 0, y: 28 });
    gsap.set(".site-footer__brand", { opacity: 0, y: 48 });
    gsap.set(".site-footer__line", { opacity: 0, y: 24 });
    gsap.set(".site-footer__nav a", { opacity: 0, y: 20 });
    gsap.set(".site-footer__base", { opacity: 0, y: 20 });

    const footerTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 85%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    footerTl
      .to(".site-footer__meta", { opacity: 1, y: 0, duration: 0.5 })
      .to(".site-footer__brand", { opacity: 1, y: 0, duration: 0.7 }, 0.1)
      .to(".site-footer__line", { opacity: 1, y: 0, duration: 0.55 }, 0.28)
      .to(
        ".site-footer__nav a",
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.45 },
        0.35,
      )
      .to(".site-footer__base", { opacity: 1, y: 0, duration: 0.5 }, 0.5);
  });

  ctaMm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(
      ".site-footer__meta, .site-footer__brand, .site-footer__line, .site-footer__nav a, .site-footer__base",
      { clearProps: "all" },
    );
  });
}

/* ===================================================
   9. EFFET PARALLAXE SOURIS (DESKTOP SEULEMENT)
=================================================== */
if (image_wrap && !touchNoHover) {
  image_wrap.addEventListener("mousemove", (e) => {
    let rect = image_wrap.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    let xSpeed = 0.008,
      ySpeed = 0.02;
    let xMoving = x - image_wrap.clientWidth / 2;
    let yMoving = y - image_wrap.clientHeight / 2;
    image_wrap.style.backgroundPosition = `calc(50% + ${
      xMoving * xSpeed
    }px) calc(58% + ${yMoving * ySpeed}px)`;
  });

  image_wrap.addEventListener("mouseover", () => {
    image_wrap.style.transition = ".2s background-position";
    setTimeout(() => {
      image_wrap.style.transition = "0s background-position";
    }, 200);
  });

  image_wrap.addEventListener("mouseout", () => {
    image_wrap.style.transition = ".5s background-position";
    image_wrap.style.backgroundPosition = "50% 58%";
  });

  setTimeout(() => {
    image_wrap.style.pointerEvents = "auto";
  }, timeline.endTime() * 1000);
}

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

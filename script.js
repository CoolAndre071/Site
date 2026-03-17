(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const revealSelectors = [
    ".hero .eyebrow",
    ".hero h1",
    ".hero .lead",
    ".hero .cta-row",
    ".hero .feature-card",
    ".section-title-wrap",
    ".audience-card",
    ".info-item",
    ".program-card",
    ".host-card",
    ".faq-item",
    ".bottom-cta",
  ];

  const revealItems = Array.from(
    document.querySelectorAll(revealSelectors.join(","))
  );

  if (!revealItems.length) {
    return;
  }

  revealItems.forEach((element, index) => {
    element.classList.add("reveal");
    const delayMs = (index % 6) * 70;
    element.style.setProperty("--reveal-delay", `${delayMs}ms`);
  });

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealItems.forEach((element) => observer.observe(element));
})();

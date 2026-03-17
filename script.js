(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const sections = Array.from(document.querySelectorAll("main > section"));

  if (!sections.length) {
    return;
  }

  sections.forEach((section) => section.classList.add("structure-section"));
  sections[0].classList.add("is-visible");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  if ("IntersectionObserver" in window) {
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
        threshold: 0.35,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  let isSnapping = false;
  let lastSnapAt = 0;
  const SNAP_COOLDOWN = 700;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getNearestSectionIndex = () => {
    const scrollTop = window.scrollY;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const distance = Math.abs(section.offsetTop - scrollTop);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  const snapToIndex = (targetIndex) => {
    const boundedIndex = clamp(targetIndex, 0, sections.length - 1);
    sections[boundedIndex].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        return;
      }

      if (isSnapping) {
        event.preventDefault();
        return;
      }

      const delta = event.deltaY;
      if (Math.abs(delta) < 8) {
        return;
      }

      const now = Date.now();
      if (now - lastSnapAt < SNAP_COOLDOWN) {
        event.preventDefault();
        return;
      }

      const currentIndex = getNearestSectionIndex();
      const direction = delta > 0 ? 1 : -1;
      const targetIndex = clamp(
        currentIndex + direction,
        0,
        sections.length - 1
      );

      if (targetIndex === currentIndex) {
        return;
      }

      event.preventDefault();
      lastSnapAt = now;
      isSnapping = true;
      snapToIndex(targetIndex);

      window.setTimeout(() => {
        isSnapping = false;
      }, SNAP_COOLDOWN);
    },
    { passive: false }
  );
})();

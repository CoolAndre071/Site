(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const STORAGE_KEY = "site-animation-preset";
  const REPLAY_STORAGE_KEY = "site-animation-replay-enabled";
  const DEFAULT_PRESET = "rise";
  const VALID_PRESETS = new Set([
    "rise",
    "slide-left",
    "zoom",
    "soft-blur",
    "none",
  ]);

  const presetSelect = document.querySelector("#animationPreset");
  const revealToggle = document.querySelector("#revealToggle");
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

  let observer = null;
  let replayEnabled = true;

  const normalizePreset = (value) =>
    VALID_PRESETS.has(value) ? value : DEFAULT_PRESET;

  const readStoredPreset = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const readStoredReplayMode = () => {
    try {
      return localStorage.getItem(REPLAY_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const storePreset = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore storage errors */
    }
  };

  const storeReplayMode = (isEnabled) => {
    try {
      localStorage.setItem(REPLAY_STORAGE_KEY, isEnabled ? "on" : "off");
    } catch {
      /* ignore storage errors */
    }
  };

  const disconnectObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const updateToggleButton = () => {
    if (!revealToggle) {
      return;
    }

    revealToggle.textContent = replayEnabled ? "Replay: ON" : "Replay: OFF";
    revealToggle.classList.toggle("is-off", !replayEnabled);
    revealToggle.setAttribute("aria-pressed", String(replayEnabled));
  };

  const runReveal = () => {
    if (!revealItems.length) {
      return;
    }

    disconnectObserver();

    revealItems.forEach((element, index) => {
      element.classList.add("reveal");
      element.classList.remove("is-visible");
      const delayMs = (index % 6) * 70;
      element.style.setProperty("--reveal-delay", `${delayMs}ms`);
    });

    const preset = root.dataset.anim || DEFAULT_PRESET;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canObserve = "IntersectionObserver" in window;

    if (
      preset === "none" ||
      prefersReducedMotion ||
      !canObserve
    ) {
      revealItems.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    if (replayEnabled) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
          });
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px -10% 0px",
        }
      );
    } else {
      observer = new IntersectionObserver(
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
    }

    revealItems.forEach((element) => observer.observe(element));
  };

  const setPreset = (rawPreset, shouldStore) => {
    const preset = normalizePreset(rawPreset);
    root.dataset.anim = preset;

    if (presetSelect && presetSelect.value !== preset) {
      presetSelect.value = preset;
    }

    if (shouldStore) {
      storePreset(preset);
    }

    runReveal();
  };

  const setReplayMode = (isEnabled, shouldStore) => {
    replayEnabled = Boolean(isEnabled);
    updateToggleButton();

    if (shouldStore) {
      storeReplayMode(replayEnabled);
    }

    runReveal();
  };

  const initialPreset = normalizePreset(readStoredPreset());
  const storedReplayMode = readStoredReplayMode();
  const initialReplayEnabled = storedReplayMode !== "off";

  setPreset(initialPreset, false);
  setReplayMode(initialReplayEnabled, false);

  if (presetSelect) {
    presetSelect.addEventListener("change", (event) => {
      const nextPreset = event.target.value;
      setPreset(nextPreset, true);
    });
  }

  if (revealToggle) {
    revealToggle.addEventListener("click", () => {
      setReplayMode(!replayEnabled, true);
    });
  }

  window.addEventListener("beforeunload", () => {
    disconnectObserver();
  });
})();

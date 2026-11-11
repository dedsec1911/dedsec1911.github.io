const motion = matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("offer-enter");
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.14});
  document.querySelectorAll(".offer").forEach(offer => observer.observe(offer));
}

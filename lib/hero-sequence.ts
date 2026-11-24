/** True once the pinned assembly sequence has played through. */
export function assemblyFinished() {
  const hero = document.getElementById("top");
  if (!hero) return window.scrollY > 24;

  const scrollable = hero.offsetHeight - window.innerHeight;
  if (scrollable <= 24) return window.scrollY > 24;

  const top = hero.getBoundingClientRect().top + window.scrollY;
  return window.scrollY >= top + scrollable - 8;
}

/** Rewind the sequence. Scroll position is the playhead, so the top is frame zero. */
export function replayAssembly() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}

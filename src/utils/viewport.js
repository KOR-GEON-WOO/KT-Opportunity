const FORM_FOCUS_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

function px(value) {
  return `${Math.max(0, Math.round(value))}px`;
}

function isFormFocused() {
  const active = document.activeElement;
  return Boolean(active?.matches?.(FORM_FOCUS_SELECTOR));
}

export function installViewportGuards() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  const root = document.documentElement;
  const viewport = window.visualViewport;
  let raf = 0;
  let stableHeight = window.innerHeight || root.clientHeight || 0;

  const sync = () => {
    raf = 0;
    const layoutHeight = window.innerHeight || root.clientHeight || 0;
    const visualHeight = viewport?.height || layoutHeight;
    const offsetTop = viewport?.offsetTop || 0;
    const formFocused = isFormFocused();
    if (!formFocused) stableHeight = layoutHeight;
    const referenceHeight = Math.max(layoutHeight, stableHeight);
    const compressedBy = Math.max(0, referenceHeight - visualHeight - offsetTop);
    const keyboardOpen = formFocused && compressedBy >= 120;

    root.style.setProperty('--app-height', px(layoutHeight));
    root.style.setProperty('--visual-viewport-height', px(visualHeight));
    root.style.setProperty('--visual-viewport-offset-top', px(offsetTop));
    root.style.setProperty('--keyboard-inset', keyboardOpen ? px(compressedBy) : '0px');
    root.dataset.keyboardOpen = keyboardOpen ? 'true' : 'false';
  };

  const scheduleSync = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(sync);
  };

  sync();
  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('orientationchange', scheduleSync, { passive: true });
  document.addEventListener('focusin', scheduleSync);
  document.addEventListener('focusout', scheduleSync);
  viewport?.addEventListener('resize', scheduleSync, { passive: true });
  viewport?.addEventListener('scroll', scheduleSync, { passive: true });

  return () => {
    if (raf) window.cancelAnimationFrame(raf);
    window.removeEventListener('resize', scheduleSync);
    window.removeEventListener('orientationchange', scheduleSync);
    document.removeEventListener('focusin', scheduleSync);
    document.removeEventListener('focusout', scheduleSync);
    viewport?.removeEventListener('resize', scheduleSync);
    viewport?.removeEventListener('scroll', scheduleSync);
    delete root.dataset.keyboardOpen;
    root.style.removeProperty('--app-height');
    root.style.removeProperty('--visual-viewport-height');
    root.style.removeProperty('--visual-viewport-offset-top');
    root.style.removeProperty('--keyboard-inset');
  };
}

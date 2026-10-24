/**
 * Reports whether the visitor has asked for reduced motion. Returns false when
 * the API is unavailable, which includes older browsers and the jsdom used by
 * the test runner.
 */
export function prefersReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

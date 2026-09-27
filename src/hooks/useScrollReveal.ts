import { useEffect } from 'react';

/**
 * Global Scroll Reveal & Intersection Observer Hook
 * Automatically observes major container elements, sections, and cards across 
 * mobile, tablet, and desktop views. Triggers the `.animate-content-come-up` class
 * when elements enter the viewport so sections smoothly come up during scroll.
 */
export function useScrollReveal(routeDependency?: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observedElements = new Set<Element>();

    // Ultra-lightweight native IntersectionObserver - 0 layout thrashing, 60fps smooth scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('animate-content-come-up');
            target.classList.remove('reveal-init');
            observer.unobserve(target);
            observedElements.delete(target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '40px 0px 40px 0px',
      }
    );

    const observeNewElements = () => {
      const selectors = [
        'main section',
        'section[data-reveal]',
        '.reveal-on-scroll',
        '.tmd-luxury-card',
        '.tmd-industrial-card',
        '[data-scroll-reveal]'
      ];

      const elements = document.querySelectorAll(selectors.join(', '));
      elements.forEach((el) => {
        if (!observedElements.has(el) && !el.classList.contains('animate-content-come-up')) {
          observer.observe(el);
          observedElements.add(el);
        }
      });
    };

    // Initial passive observation
    observeNewElements();

    // Single delayed pass for dynamically rendered components
    const timer = setTimeout(observeNewElements, 350);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      observedElements.clear();
    };
  }, [routeDependency]);
}

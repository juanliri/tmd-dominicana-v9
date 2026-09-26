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
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const scanAndObserve = () => {
      // Selectors for major layout sections and cards
      const selectors = [
        'main section',
        'section[data-reveal]',
        '.reveal-on-scroll',
        '.tmd-luxury-card',
        '.tmd-industrial-card',
        '.glass-card-dark',
        '[data-scroll-reveal]',
        '.bento-card',
        '.mega-interactive-card'
      ];

      const elements = document.querySelectorAll(selectors.join(', '));
      elements.forEach((el) => {
        if (!observedElements.has(el) && !el.classList.contains('animate-content-come-up')) {
          // Check if already in viewport or scrolled past
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
            // Already visible: animate immediately
            el.classList.add('animate-content-come-up');
          } else {
            // Below fold: observe for scroll trigger
            observer.observe(el);
            observedElements.add(el);
          }
        }
      });
    };

    // Initial scan
    scanAndObserve();

    // Re-scan with small delay for dynamic content and images
    const timer = setTimeout(scanAndObserve, 150);

    // Mutation observer to capture lazy-loaded content or tab switches
    const mutationObserver = new MutationObserver(() => {
      scanAndObserve();
    });

    const mainContainer = document.querySelector('main') || document.body;
    mutationObserver.observe(mainContainer, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
      observedElements.clear();
    };
  }, [routeDependency]);
}

import { useState, useEffect } from 'react';

export function useScrollDirection(threshold: number = 10) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    let idleTimeout: NodeJS.Timeout | null = null;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      setIsAtTop(scrollY < 50);

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      const scrollingDown = scrollY > lastScrollY && scrollY > 80;
      setIsScrollingDown(scrollingDown);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;

      // Re-show floating items after user stops scrolling for 800ms
      if (idleTimeout) clearTimeout(idleTimeout);
      if (scrollingDown) {
        idleTimeout = setTimeout(() => {
          setIsScrollingDown(false);
        }, 1200);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [threshold]);

  return { isScrollingDown, isAtTop };
}

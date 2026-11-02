'use client';

import { useCallback, useRef } from 'react';

export interface UseHorizontalScrollOptions {
  /**
   * Sensitivity multiplier for scroll speed. Default is 1.2
   */
  speed?: number;
  /**
   * If true, allows native vertical page scrolling when horizontal scroll has reached the boundary (left or right end).
   * Default is true.
   */
  allowVerticalAtBoundaries?: boolean;
}

/**
 * Custom hook to translate mouse-wheel vertical scrolling into horizontal sliding
 * when the mouse cursor is inside the table container.
 * When the mouse is outside the container, standard page scrolling operates normally.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseHorizontalScrollOptions = {}
) {
  const { speed = 1.2, allowVerticalAtBoundaries = true } = options;
  const optionsRef = useRef({ speed, allowVerticalAtBoundaries });
  optionsRef.current = { speed, allowVerticalAtBoundaries };

  const elementRef = useRef<T | null>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    const element = elementRef.current;
    if (!element) return;

    // 1. If user is performing a native horizontal trackpad gesture (|deltaX| > |deltaY|), let native scroll handle it
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
      return;
    }

    // 2. If no vertical delta, nothing to convert
    if (!e.deltaY) return;

    // 3. Normalize delta across browsers and OS (e.g. Firefox DOM_DELTA_LINE on Windows)
    let delta = e.deltaY;
    if (e.deltaMode === 1) {
      // Line mode: typically 3 lines (~120px) per wheel click
      delta *= 40;
    } else if (e.deltaMode === 2) {
      // Page mode
      delta *= element.clientWidth;
    }

    delta *= optionsRef.current.speed;

    const currentScroll = element.scrollLeft;
    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    // 4. Check if container has horizontal scroll room
    if (maxScrollLeft <= 1) return;

    const isScrollingLeft = delta < 0;
    const isScrollingRight = delta > 0;

    // 5. Boundary check: if already at the edge and scrolling further, let vertical page scroll proceed
    if (optionsRef.current.allowVerticalAtBoundaries) {
      if (isScrollingLeft && currentScroll <= 0) {
        return;
      }
      if (isScrollingRight && currentScroll >= maxScrollLeft - 2) {
        return;
      }
    }

    // 6. Prevent vertical page jump and slide horizontally
    e.preventDefault();
    element.scrollLeft += delta;
  }, []);

  // Use a callback ref to guarantee listener attaches the exact moment the DOM node is mounted
  const callbackRef = useCallback(
    (node: T | null) => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('wheel', handleWheel);
      }

      elementRef.current = node;

      if (node) {
        node.addEventListener('wheel', handleWheel, { passive: false });
      }
    },
    [handleWheel]
  );

  return callbackRef;
}

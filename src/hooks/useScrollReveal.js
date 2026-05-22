import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll-triggered reveal for all `.gsap-reveal` children.
 * Supports staggered cascading reveals with blur + vertical drift.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const items = el.querySelectorAll('.gsap-reveal');

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 36,
          filter: 'blur(4px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
            ...options,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

export { gsap, ScrollTrigger };

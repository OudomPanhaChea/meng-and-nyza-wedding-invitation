import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Run a GSAP scroll-reveal setup inside a `gsap.context` scoped to the
   given section ref. The setup callback receives shared helpers:

     floatUp(selector, { duration, delay, y, start })
       — fade + drift up from `y` with a blur clear.

     slideIn(selector, fromX, { duration, start })
       — fade + slide in from `fromX` with a blur clear.

   Both helpers register a one-shot ScrollTrigger on the matched
   element(s), so they fire only when each element enters the viewport. */
export function useSectionReveal(ref, setup) {
  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const floatUp = (
        selector,
        { duration = 1.6, delay = 0, y = 28, start = "top 88%" } = {},
      ) => {
        gsap.fromTo(
          selector,
          { opacity: 0, y, filter: "blur(5px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration,
            delay,
            ease: "power2.out",
            scrollTrigger: { trigger: selector, start, once: true },
          },
        );
      };

      const slideIn = (
        selector,
        fromX,
        { duration = 1.6, start = "top 90%" } = {},
      ) => {
        gsap.fromTo(
          selector,
          { opacity: 0, x: fromX, filter: "blur(5px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration,
            ease: "power2.out",
            scrollTrigger: { trigger: selector, start, once: true },
          },
        );
      };

      setup({ floatUp, slideIn });
    }, section);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

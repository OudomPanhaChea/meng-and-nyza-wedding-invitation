import { useEffect, useRef } from "react";
import gsap from "gsap";

/* ─── Cute pastel pink leaves ───────────────────────────────────────────
   A small set of soft, rounded leaf silhouettes in pastel pink shades.
   Kept inline so the layer stays self-contained.                       */
const LEAVES = [
  // chubby teardrop petal — soft pink
  (size) => (
    <svg viewBox="0 0 20 24" width={size} height={size * 1.2}>
      <path
        d="M10 1 Q18 9 16 17 Q13 22 10 22 Q7 22 4 17 Q2 9 10 1 Z"
        fill="#FFC2D4"
        opacity="0.95"
      />
      <path
        d="M10 5 Q10 13 10 20"
        stroke="#F1A4BA"
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  ),
  // rounded oval leaf — blush
  (size) => (
    <svg viewBox="0 0 22 18" width={size * 1.2} height={size}>
      <path
        d="M2 9 Q6 1 11 1 Q16 1 20 9 Q16 17 11 17 Q6 17 2 9 Z"
        fill="#FFB7CC"
        opacity="0.95"
      />
      <path
        d="M3 9 Q11 9 19 9"
        stroke="#E893AE"
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  ),
  // sakura petal — cleft tip, blush pink
  (size) => (
    <svg viewBox="0 0 20 22" width={size} height={size * 1.1}>
      <path
        d="M10 1 Q4 6 4 13 Q4 19 10 21 Q9 19 9 17 Q10 18 11 17 Q11 19 10 21 Q16 19 16 13 Q16 6 10 1 Z"
        fill="#FFD1DC"
        opacity="0.95"
      />
    </svg>
  ),
  // tiny heart-leaf — pastel rose
  (size) => (
    <svg viewBox="0 0 22 22" width={size} height={size}>
      <path
        d="M11 5 Q14 2 17 5 Q20 9 11 19 Q2 9 5 5 Q8 2 11 5 Z"
        fill="#FFC8D7"
        opacity="0.95"
      />
    </svg>
  ),
];

const COUNT = 12; // gentle, not overwhelming

export default function FallingPetals({ zIndex = 25 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const items = Array.from(el.querySelectorAll(".petal"));
      const w = () => el.clientWidth || 480;
      const h = () => el.clientHeight || window.innerHeight;

      items.forEach((p, i) => {
        gsap.fromTo(
          p,
          {
            x: () => Math.random() * w(),
            y: -50,
            rotation: () => Math.random() * 360,
            opacity: 0,
          },
          {
            keyframes: [
              { opacity: 1, duration: 1.2 },
              { opacity: 1, duration: 0.1 },
              { opacity: 0, duration: 1.5 },
            ],
            y: () => h() + 50,
            x: "+=" + (Math.random() * 80 - 40),
            rotation: "+=" + (180 + Math.random() * 540),
            duration: () => 15 + Math.random() * 10,
            delay: () => i * 1.1 + Math.random() * 3,
            repeat: -1,
            repeatRefresh: true,
            ease: "none",
          },
        );

        // gentle side sway layered on top of the fall
        gsap.to(p, {
          x: "+=" + (16 + Math.random() * 20),
          duration: 2.8 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 mx-auto w-full app-col pointer-events-none overflow-hidden"
      style={{ zIndex }}
    >
      {Array.from({ length: COUNT }).map((_, i) => {
        const Leaf = LEAVES[i % LEAVES.length];
        const size = 10 + (i % 4) * 4; // 10 / 14 / 18 / 22 px
        return (
          <div
            key={i}
            className="petal absolute will-change-transform"
            style={{ top: 0, left: 0 }}
          >
            {Leaf(size)}
          </div>
        );
      })}
    </div>
  );
}

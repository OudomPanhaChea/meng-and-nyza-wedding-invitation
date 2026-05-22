import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { weddingConfig } from "../config";
import { GOLD } from "../tokens";
import backgroundImg from "../assets/background.png";
import roofFlowersImg from "../assets/roof-flowers.png";
import bottomFlowersImg from "../assets/bottom-flowers.png";
import coupleNameImg from "../assets/seumeng_and_nisa.png";
import textFrameImg from "../assets/text-frame.png";
import FallingPetals from "./FallingPetals";
import OrnateDivider from "./OrnateDivider";

/* Guest name centered inside text-frame.png — auto-shrinks so it always
   fits inside the white area, never wraps. Max size = 1.5rem (text-2xl). */
function GuestNameInFrame({ name }) {
  const safeRef = useRef(null);
  const textRef = useRef(null);

  // Measure-and-shrink. Runs on mount, on name change, after the image
  // loads (parent size is finalised then), and on window resize.
  const fit = () => {
    const safe = safeRef.current;
    const txt = textRef.current;
    if (!safe || !txt) return;
    const MAX_PX = 24; // 1.5rem (text-2xl)
    const MIN_PX = 9;
    let size = MAX_PX;
    txt.style.fontSize = size + "px";
    while (
      size > MIN_PX &&
      (txt.scrollWidth > safe.clientWidth ||
        txt.scrollHeight > safe.clientHeight)
    ) {
      size -= 1;
      txt.style.fontSize = size + "px";
    }
  };

  useLayoutEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [name]);

  return (
    <div
      className="open-date relative mx-auto"
      style={{
        width: "340px",
        aspectRatio: "1400 / 360", // lock height even before image loads
      }}
    >
      <img
        src={textFrameImg}
        alt=""
        draggable={false}
        onLoad={fit}
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
      />
      {/* Safe area = white panel of text-frame.png (1400×360).
          Panel rectangle spans roughly x: 19–81%, y: 9–73%.
          Center of the safe-area box must match the panel center (~41%),
          NOT the image bounding-box center (50%). The bottom of the image
          carries decorative flourishes — that's why bottom inset is so
          large. Bumping bottom from 33% → 25% drops the centerline from
          37% down to 42% which lands on the actual panel midpoint.   */}
      <div
        ref={safeRef}
        className="absolute flex items-center justify-center overflow-hidden text-center"
        style={{
          left: "20%",
          right: "20%",
          top: "24%",
          bottom: "20%",
        }}
      >
        <span
          ref={textRef}
          className="font-moul whitespace-nowrap leading-none"
          style={{ color: GOLD }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

/* ─── Invitation Card ────────────────────────── */
function HeroCover({ onOpen, cardRef, guestName }) {
  return (
    <div
      ref={cardRef}
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div className="relative pointer-events-auto text-center">
        <div className="px-5 py-7">
          {/* ── Khmer title ── */}
          <h1
            className="open-title font-moul text-2xl text-nowrap"
            style={{ color: GOLD }}
          >
            សិរីមង្គលអាពាហ៍ពិពាហ៍
          </h1>

          {/* ── English subtitle ── */}
          <p
            className="open-label text-xl font-display italic mb-5"
            style={{
              color: GOLD,
              letterSpacing: "0.3em",
            }}
          >
            Wedding Ceremony
          </p>

          {/* ── Divider ── */}
          <OrnateDivider className="mb-5" />

          {/* Groom and Bride names */}
          <div className="open-names w-full flex justify-center">
            <img
              src={coupleNameImg}
              alt={`${weddingConfig.groomLatin} & ${weddingConfig.brideLatin}`}
              draggable={false}
              className="block w-full max-w-40 h-auto select-none"
            />
          </div>

          {/* ── Divider ── */}
          <OrnateDivider className="mb-5" />
          
          {/* Guest's name — from ?guest= query param.
              Sits inside text-frame.png; auto-shrinks so it never overflows
              the white area, never wraps. Max size = text-2xl (1.5rem).   */}
          {guestName && (
            <div className="flex flex-col items-center justify-center gap-2 open-date-container">
              <h2 className="open-date text-lg font-moul">
                {`សូមគោរពអញ្ជើញ`}
              </h2>
              <GuestNameInFrame name={guestName} />
            </div>
          )}
          
        </div>

        {/* ── CTA button ── */}
        <div className="flex justify-center">
          <button
            onClick={onOpen}
            className="open-btn btn-open"
          >
            បើកធៀប
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Opening Screen ─────────────────────────── */
export default function OpeningScreen({ onOpen, guestName }) {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const cardRef = useRef(null);
  const roofRef = useRef(null);
  const bottomRef = useRef(null);
  const flashRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Initial states ────────────────────────────────────────────────
      // Card starts slightly larger — zooms DOWN to settle, matching the
      // "lens pulling back" feel of the background.
      gsap.set(cardRef.current, { opacity: 0, scale: 1.08, y: 0 });
      // Roof flowers start slightly larger and pushed up — settle into
      // place from the top as the scene resolves.
      gsap.set(roofRef.current, {
        opacity: 0,
        y: -14,
        scale: 1.12,
        transformOrigin: "50% 0%",
      });
      gsap.set(bottomRef.current, {
        opacity: 0,
        y: 14,
        scale: 1.12,
        transformOrigin: "50% 100%",
      });

      const tl = gsap.timeline();

      // ① Flash + BG cinematic zoom-out reveal (run in parallel from t = 0)
      //    BG starts heavily zoomed-in and pulls back to final frame —
      //    like a camera lens finding its position through bright light.
      tl.fromTo(
        flashRef.current,
        { opacity: 1 },
        { opacity: 0, duration: 1.4, ease: "power2.out" },
      )
        .fromTo(
          bgRef.current,
          { filter: "blur(18px) brightness(2.6)", scale: 1.28, y: 12 },
          {
            filter: "blur(0px) brightness(1)",
            scale: 1.04,
            y: 0,
            duration: 2.6,
            ease: "power3.out",
          },
          "<",
        )

        // ② Roof + bottom flowers settle in — shrink from slightly larger
        //    and drop in from the top/bottom edges, adding depth to the
        //    camera pullback.
        .to(
          roofRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 2.0,
            ease: "power3.out",
          },
          "<+0.10",
        )
        .to(
          bottomRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 2.0,
            ease: "power3.out",
          },
          "<",
        )

        // ③ Card eases down to final size as the scene fully settles
        .to(
          cardRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.4,
            ease: "power3.out",
          },
          "-=1.6",
        )

        // ④ Text floats up — blurry-bright start (light coalescing) with
        //    a subtle zoom-out so each line "settles" into place.
        .fromTo(
          ".open-ornament, .open-title, .open-label, .open-divline, .open-names, .open-date, .open-btn",
          {
            opacity: 0,
            y: 24,
            scale: 1.06,
            filter: "blur(10px) brightness(2.6)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px) brightness(1)",
            duration: 0.95,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=1.1",
        );

      // ── Ambient loops (delayed so they don't fight the entrance) ──────
      gsap.to(roofRef.current, {
        y: 4,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 0%",
        delay: 1.6,
      });
      gsap.to(bottomRef.current, {
        y: -4,
        duration: 5.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 100%",
        delay: 1.6,
      });
      // Slow breathing zoom resumes after the entrance zoom finishes
      gsap.to(bgRef.current, {
        scale: 1.08,
        duration: 24,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleFinalOpen = () => {
    // Exit: white flash dominates first (fast power2.out so it covers the
    // scene within ~250ms), then card / bg / decorations fade and zoom
    // behind it. Avoids the "black flash" caused by brightness/blur
    // filters being mid-interpolation while the screen was still visible.
    const tl = gsap.timeline({ onComplete: onOpen });
    tl.to(flashRef.current, {
      opacity: 1,
      duration: 0.55,
      ease: "power2.out", // fast start — overlay is dominant within ~200ms
    })
      .to(
        cardRef.current,
        {
          scale: 1.1,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        "<",
      )
      .to(
        bgRef.current,
        {
          scale: 1.12,
          duration: 0.8,
          ease: "power2.in",
        },
        "<",
      )
      .to(
        roofRef.current,
        { opacity: 0, y: -12, duration: 0.5, ease: "power2.in" },
        "<",
      )
      .to(
        bottomRef.current,
        { opacity: 0, y: 12, duration: 0.5, ease: "power2.in" },
        "<",
      );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 mx-auto w-full app-col z-50 flex items-center justify-center overflow-hidden"
    >
      {/* ── Background ─────────────────────────── */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      >
      </div>

      {/* ── Card — z-20, sits BEHIND the roof flowers ── */}
      <HeroCover
        onOpen={handleFinalOpen}
        cardRef={cardRef}
        guestName={guestName}
      />

      {/* ── Roof flowers — z-30, centered along the top edge ── */}
      <div
        ref={roofRef}
        className="absolute z-30 pointer-events-none select-none left-1/2 -translate-x-1/2"
        style={{ top: "-70px", width: "110%" }}
      >
        <img
          src={roofFlowersImg}
          alt=""
          draggable={false}
          className="w-full block"
        />
      </div>

      {/* ── Soft pink fog overlay — subtle haze around the roof flowers ── */}
      <div
        className="absolute top-0 left-0 w-full z-30 pointer-events-none"
        style={{
          height: "180px",
          background:
            "linear-gradient(to bottom, rgba(255,200,215,0.55) 0%, rgba(255,210,222,0.20) 25%, rgba(255,220,230,0) 50%)",
        }}
      />

      {/* ── Bottom flowers — z-30, centered along the bottom edge ── */}
      <div
        ref={bottomRef}
        className="absolute bottom-flowers-anchor z-30 pointer-events-none select-none left-1/2 -translate-x-1/2 blur-[0.5px]"
        style={{ width: "100%" }}
      >
        <img
          src={bottomFlowersImg}
          alt=""
          draggable={false}
          className="w-full block"
        />
      </div>

      {/* ── Falling petals — above the bg/card, below the flash ── */}
      <FallingPetals zIndex={51} />

      {/* ── White flash — starts fully opaque, fades to reveal the scene ── */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "white", zIndex: 55 }}
      />
    </div>
  );
}

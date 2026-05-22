import { useState, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { weddingConfig } from "../config";
import OrnateDivider from "./OrnateDivider";
import coupleNameImg from "../assets/seumeng_and_nisa.png";

const GOLD = "#b59410";

function pad(n) {
  return String(n).padStart(2, "0");
}
function getTimeLeft(target) {
  const diff = new Date(target) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function HeroSection() {
  const [time, setTime] = useState(getTimeLeft(weddingConfig.weddingDate));
  const heroRef = useRef(null);

  useEffect(() => {
    const id = setInterval(
      () => setTime(getTimeLeft(weddingConfig.weddingDate)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  // Hide animated elements before first paint — useLayoutEffect runs
  // synchronously after DOM mutation but before the browser paints, so
  // there's no flash of fully-visible text before the entrance plays.
  const HIDDEN_SELECTOR =
    ".hero-name, .hero-divline, .hero-title, .hero-parents h2, .hero-greeting, .hero-pair, .hero-label, .hero-date p, .hero-count";

  useLayoutEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll(HIDDEN_SELECTOR);
    els.forEach((el) => {
      el.style.opacity = "0";
    });
  }, []);

  useEffect(() => {
    // Safety net: if anything goes wrong with GSAP, force-reveal text
    // after 8s so the page never gets stuck with invisible content.
    const fallbackTimer = setTimeout(() => {
      if (!heroRef.current) return;
      heroRef.current.querySelectorAll(HIDDEN_SELECTOR).forEach((el) => {
        el.style.opacity = "1";
        el.style.filter = "";
      });
    }, 8000);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          // Guarantee final visible state even if a tween was interrupted.
          gsap.set(HIDDEN_SELECTOR, {
            opacity: 1,
            clearProps: "filter",
          });
        },
      });

      tl.fromTo(
        ".hero-name",
        { opacity: 0, y: 18, scale: 1.06, filter: "blur(6px) brightness(1.6)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: 1.1,
        },
      )
        .fromTo(
          ".hero-divline",
          { opacity: 0, scaleX: 0.3 },
          { opacity: 1, scaleX: 1, duration: 0.7, ease: "power2.out" },
          "-=0.55",
        )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 22, scale: 1.04, filter: "blur(6px) brightness(1.8)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px) brightness(1)",
            duration: 0.9,
          },
          "-=0.45",
        )
        .fromTo(
          ".hero-parents h2",
          { opacity: 0, y: 14, filter: "blur(3px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.07,
          },
          "-=0.55",
        )
        .fromTo(
          ".hero-greeting",
          { opacity: 0, y: 14, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85 },
          "-=0.4",
        )
        .fromTo(
          ".hero-pair",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.5",
        )
        .fromTo(
          ".hero-label",
          { opacity: 0, y: 16, scale: 1.04, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.12,
          },
          "-=0.5",
        )
        .fromTo(
          ".hero-date p",
          { opacity: 0, y: 12, filter: "blur(3px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.09,
            onStart: () => gsap.set(".hero-date", { opacity: 1 }),
          },
          "-=0.4",
        )
        .fromTo(
          ".hero-count",
          { opacity: 0, y: 22, scale: 1.06, filter: "blur(3px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.09,
          },
          "-=0.3",
        );

      // ── Continuous ambient motion after the entrance settles ──
      // Soft float on the couple-name image.
      gsap.to(".hero-name", {
        y: -3,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.2,
      });

      // Gold title gets a subtle breathing glow — alive but not distracting.
      gsap.to(".hero-title", {
        textShadow: "0 0 14px rgba(240,208,112,0.55)",
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.4,
      });

      // Divider gently expands/contracts to feel hand-drawn.
      gsap.to(".hero-divline", {
        scaleX: 1.04,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.8,
      });
    }, heroRef.current);
    return () => {
      clearTimeout(fallbackTimer);
      ctx.revert();
    };
  }, []);

  const units = [
    { label: "ថ្ងៃ", sub: "Days", v: time.days },
    { label: "ម៉ោង", sub: "Hours", v: time.hours },
    { label: "នាទី", sub: "Min", v: time.minutes },
    { label: "វិនាទី", sub: "Sec", v: time.seconds },
  ];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="min-h-screen w-full flex flex-col items-center pt-8 pointer-events-none"
    >
      {/* Invitation card — same width + layout as the intro HeroCover */}
      <div className="relative text-center w-full">
        <div className="px-5 py-7 space-y-6">
          {/* ── Couple-name image ── */}
          <div className="hero-name w-full flex justify-center">
            <img
              src={coupleNameImg}
              alt={`${weddingConfig.groomLatin} & ${weddingConfig.brideLatin}`}
              draggable={false}
              className="block w-full max-w-34 h-auto select-none"
            />
          </div>

          {/* ── Divider (matches OpeningScreen) ── */}
          <OrnateDivider className="hero-divline -mt-2" />

          {/* ── Khmer title ── */}
          <h1
            className="hero-title font-moul text-xl text-nowrap"
            style={{ color: GOLD }}
          >
            {weddingConfig.ceremony.titleKhmer}
          </h1>

          {/* ── Parent's name ── */}
          <div className="hero-parents flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <h2 className="font-moul text-base">
                {weddingConfig.groomParents.fatherKhmer}
              </h2>
              <h2 className="font-moul text-base">
                {weddingConfig.groomParents.motherKhmer}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-moul text-base">
                {weddingConfig.brideParents.fatherKhmer}
              </h2>
              <h2 className="font-moul text-base">
                {weddingConfig.brideParents.motherKhmer}
              </h2>
            </div>
          </div>

          {/* Greeting letters */}
          <div className="hero-greeting text-center px-3 space-y-4">
            <h1 className="font-moul text-base">សូមគោរពអញ្ជើញ</h1>
            <p
              className="font-hanuman font-semibold text-sm leading-6.5 tracking-wide"
              style={{ color: GOLD }}
            >
              {weddingConfig.greeting}
            </p>
          </div>

          {/* Groom and Bride names */}
          <div className="grid grid-cols-5 items-center">
            <div className="flex flex-col col-span-2 items-center justify-center gap-8 hero-label font-moul">
              <h2 className="font-hanuman font-semibold">កូនប្រុស</h2>
              <h2 className="text-2xl text-nowrap">
                {weddingConfig.groomKhmer}
              </h2>
            </div>
            <div className="hero-pair col-span-1 font-moul -mt-4">ជាគូនឹង</div>
            <div className="flex flex-col col-span-2 items-center justify-center gap-8 hero-label font-moul">
              <h2 className="font-hanuman font-semibold">កូនស្រី</h2>
              <h2 className="text-2xl text-nowrap">
                {weddingConfig.brideKhmer}
              </h2>
            </div>
          </div>

          {/* Date */}
          <div className="hero-date font-moul space-y-2 mt-8">
            <p>ដែលប្រព្រឹត្តិទៅនៅ</p>
            <p>{weddingConfig.ceremony.date}</p>
            <p>ស្ថិតនៅ {weddingConfig.ceremony.venue}</p>
          </div>
        </div>
      </div>

      {/* Countdown — sits below the invitation card */}
      <div className="flex gap-2.5 mt-6 mb-10">
        {units.map(({ label, v }) => (
          <div
            key={label}
            className="hero-count flex flex-col items-center space"
            style={{
              padding: "0.7rem 0.6rem",
              background: "rgba(0,0,0,0.05)",
              borderRadius: "6px",
              minWidth: "62px",
              backdropFilter: "blur(4px)",
            }}
          >
            <span
              className="font-display text-4xl leading-none font-bold tabular-nums"
            >
              {pad(v)}
            </span>
            <span
              className="font-hanuman mt-3 font-semibold"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
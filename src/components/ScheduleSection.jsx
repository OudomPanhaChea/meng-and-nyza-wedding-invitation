import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as Lucide from "lucide-react";
import { weddingConfig } from "../config";
import { GOLD } from "../tokens";
import SectionTitle from "./SectionTitle";

gsap.registerPlugin(ScrollTrigger);

function EventIcon({ name, size = 16, strokeWidth = 2, className = "" }) {
  const Icon = Lucide[name] || Lucide.Sparkles;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

export default function ScheduleSection() {
  const ref = useRef(null);
  const railFillRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rail = railFillRef.current;

    // Capture the rail's natural geometry BEFORE any transforms are
    // applied. Once `scaleY: 0` lands on the rail, its bounding rect
    // collapses to zero height — measuring afterwards would push every
    // milestone to the end of the rope's run.
    const railRect0 = rail.getBoundingClientRect();
    const RAIL_TOP = railRect0.top;
    const RAIL_HEIGHT = railRect0.height || 1;

    // Vertical center of a node, expressed as a fraction (0..1) of the
    // rail's natural height. Used to time each milestone's reveal so
    // it lands exactly when the rope reaches it.
    const progressOf = (node) => {
      if (!node) return 0;
      const r = node.getBoundingClientRect();
      const center = r.top + r.height / 2;
      return Math.max(0, Math.min(1, (center - RAIL_TOP) / RAIL_HEIGHT));
    };

    // Pre-compute every reveal time while the layout is still natural.
    const days = gsap.utils.toArray(".sched-day").map((day) => ({
      el: day,
      diamond: day.querySelector(".sched-day-diamond"),
      dayText: day.querySelector(".sched-day-text"),
      diamondP: progressOf(day.querySelector(".sched-day-diamond")),
      items: gsap.utils
        .toArray(day.querySelectorAll(".sched-item"))
        .map((item) => ({
          dot: item.querySelector(".sched-dot"),
          halo: item.querySelector(".sched-dot-halo"),
          tick: item.querySelector(".sched-tick"),
          card: item.querySelector(".sched-card"),
          dotP: progressOf(item.querySelector(".sched-dot")),
        })),
    }));

    const ctx = gsap.context(() => {
      // Pre-hide everything. The rope draws as a continuous line from
      // top to bottom; every other element shares the hero's reveal
      // language — opacity + y + filter blur clearing together.
      gsap.set(rail, { scaleY: 0, transformOrigin: "top center", opacity: 1 });
      gsap.set(
        ".sched-day-diamond, .sched-day-text, .sched-dot, .sched-tick, .sched-card, .sched-endcap",
        { opacity: 0, y: 16, filter: "blur(5px)" },
      );
      gsap.set(".sched-dot-halo", { opacity: 0, scale: 0.6 });

      // ── Section header ──
      gsap.fromTo(
        ".sched-title",
        { opacity: 0, y: 22, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );

      // ── Master timeline — rope flows top → bottom, milestones rise
      //    into focus as the rope reaches them. ──
      const ROPE_DUR = 5.5; // total rope-draw time, in seconds

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 100%", once: true },
        defaults: { duration: 0.9, ease: "power3.out" },
      });

      // ① Rope flows continuously top → bottom across the whole schedule.
      tl.to(
        rail,
        {
          scaleY: 1,
          duration: ROPE_DUR,
          ease: "power1.inOut",
        },
        0,
      );

      // ② Milestones rise into focus at the moment the rope crosses them.
      days.forEach(({ diamond, dayText, diamondP, items }) => {
        const diamondT = diamondP * ROPE_DUR;
        // Day diamond pops on the rope, then label drifts up beside it.
        tl.to(
          diamond,
          {
            opacity: 1,
            y: 0,
            rotation: 45,
            filter: "blur(0px)",
            duration: 0.9,
          },
          diamondT - 0.05,
        );
        tl.to(
          dayText,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.0 },
          diamondT + 0.08,
        );

        items.forEach(({ dot, halo, tick, card, dotP }) => {
          const dotT = dotP * ROPE_DUR;

          // Icon medallion lifts into focus as the rope reaches it.
          tl.to(
            dot,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.85,
            },
            dotT - 0.05,
          );
          // Halo softly blooms outward — gold breath as the dot lands.
          tl.set(halo, { opacity: 0.5, scale: 0.6 }, dotT);
          tl.to(
            halo,
            {
              opacity: 0,
              scale: 2.0,
              duration: 1.1,
              ease: "sine.out",
            },
            dotT,
          );
          // Tick + card follow on the same float-up + blur clear.
          tl.to(
            tick,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power2.out",
            },
            dotT + 0.18,
          );
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.0,
            },
            dotT + 0.22,
          );
        });
      });

      // ③ Endcap seats once the rope finishes its run.
      tl.to(
        ".sched-endcap",
        {
          opacity: 1,
          y: 0,
          rotation: 45,
          filter: "blur(0px)",
          duration: 0.85,
        },
        ROPE_DUR - 0.05,
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="schedule" ref={ref} className="px-5 py-7">
      <div className="max-w-xl mx-auto space-y-5">
        <SectionTitle className="sched">កាលវិភាគកម្មវិធី</SectionTitle>

        {/* Roadmap */}
        <div className="relative pl-24">
          <div
            ref={railFillRef}
            className="absolute left-[58px] top-2 -bottom-[11px] w-[2px]"
            style={{
              background: GOLD,
            }}
          />

          {weddingConfig.schedule.map((day, di) => (
            <div key={di} className="sched-day mb-14 last:mb-2">
              {/* ── Day header ── */}
              <div className="relative mb-8 flex items-center">
                <span
                  className="sched-day-diamond border-4 border-white outline-2 outline-gold-400 absolute -left-[48px] top-[8px] w-5.5 h-5.5 block"
                  style={{
                    background: GOLD,
                  }}
                />
                <div className="sched-day-text">
                  <p className="font-hanuman font-black text-xl mt-2 text-gold-400">
                    {day.date}
                  </p>
                </div>
              </div>

              {/* ── Milestones ── */}
              <ol className="space-y-5">
                {day.events.map((item, i) => (
                  <li key={i} className="sched-item relative">
                    {/* Soft halo that pulses out as the dot lands */}
                    <span
                      className="sched-dot-halo absolute -left-[48px] top-[10px] w-9 h-9 rounded-full pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(181,148,16,0.55) 0%, rgba(255,180,200,0.18) 45%, rgba(181,148,16,0) 75%)",
                      }}
                    />

                    {/* Rail node — icon medallion */}
                    <span
                      className="sched-dot absolute z-1 -left-[58px] top-[14px] p-2 rounded-full flex items-center justify-center"
                      style={{
                        background: "#FFFFFF",
                        border: `2px solid ${GOLD}`,
                      }}
                    >
                      <EventIcon
                        name={item.icon}
                        size={20}
                        strokeWidth={2.75}
                        className="font-semibold"
                      />
                    </span>

                    {/* Connector tick — short stroke from rail to card */}
                    <span
                      className="sched-tick absolute z-0 -left-[17px] top-[32px] h-[2px] w-[17px] block rounded-full"
                      style={{
                        background: GOLD,
                      }}
                    />

                    {/* Card */}
                    <div
                      className="sched-card relative rounded-xl pl-6 pr-4 py-4 overflow-hidden"
                    >
                      {/* Left accent stripe — center-peaked gradient */}
                      <span
                        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(181,148,16,0) 0%, #b59410 35%, #b59410 65%, rgba(181,148,16,0) 100%)",
                          boxShadow: "0 0 6px rgba(181,148,16,0.45)",
                        }}
                      />

                      <div className="pr-12 space-y-1">
                        {/* Time with leading bullet */}
                        <p className="font-hanuman font-semibold">
                          ម៉ោង {item.time}
                        </p>
                        <p className="font-hanuman font-semibold">
                          {item.titleKhmer}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          {/* End cap — sits at the rail's terminus.
              Same X as the rail (rail center 59px = endcap center 48+11). */}
          <span
            className="sched-endcap border-4 border-white outline-2 outline-gold-400 absolute left-12 -bottom-10 w-5.5 h-5.5 block"
            style={{
              background: GOLD,
            }}
          />
        </div>
      </div>
    </section>
  );
}

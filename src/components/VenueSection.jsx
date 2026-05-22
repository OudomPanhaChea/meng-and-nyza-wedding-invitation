import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import OrnateDivider from "./OrnateDivider";
import { weddingConfig } from "../config";

gsap.registerPlugin(ScrollTrigger);

export default function VenueSection() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const floatUp = (selector, { duration = 1.6, delay = 0, y = 28, start = "top 88%" } = {}) => {
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

      const slideIn = (selector, fromX) => {
        gsap.fromTo(
          selector,
          { opacity: 0, x: fromX, filter: "blur(5px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: selector, start: "top 90%", once: true },
          },
        );
      };

      floatUp(".venue-title", { duration: 1.8, start: "top 85%" });
      floatUp(".venue-divider", { delay: 0.25 });
      floatUp(".venue-venue", { delay: 0.1 });
      slideIn(".venue-date", -80);
      slideIn(".venue-time", 80);
      floatUp(".venue-qr", { y: 36 });
      floatUp(".venue-button", { y: 24 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="venue" ref={ref} className="px-5 py-7">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Section heading — same pattern as ScheduleSection */}
        <div className="venue-title text-center">
          <h2 className="font-moul text-2xl">ទីតាំងកម្មវិធី</h2>
        </div>

        <OrnateDivider className="venue-divider" />

        {/* Venue body */}
        <div className="text-center space-y-6">
          <div className="venue-venue space-y-2">
            <p className="font-hanuman font-semibold text-xl leading-snug">
              {weddingConfig.ceremony.venue}
            </p>
            <p className="font-hanuman font-semibold">
              {weddingConfig.ceremony.address}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="venue-date space-y-1">
              <p className="font-hanuman font-semibold text-xl">កាលបរិច្ឆេទ</p>
              <p className="font-hanuman font-semibold">
                {weddingConfig.ceremony.partyDate}
              </p>
            </div>
            <div className="venue-time space-y-1">
              <p className="font-hanuman font-semibold text-xl">ម៉ោង</p>
              <p className="font-hanuman font-semibold">
                {weddingConfig.ceremony.partyTime}
              </p>
            </div>
          </div>

          <div className="venue-qr">
            <img
              src={weddingConfig.ceremony.mapQRCode}
              alt={weddingConfig.ceremony.venue}
              className="-mt-4"
            />
            <p className="font-hanuman -mt-8">ស្កេនដើម្បីមើលទីតាំង</p>
          </div>

          <a
            href={weddingConfig.ceremony.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="venue-button btn-open"
          >
            មើលផែនទី
          </a>
        </div>
      </div>
    </section>
  );
}

import { useRef } from "react";
import { weddingConfig } from "../config";
import { useSectionReveal } from "../hooks/useSectionReveal";
import SectionTitle from "./SectionTitle";

export default function VenueSection() {
  const ref = useRef(null);

  useSectionReveal(ref, ({ floatUp, slideIn }) => {
    floatUp(".venue-title", { duration: 1.8, start: "top 85%" });
    floatUp(".venue-divider", { delay: 0.25 });
    floatUp(".venue-venue", { delay: 0.1 });
    slideIn(".venue-date", -80);
    slideIn(".venue-time", 80);
    floatUp(".venue-qr", { y: 36 });
    floatUp(".venue-button", { y: 24 });
  });

  return (
    <section id="venue" ref={ref} className="px-5 py-7">
      <div className="max-w-xl mx-auto space-y-5">
        <SectionTitle className="venue">ទីតាំងកម្មវិធី</SectionTitle>

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

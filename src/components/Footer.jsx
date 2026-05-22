import { useEffect, useRef } from "react";
import gsap from "gsap";
import OrnateDivider from "./OrnateDivider";
import DeveloperCredit from "./DeveloperCredit";
import { weddingConfig } from "../config";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { GOLD } from "../tokens";
import bottomFlowersImg from "../assets/bottom-flowers.png";

export default function Footer() {
  const ref = useRef(null);

  useSectionReveal(ref, ({ floatUp }) => {
    floatUp(".footer-title", { duration: 1.6 });
    floatUp(".footer-top-divider", { delay: 0.15 });
    floatUp(".footer-apology", { delay: 0.25, y: 32, duration: 1.6 });
    floatUp(".footer-names", { delay: 0.1, y: 28 });
    floatUp(".footer-divider", { delay: 0.25 });
    floatUp(".footer-meta", { delay: 0.35 });
    floatUp(".footer-thanks", { delay: 0.5 });
    floatUp(".footer-credit", { delay: 0.6, y: 16, duration: 1.2 });
    floatUp(".footer-flowers", { delay: 0.15, y: 40, duration: 1.8 });
  });

  // Ambient sway on the bottom flowers — sits outside useSectionReveal
  // because it's an infinite loop, not a one-shot scroll reveal.
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.to(".footer-flowers", {
        y: "+=6",
        duration: 5.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.0,
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={ref}
      className="relative pt-14 pb-32 px-5 text-center overflow-hidden"
    >
      <div className="relative max-w-sm mx-auto">
        <div className="footer-title text-center">
          <h2 className="font-moul gold-text text-xl space-y-1.5">
            <p>សេចក្ដីថ្លែងអំណរគុណ</p>
            <p>និងសូមអភ័យទោស</p>
          </h2>
        </div>

        <OrnateDivider className="footer-top-divider my-5" />

        <div className="footer-apology mt-6 mb-10 text-center">
          <p className="font-hanuman text-sm leading-loose">
            យើងខ្ញុំជាមាតាបិតា កូនទាំងពីរ
            សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តមរបស់ ឯកឧត្តម
            អ្នកឧកញ៉ា លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី​ អ្នកនាងកញ្ញា
            ដែលបានអញ្ជើញចូលរួមជាកិត្តិយស ក្នុងកម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍
            កូនប្រុស​ កូនស្រី របស់យើងខ្ញុំនាពេលខាងមុខនេះ។
          </p>
          <p className="font-hanuman text-sm leading-loose mt-4">
            យើងខ្ញុំក៏សូមខន្តីអភ័យទោស ដែលពុំបានជូនលិខិតអញ្ជើញនេះដោយផ្ទាល់។
            ដោយគាវកិច្ចដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ៕
          </p>
        </div>

        <OrnateDivider className="footer-divider mb-5" width={150} />

        <div className="footer-meta mb-8">
          <p
            className="font-hanuman font-semibold text-sm mb-1 tracking-wide"
            style={{ color: GOLD }}
          >
            {weddingConfig.ceremony.date}
          </p>
          <p
            className="font-hanuman text-xs leading-relaxed"
            style={{ color: "rgba(181,148,16,0.72)" }}
          >
            {weddingConfig.ceremony.venue}
          </p>
        </div>

        <div className="footer-thanks">
          <p className="font-moul">&nbsp;សូមអរគុណ&nbsp;</p>
          <p className="font-display italic mt-2 tracking-[0.2em]">
            With Love &amp; Gratitude
          </p>
        </div>
      </div>

      <OrnateDivider className="footer-divider mt-12 mb-10" width={120} />

      <DeveloperCredit className="footer-credit mt-24" />

      <img
        src={bottomFlowersImg}
        alt=""
        draggable={false}
        className="footer-flowers absolute -bottom-22 left-1/2 -translate-x-1/2 w-full pointer-events-none select-none scale-110 block"
      />
    </footer>
  );
}

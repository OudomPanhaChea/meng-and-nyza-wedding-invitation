import wisestepLogo from "../assets/wisestep-logo.png";

/* Small developer credit — logo + name + slogan, links to the studio
   Facebook page. Used at the bottom of both HomePage and Footer. */
export default function DeveloperCredit({ className = "" }) {
  return (
    <a
      href="https://www.facebook.com/WiseStepSolution"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WiseTheab - Innovating Modern Solutions"
      className={`relative z-10 flex flex-col items-center gap-1 select-none no-underline ${className}`}
    >
      <img
        src={wisestepLogo}
        alt="WiseTheab"
        draggable={false}
        className="h-12 w-auto"
      />
      <p className="font-display tracking-[0.2em] text-sm font-semibold">
        WiseTheab
      </p>
      <p className="font-display text-sm tracking-[0.15em]">
        Innovating Modern Solutions
      </p>
    </a>
  );
}

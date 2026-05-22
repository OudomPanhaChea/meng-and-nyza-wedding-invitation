/* Centered lotus divider with optional label.
   Used between section headings and their body content. */

import Lotus from "./Lotus";

export default function Divider({ label }) {
  return (
    <div className="ornament-divider my-6 mx-auto max-w-xs">
      <Lotus size={18} />
      {label && (
        <span className="text-gold-400 text-xs font-hanuman tracking-widest whitespace-nowrap px-1">
          {label}
        </span>
      )}
    </div>
  );
}

/* Ornate gold divider — line · dot · diamond · dot · line.
   Reusable across the invitation; keeps the `open-divline` class so the
   OpeningScreen's GSAP timeline can still target it by selector. */

const GOLD = "#b59410";
const GOLD_A = "rgba(181,148,16,0.75)";

const LINE_STYLE = {
  flex: 1,
  height: 1,
  background: `linear-gradient(to right, transparent, ${GOLD_A} 50%, transparent)`,
};

const DOT_STYLE = {
  width: 3,
  height: 3,
  borderRadius: "9999px",
  background: GOLD,
  opacity: 0.85,
};

const DIAMOND_STYLE = {
  width: 7,
  height: 7,
  transform: "rotate(45deg)",
  border: `1px solid ${GOLD}`,
  background: "rgba(255,255,255,0.35)",
};

export default function OrnateDivider({ className = "", width = 170 }) {
  return (
    <div
      className={`open-divline flex items-center justify-center mx-auto ${className}`}
      style={{ width, gap: 6 }}
    >
      <span style={LINE_STYLE} />
      <span style={DOT_STYLE} />
      <span style={DIAMOND_STYLE} />
      <span style={DOT_STYLE} />
      <span style={LINE_STYLE} />
    </div>
  );
}

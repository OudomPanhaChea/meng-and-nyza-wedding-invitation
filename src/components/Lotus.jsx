/* Stylized lotus — four cardinal petals overlaid with four diagonal
   petals, centered with a small white-cored bud. Used as the recurring
   floral motif throughout the invitation. */

const PINK = "#FFD1DC";
const PINK_DEEP = "#FFB0C4";

const OUTER_PETALS = [
  "M30 10 Q34 22 30 30 Q26 22 30 10Z",
  "M10 30 Q22 34 30 30 Q22 26 10 30Z",
  "M30 50 Q34 38 30 30 Q26 38 30 50Z",
  "M50 30 Q38 34 30 30 Q38 26 50 30Z",
];

const DIAGONAL_PETALS = [
  "M16 16 Q26 28 30 30 Q20 22 16 16Z",
  "M44 16 Q34 28 30 30 Q40 22 44 16Z",
  "M16 44 Q26 32 30 30 Q20 38 16 44Z",
  "M44 44 Q34 32 30 30 Q40 38 44 44Z",
];

export default function Lotus({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
    >
      {OUTER_PETALS.map((d, i) => (
        <path key={`o${i}`} d={d} fill={PINK} opacity="0.9" />
      ))}
      {DIAGONAL_PETALS.map((d, i) => (
        <path key={`d${i}`} d={d} fill={PINK_DEEP} opacity="0.6" />
      ))}
      <circle cx="30" cy="30" r="4.5" fill={PINK} />
      <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

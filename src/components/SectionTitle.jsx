import OrnateDivider from "./OrnateDivider";

/* Section heading used at the top of Schedule / Venue / Gallery /
   Blessing. Provides a stable selector pair (`<className>-title` and
   `<className>-divider`) so each section's GSAP reveal can target them.
   Pass `className` like "venue" to get `.venue-title` + `.venue-divider`. */
export default function SectionTitle({ children, className, size = "2xl", subtitle }) {
  const titleSize = `text-${size.toLowerCase()}`
  return (
    <>
      <div className={`${className}-title text-center`}>
        <h2 className={`font-moul ${titleSize}`}>{children}</h2>
      </div>
      {subtitle && (
        <p className="text-center font-display italic -mt-6">{subtitle}</p>
      )}
      <OrnateDivider className={`${className}-divider`} />
    </>
  );
}

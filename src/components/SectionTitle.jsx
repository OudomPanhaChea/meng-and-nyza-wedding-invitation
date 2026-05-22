import OrnateDivider from "./OrnateDivider";

/* Section heading used at the top of Schedule / Venue / Gallery /
   Blessing. Provides a stable selector pair (`<className>-title` and
   `<className>-divider`) so each section's GSAP reveal can target them.
   Pass `className` like "venue" to get `.venue-title` + `.venue-divider`. */
export default function SectionTitle({ children, className }) {
  return (
    <>
      <div className={`${className}-title text-center`}>
        <h2 className="font-moul text-2xl">{children}</h2>
      </div>
      <OrnateDivider className={`${className}-divider`} />
    </>
  );
}

import React from "react";

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, eyebrow, title, children }) => {
  return (
    // The gap between two sheets is this padding TWICE — one section's bottom
    // meets the next one's top — so `py-20` read as a 160px void at desktop
    // width, wider than some of the cards are tall. Halved to py-10.
    //
    // `scroll-mt-20` offsets the anchor landing by the sticky header's height,
    // so a nav click leaves the heading below the header rather than tucked
    // underneath it. That used to be covered by the section padding alone;
    // now that the padding is smaller, the margin is doing the work.
    <section id={id} className="py-8 md:py-10 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-brand-surface border border-[rgba(239,118,3,0.25)] rounded-3xl shadow-brand-soft p-6 md:p-10">
          <header className="mb-6 md:mb-8">
            {eyebrow && (
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-orange mb-2">
                {eyebrow}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {title}
            </h2>
          </header>
          <div className="space-y-4 text-sm md:text-base text-slate-700">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section;

import React from "react";
import Section from "./Section";

/**
 * Product-company framing, not agency framing.
 *
 * This section used to open with "a boutique engineering shop" and lead on
 * having worked across startups and established businesses — true, but it
 * describes work done FOR other people, which is not what Byte Craft is. The
 * experience is still here; it moved from being the pitch to being the
 * evidence behind it.
 *
 * The closing paragraph is deliberate too: outside work is welcome but is not
 * the business, and it is what gives the contact form a reason to exist for a
 * visitor who is not already a customer.
 */
const About: React.FC = () => {
  return (
    <Section id="about" eyebrow="Who we are" title="We build our own software.">
      <p>
        Byte Craft Software designs, builds and runs its own{" "}
        <strong>web applications</strong>. Every product here is ours end to
        end — which means we live with the shortcuts we take and fix them,
        instead of handing them to someone else.
      </p>
      <p>
        That comes out of years across startups and established businesses,
        wearing hats from senior developer to technical lead. We&apos;re
        obsessed with clear architecture, clean code, and software that&apos;s
        still maintainable six months from now — and we like messy, real-world
        problems: the availability spreadsheet nobody can read on a phone, the
        timecards still kept on paper.
      </p>
      <p>
        Products are the focus, but not the whole story. If you&apos;ve got
        something that needs building,{" "}
        <a
          href="#contact"
          className="text-brand-orange font-medium hover:underline"
        >
          get in touch
        </a>{" "}
        — we take on outside work when it&apos;s the right fit.
      </p>
    </Section>
  );
};

export default About;

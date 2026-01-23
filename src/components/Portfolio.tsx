import React from "react";
import Section from "./Section";

const projects = [
  {
    name: "Dojo Companion",
    role: "Architecture, full-stack development",
    summary:
      "A web app that manages dojo curriculum, requirements, flashcards, and member data.",
    status: "In active development",
    url: "https://www.dojocompanion.com",
  },
  // {
  //   name: "Study Companion",
  //   role: "Product design, frontend development",
  //   summary:
  //     "Family-focused study app built on the same architecture as Dojo Companion. Flashcards, progression, and unlock paths tuned for real-world homework battles.",
  //   status: "In active development",
  // },
  // {
  //   name: "Time Tracker Pro",
  //   role: "Product vision, system design",
  //   summary:
  //     "A modern time tracking and reporting platform, built to be the tool we actually wish existed. Strong focus on reporting, ergonomics, and—shockingly—telling the truth.",
  //   status: "Planned / early-stage",
  // },
  {
    name: "Smart Litter Box",
    role: "Hardware + software prototyping",
    summary:
      "IoT pet care system with sensors, data tracking, and a cloud dashboard. Because if you can measure it… you can over-engineer it.",
    status: "R&D / prototyping",
    url: "",
  },
];

const Portfolio: React.FC = () => {
  return (
    <Section
      id="work"
      eyebrow="Recent & ongoing"
      title="Things we’ve been building."
    >
      <div className="space-y-4 md:space-y-5">
        {projects.map((proj) => (
          <article
            key={proj.name}
            className="bg-white/80 rounded-2xl border border-slate-200/70 p-4 md:p-5 shadow-sm flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm md:text-base text-slate-900">
                {proj.url ? (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer">
                    {proj.name}
                  </a>
                ) : (
                  proj.name
                )}
              </h3>
              <span className="text-[11px] px-2 py-1 rounded-full bg-slate-900 text-slate-50">
                {proj.status}
              </span>
            </div>
            <p className="text-[11px] md:text-xs font-medium text-slate-600">
              {proj.role}
            </p>
            <p className="text-xs md:text-sm text-slate-700">{proj.summary}</p>
          </article>
        ))}
      </div>
    </Section>
  );
};

export default Portfolio;

import React from "react";
import Section from "./Section";

type Project = {
  name: string;
  role: string;
  summary: string;
  /**
   * The breadth the summary cannot carry. These are what the app actually
   * does, not a technology list — a visitor deciding whether we can build
   * their thing cares that we shipped billing and scheduling, not that we
   * used Postgres.
   */
  highlights?: string[];
  status: string;
  url: string;
};

/**
 * Status pills, tinted by what the status means rather than all sharing one
 * near-black. Keyed by the status text itself: a new status that is not listed
 * here falls back to neutral slate, which is plain rather than wrong.
 */
const statusStyles: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In active development": "bg-sky-50 text-sky-700 border-sky-200",
  "R&D / prototyping": "bg-amber-50 text-amber-700 border-amber-200",
};

const NEUTRAL_STATUS = "bg-slate-100 text-slate-600 border-slate-200";

const projects: Project[] = [
  {
    name: "Dojo Companion",
    role: "Architecture, full-stack development",
    summary:
      "Multi-tenant SaaS that runs a martial-arts school end to end: students, parents and prospects, classes and events with attendance, belt progression built on the paper stripe cards instructors already used, a store with per-dojo Stripe payouts, and messaging that reaches families by email, SMS or push. One deployment serves many dojos, each with its own data, branding and billing.",
    highlights: [
      "Students, families & leads",
      "Classes, events & attendance",
      "Belt progression & curriculum",
      "Flashcards",
      "Store & Stripe Connect billing",
      "Email / SMS / push messaging",
      "Custom reports & CSV export",
      "Installable PWA",
    ],
    status: "Live",
    url: "https://www.dojocompanion.com",
  },
  {
    name: "Punchd",
    role: "Architecture, full-stack development",
    summary:
      "Time tracking and payroll prep for small businesses. Employees punch in from their phone; owners and managers get timecards with configurable rounding, recurring and one-off shift scheduling, open shifts staff claim themselves, time-off requests with approval rules, and overtime estimates for the state the work actually happens in. Deliberately payroll prep rather than a payroll system — it tells you the hours, it doesn't pretend to be your compliance department.",
    highlights: [
      "Mobile punch clock",
      "Timecards & punch rounding",
      "Shift scheduling",
      "Self-serve open shifts",
      "Time off & approvals",
      "Overtime estimates",
      "Shift & punch-out reminders",
      "Stripe subscriptions",
      "Installable PWA",
    ],
    status: "Live",
    url: "https://punchd.co",
  },
  {
    name: "Long Rest",
    role: "Architecture, full-stack development",
    summary:
      "Scheduling and chat for tabletop campaigns, built to replace a nine-player availability spreadsheet. Availability is a time window rather than a flat yes or no, quorum knows the night needs whoever is running the game and not just a headcount, and conflicts are detected across every campaign a person plays in. Session proposals, a campaign chat, and recaps the AI drafts from the notes the table already wrote.",
    highlights: [
      "Time-window availability",
      "Cross-campaign conflict detection",
      "Quorum & session proposals",
      "Campaign chat with mentions",
      "Session notes & AI recaps",
      "D&D Beyond character sync",
      "Push notifications",
      "Installable PWA",
    ],
    status: "Live",
    url: "https://longrest.co",
  },
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
            className="bg-white rounded-2xl border border-slate-200/70 p-4 md:p-5 shadow-sm flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm md:text-base text-slate-900">
                {proj.name}
              </h3>
              <span
                className={`text-[11px] font-medium px-2 py-1 rounded-full border ${
                  statusStyles[proj.status] ?? NEUTRAL_STATUS
                }`}
              >
                {proj.status}
              </span>
            </div>
            <p className="text-[11px] md:text-xs font-medium text-slate-600">
              {proj.role}
            </p>
            <p className="text-xs md:text-sm text-slate-700">{proj.summary}</p>

            {proj.highlights && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {proj.highlights.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-[11px] text-slate-600"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {proj.url && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] md:text-xs font-semibold rounded-full bg-brand-orange text-white shadow-brand-soft hover:translate-y-[1px] transition-transform"
                >
                  Visit {proj.name} <span aria-hidden="true">→</span>
                </a>
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-500 hover:text-slate-700 hover:underline"
                >
                  {proj.url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
};

export default Portfolio;

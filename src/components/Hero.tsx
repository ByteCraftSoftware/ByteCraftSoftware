import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="pt-10 pb-12 md:pt-14 md:pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-[1.4fr,1fr] gap-8 items-center">
          {/* Main hero card */}
          <div className="bg-brand-surface border border-[rgba(239,118,3,0.25)] rounded-3xl shadow-brand-soft p-6 md:p-9">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-orange mb-3">
              Byte Craft Software
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              Sharp, reliable software
              <span className="text-brand-orange">.</span>
            </h1>
            <h2 className="text-base md:text-lg text-slate-700 mb-6">
              We design and build web apps, APIs that actually ship. No buzzword
              salad, just solid engineering—and a bit of mischief.
            </h2>

            <div className="flex flex-wrap gap-3 mb-5">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-full bg-brand-orange text-white shadow-brand-soft hover:translate-y-[1px] transition-transform"
              >
                Start a project
              </a>
              <a
                href="#work"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-full border border-[rgba(239,118,3,0.4)] text-brand-orange bg-white/60 hover:bg-white transition-colors"
              >
                See what we&apos;ve built
              </a>
            </div>

            <ul className="flex flex-wrap gap-3 text-[11px] text-slate-600">
              <li className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
                React + TypeScript
              </li>
              <li className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
                .NET & Cloud APIs
              </li>
              <li className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
                AI / LLM agents
              </li>
              <li className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
                Architecture & rescue missions
              </li>
            </ul>
          </div>

          {/* Side mini-card */}
          <div className="space-y-4 md:space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-md p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900 mb-1">
                Need something specific?
              </p>
              <p>
                Whether it&apos;s a greenfield MVP, a refactor, or “our old dev
                vanished and production is on fire,” we design a sane path
                forward and then walk it with you.
              </p>
            </div>
            <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-xl p-4 text-xs">
              <p className="mb-1 opacity-70">House rule</p>
              <p className="font-semibold text-sm">
                If we don&apos;t think it&apos;s a good idea, we&apos;ll say so.
                You still get final call. (Byte Craft&apos;s Law, right?)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

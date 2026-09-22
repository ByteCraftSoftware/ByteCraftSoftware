import React, { useEffect, useRef } from "react";

const Footer: React.FC = () => {
  // Publish the footer's rendered height as a CSS variable so the layout can
  // reserve matching space at the bottom of its content — the footer is fixed,
  // so without this it would overlap the last bit of the page.
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const apply = () => {
      const h = node.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--footer-h", `${Math.ceil(h)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(node);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--footer-h");
    };
  }, []);

  return (
    <footer
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-brand-ink/85 backdrop-blur"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-center gap-x-3 gap-y-2 text-center">
        <p>
          © {new Date().getFullYear()} Byte Craft Software. All rights reserved.
        </p>
        <span aria-hidden="true" className="hidden md:inline text-slate-600">·</span>
        <nav className="flex items-center gap-x-3">
          <a href="#about" className="hover:text-brand-orange transition-colors">
            About
          </a>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <a href="#contact" className="hover:text-brand-orange transition-colors">
            Contact Us
          </a>
          <span aria-hidden="true" className="text-slate-600">·</span>
          {/* A full page load, not a hash link: the privacy page is a static file
              in public/, not a route this SPA knows about. Extensionless because
              Cloudflare Pages 308s /privacy.html to /privacy. */}
          <a href="/privacy" className="hover:text-brand-orange transition-colors">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./logo"

const links = [
  { label: "About", href: "#about" },
  { label: "Plans", href: "#plans" },
  { label: "Reviews", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-apex-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" aria-label="Trust Signal Trade home">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted transition-colors hover:text-apex-700">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/auth/login" className="px-3 py-2 text-sm font-semibold text-apex-900 hover:text-apex-700">
            Sign in
          </Link>
          <Link
            to="/auth/register"
            className="rounded-lg bg-apex-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-apex-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apex-600"
          >
            Open account
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-apex-900 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-apex-100 bg-paper px-5 pb-5 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-apex-100 py-3 text-base font-medium text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <Link to="/auth/login" className="flex-1 rounded-lg border border-apex-200 py-2.5 text-center text-sm font-semibold text-apex-900">
              Sign in
            </Link>
            <Link to="/auth/register" className="flex-1 rounded-lg bg-apex-600 py-2.5 text-center text-sm font-semibold text-white">
              Open account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
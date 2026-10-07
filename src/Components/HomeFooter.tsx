import { Link } from "react-router-dom";
import Logo from "./logo";

const cols = [
  { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }, { label: "FAQ", href: "#faq" }] },
  { title: "Trading", links: [{ label: "Plans", href: "#plans" }, { label: "Reviews", href: "#testimonials" }] },
];

export default function Footer() {
  return (
    <footer className="bg-apex-950 text-apex-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm">Markets, signals and support in one account.</p>
        </div>

        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="font-sans text-sm font-semibold text-white">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}><a href={l.href} className="hover:text-white">{l.label}</a></li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label="Account">
          <h3 className="font-sans text-sm font-semibold text-white">Account</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-white">Open account</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl space-y-3 px-5 py-6 text-xs leading-relaxed text-apex-200/80">
        
          <p>© {new Date().getFullYear()} Apex Signal Trade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
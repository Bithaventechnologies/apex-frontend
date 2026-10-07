import { useState } from "react";

// Edit answers so they match your real policies.
const faqs = [
  { q: "How do I open an account?", a: "Create a profile, verify your identity with a government ID, and make your first deposit. Most accounts are approved as soon as possible." },
  { q: "What is the minimum deposit?", a: "$250 for Starter, $5,000 for Pro and $25,000 for Elite. You can upgrade later by adding funds." },
 
  { q: "How long do withdrawals take?", a: "Starter withdrawals take 1–2 business days, Pro is prioritised, and Elite is processed the same day. Bank or network delays can add time." },
  { q: "Can I lose money?", a: "Yes. All trading carries risk, and you can lose some or all of what you deposit. Only trade with money you can afford to put at risk." },
  { q: "How is my money protected?", a: "Client funds are held in accounts separate from company funds, and your login is protected with two-factor authentication." },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-apex-950 sm:text-4xl">Questions people ask before they start</h2>
        <p className="mt-3 text-muted">
          Can't find yours? <a href="#contact" className="font-semibold text-apex-700 underline underline-offset-4">Message our team</a>.
        </p>
      </div>

      <div className="divide-y divide-apex-100 border-y border-apex-100">
        {faqs.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-apex-950"
                >
                  {item.q}
                  <svg width="20" height="20" viewBox="0 0 20 20" className={`shrink-0 text-gold-600 transition-transform ${open ? "rotate-45" : ""}`} aria-hidden="true">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </h3>
              <div id={`faq-${i}`} role="region" hidden={!open} className="pb-5 pr-10 leading-relaxed text-muted">
                {item.a}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
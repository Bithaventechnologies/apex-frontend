import { images } from "../data/images";

// Replace with real client quotes (with permission) before launch.
const featured = {
  quote:
    "I used to follow tips from group chats and never knew why a trade made sense. Here every signal explains itself, so I finally understand what I'm doing.",
  name: "Melissa Adams",
  role: "Pharmacist, Utah",
  photo: images.testimonials.adaeze,
};

const others = [
  {
    quote: "Withdrawal reached my account the next morning. After that I stopped worrying about it.",
    name: "George Wilson",
    role: "Logistics business owner, Arizona",
    photo: images.testimonials.tunde,
  },
  {
    quote: "My account manager flagged that I was risking too much on one trade. That one call saved me.",
    name: "Grace Rice",
    role: "Financial advisor, Texas",
    photo: images.testimonials.grace,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-apex-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-apex-950 sm:text-4xl">What our clients say</h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <figure className="flex flex-col justify-between rounded-2xl border-l-4 border-gold-400 bg-white p-8">
            <blockquote className="text-xl leading-relaxed text-apex-950 sm:text-2xl">“{featured.quote}”</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <img src={featured.photo} alt={featured.name} className="h-14 w-14 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-apex-950">{featured.name}</p>
                <p className="text-sm text-muted">{featured.role}</p>
              </div>
            </figcaption>
          </figure>

          <div className="grid gap-6">
            {others.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-apex-100 bg-white p-6">
                <blockquote className="text-apex-950">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <img src={t.photo} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-apex-950">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
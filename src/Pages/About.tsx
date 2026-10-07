import { images } from "../data/images";

const points = [
  { title: "Every signal shows its stop-loss", body: "You see the entry, the target and the exit if it goes wrong, before you place anything." },
  { title: "Real people on support", body: "Message us and an analyst or account officer replies, not a chatbot." },
  { title: "Your money, your call", body: "Signals are ideas, not instructions. You decide the size of every trade." },
];

export default function About() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <img src={images.about} alt="An Apex Signal Trade account manager smiling at her desk" className="aspect-4/3 w-full rounded-3xl object-cover" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-apex-950 sm:text-4xl">Built by traders who got tired of vague advice</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            We started Apex Signal Trade because most people were told what to buy but never why. Our team writes every
            trade idea in plain language, so you learn the reasoning while your account grows.
          </p>
          <ul className="mt-8 space-y-5">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-apex-950">{p.title}</h3>
                  <p className="text-muted">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
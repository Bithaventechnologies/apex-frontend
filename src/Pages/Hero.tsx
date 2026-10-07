import { Link } from "react-router-dom";
import { images } from "../data/images";

export default function Hero() {
  return (
    <section id="top" className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
      <div>
        <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-apex-950 sm:text-5xl lg:text-6xl">
          Trade with clear signals and a broker that picks up the phone.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
          Apex Signal Trade gives you forex, stock and crypto markets in one account, with plain-English trade ideas
          from our analysts every morning. Start small, learn as you go, and withdraw when you choose.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/register" className="rounded-lg bg-apex-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-apex-700">
            Open an account
          </Link>
          <a href="#plans" className="rounded-lg border border-apex-200 px-6 py-3 font-semibold text-apex-900 transition-colors hover:bg-apex-50">
            Compare plans
          </a>
        </div>
        <p className="mt-6 text-sm text-muted">Accounts start from $250. No platform fee on Starter.</p>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <img
          src={images.heroMain}
          alt="A smiling investor checking her portfolio on her phone"
          className="aspect-4/5 w-4/5 rounded-3xl object-cover"
        />
        <img
          src={images.heroSecondary}
          alt="A man laughing while reviewing charts with a colleague"
          className="absolute right-0 top-10 aspect-square w-[42%] rounded-2xl border-4 border-paper object-cover"
        />

        {/* A sample signal: shows what the product actually delivers */}
        <div className="absolute -bottom-6 right-0 w-64 rounded-xl border border-apex-100 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Sample signal</span>
            <span className="rounded bg-apex-100 px-2 py-0.5 font-semibold text-apex-700">Buy</span>
          </div>
          <p className="mt-2 font-display text-lg font-bold text-apex-950">EUR/USD</p>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div><dt className="text-muted">Entry</dt><dd className="font-semibold">1.0842</dd></div>
            <div><dt className="text-muted">Target</dt><dd className="font-semibold text-apex-600">1.0890</dd></div>
            <div><dt className="text-muted">Stop</dt><dd className="font-semibold">1.0815</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
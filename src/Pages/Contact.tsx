import { useState, type ChangeEvent, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      // TODO: replace with your API route, e.g. POST /api/contact
      await new Promise((r) => setTimeout(r, 700));
      setValues({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "mt-1.5 w-full rounded-lg border border-apex-200 bg-white px-4 py-3 text-ink outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30";

  return (
    <section id="contact" className="bg-apex-900 py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Talk to someone on the team</h2>
          <p className="mt-3 max-w-md text-apex-200">Ask about plans, funding or how signals work. We reply within one business day.</p>
          <dl className="mt-8 space-y-5 text-sm">
            <div><dt className="text-gold-400">Email</dt><dd className="text-base font-semibold">trustsignaltrade@gmail.com</dd></div>
            <div><dt className="text-gold-400">Phone</dt><dd className="text-base font-semibold">+1 (814) 619-1621</dd></div>
            <div><dt className="text-gold-400">Hours</dt><dd className="text-base font-semibold">Mon–Fri, 8am–6pm WAT</dd></div>
          </dl>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-paper p-7 text-ink">
          <label className="block text-sm font-medium">
            Full name
            <input name="name" required value={values.name} onChange={onChange} className={field} autoComplete="name" />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Email
            <input name="email" type="email" required value={values.email} onChange={onChange} className={field} autoComplete="email" />
          </label>
          <label className="mt-4 block text-sm font-medium">
            How can we help?
            <textarea name="message" required rows={5} value={values.message} onChange={onChange} className={field} />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 w-full rounded-lg bg-gold-400 py-3 font-semibold text-apex-950 transition-colors hover:bg-gold-500 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          <p role="status" className="mt-3 min-h-5 text-sm">
            {status === "sent" && <span className="text-apex-700">Message sent. We'll reply within one business day.</span>}
            {status === "error" && <span className="text-red-700">Message not sent. Check your connection and try again.</span>}
          </p>
        </form>
      </div>
    </section>
  );
}
import { Link, Outlet } from "react-router-dom";

import Logo from "../Components/logo";

type Props = {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, footer }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-apex-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" aria-label="Trust Signal Trade home">
          <Logo variant="light" />
        </Link>

        <div>
          <p className="mt-10 max-w-sm font-display text-2xl font-bold leading-snug">
            Every signal shows its entry, target and stop-loss before you place
            a trade.
          </p>
        </div>

        <p className="text-sm text-apex-200">
          Trading carries risk. You can lose some or all of your deposit.
        </p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <Link
          to="/"
          className="lg:hidden"
          aria-label="Trust Signal Trade home"
        >
          <Logo />
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-apex-950">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mt-2 text-muted">
              {subtitle}
            </p>
          )}

          <div className="mt-8">
            <Outlet />
          </div>

          {footer && (
            <div className="mt-8 text-center text-sm text-muted">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
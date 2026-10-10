
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { adminApi, ApiError } from "../config/AdminApi";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Save the admin JWT for subsequent protected API requests.
      localStorage.setItem("AdminToken", response.token);
      localStorage.setItem("AdminProfile", JSON.stringify(response.admin));

      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-apex-700 text-white">
            <LockKeyhole size={26} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your administration dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#25166B] focus:ring-2 focus:ring-[#25166B]/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-[#25166B] focus:ring-2 focus:ring-[#25166B]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-apex-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#34218d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized administrators only.
        </p>
      </section>
    </main>
  );
}

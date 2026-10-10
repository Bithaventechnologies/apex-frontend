import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import TextField from "../Components/Textfield";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";
import { AuthError, loginUser } from "../lib/auth";
import { isEmail } from "../lib/validation";

type Errors = { email?: string; password?: string };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/user/dashboard";

  const [values, setValues] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }


async function onSubmit(e: FormEvent) {
  e.preventDefault();
  setFormError("");

  const found: Errors = {};

  if (!isEmail(values.email)) {
    found.email = "Enter a valid email address.";
  }

  if (!values.password) {
    found.password = "Enter your password.";
  }

  setErrors(found);

  if (Object.keys(found).length > 0) return;

  setLoading(true);

  try {
    await loginUser({
      email: values.email.trim(),
      password: values.password,
      remember: values.remember,
    });

    navigate(from, { replace: true });
  } catch (err) {
    const message =
      err instanceof AuthError
        ? err.message
        : "We couldn't sign you in. Please try again.";

    if (message.toLowerCase().includes("verify your email")) {
      navigate(
        `/auth/verify-email?email=${encodeURIComponent(values.email.trim())}`,
        { replace: true }
      );
      return;
    }

    setFormError(message);
  } finally {
    setLoading(false);
  }
}

  return (
    <>
             <div className="mb-8">
  <h1 className="text-3xl font-bold tracking-tight text-apex-950">
    Sign in to your account
  </h1>

  <p className="mt-2 text-muted">
  Welcome back. Your signals are waiting.
  </p>
</div>
      <FormAlert message={formError} />
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={onChange} error={errors.email} />
        <TextField label="Password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={onChange} error={errors.password} />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink">
            <input type="checkbox" name="remember" checked={values.remember} onChange={onChange} className="h-4 w-4 rounded border-apex-200 accent-apex-600" />
            Keep me signed in
          </label>
          <Link to="/auth/forget-password" className="font-semibold text-apex-700 underline underline-offset-4">Forgot password?</Link>
        </div>

        <SubmitButton loading={loading} loadingText="Signing in…">Sign in</SubmitButton>

         <div className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="font-semibold text-apex-700 underline underline-offset-4 hover:text-apex-600"
        >
          Register
        </Link>
      </div>
      </form>
    </>


  );
}
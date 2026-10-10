import { useState, type FormEvent } from "react";

import { Link } from "react-router-dom";

import TextField from "../Components/Textfield";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";

import { AuthError, requestPasswordReset } from "../lib/auth";
import { isEmail } from "../lib/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setFormError("");

    if (!isEmail(email)) {
      return setError("Enter a valid email address.");
    }

    setError("");
    setLoading(true);

  
try {
  await requestPasswordReset(email.trim());

  // The backend sends a password-reset OTP.
  setSent(true);
} catch (err) {
  setFormError(
    err instanceof AuthError
      ? err.message
      : "We couldn't send the reset code. Please try again."
  );
} finally {
  setLoading(false);
}
  }

  const back = (
    <Link
      to="/auth/login"
      className="font-semibold text-apex-700 underline underline-offset-4"
    >
      Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-apex-950">
            Check your email
          </h1>

          <p className="mt-2 text-muted">
            We've sent instructions to reset your password.
          </p>
        </div>

        <div
          role="status"
          className="rounded-xl bg-apex-50 p-5 text-ink"
        >
      <p className="mt-2 text-muted">
  If an account exists for {email.trim()}, we've sent a password-reset
  code. Enter that code on the next page to choose a new password.
</p>
        </div>
<Link
  to={`/auth/reset-password?email=${encodeURIComponent(email.trim())}`}
  className="mt-6 block rounded-lg bg-apex-600 py-3 text-center font-semibold text-white hover:bg-apex-700"
>
  Enter reset code
</Link>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-sm font-semibold text-apex-700 underline underline-offset-4"
        >
          Use a different email
        </button>

        <div className="mt-8 text-center text-sm text-muted">
          {back}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-apex-950">
          Forgot your password?
        </h1>

        <p className="mt-2 text-muted">
          Enter your email and we'll send you a link to set a new
          one.
        </p>
      </div>

      <FormAlert message={formError} />

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5"
      >
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
        />

        <SubmitButton
          loading={loading}
          loadingText="Sending link…"
        >
          Send reset link
        </SubmitButton>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        {back}
      </div>
    </>
  );
}
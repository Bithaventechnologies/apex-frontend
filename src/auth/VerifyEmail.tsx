
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import TextField from "../Components/Textfield";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";

import { AuthError, verifyOtp, resendOtp } from "../lib/auth";
import { isEmail } from "../lib/validation";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialEmail = params.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFormError("");
    setNotice("");

    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setFormError("Enter the six-digit verification code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(email.trim(), otp.trim());

      setNotice("Your email has been verified. You can now sign in.");

      navigate("/auth/login", {
        replace: true,
        state: { verified: true },
      });
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't verify your email. Check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setFormError("");
    setNotice("");

    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setResending(true);

    try {
      await resendOtp(email.trim());
      setNotice("A new verification code has been sent to your email.");
      setOtp("");
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-apex-950">
          Verify your email
        </h1>
        <p className="mt-2 text-muted">
          Enter the six-digit code we sent to your email address to activate
          your account.
        </p>
      </div>

      <FormAlert message={formError} />

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
        >
          {notice}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          error={error}
        />

        <TextField
          label="Six-digit verification code"
          name="otp"
          type="text"
          autoComplete="one-time-code"
          value={otp}
          onChange={(event) => {
            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
            setFormError("");
          }}
        />

        <SubmitButton loading={loading} loadingText="Verifying email…">
          Verify email
        </SubmitButton>
      </form>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="text-sm font-semibold text-apex-700 underline underline-offset-4 disabled:opacity-50"
        >
          {resending ? "Sending code…" : "Resend verification code"}
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-muted">
        Already verified?{" "}
        <Link
          to="/auth/login"
          className="font-semibold text-apex-700 underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
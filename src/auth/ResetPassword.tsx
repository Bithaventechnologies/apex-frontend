
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import TextField from "../Components/Textfield";
import PasswordRules from "../Components/PasswordRules";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";

import { AuthError, resetPassword } from "../lib/auth";
import { isEmail, isStrongPassword } from "../lib/validation";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
    confirm?: string;
  }>({});

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const found: typeof errors = {};

    if (!isEmail(email)) {
      found.email = "Enter a valid email address.";
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      found.otp = "Enter the six-digit reset code.";
    }

    if (!isStrongPassword(password)) {
      found.password = "Your password doesn't meet all the requirements.";
    }

    if (confirm !== password) {
      found.confirm = "Passwords don't match.";
    }

    setErrors(found);

    if (Object.keys(found).length > 0) return;

    setLoading(true);

    try {
      await resetPassword(email.trim(), otp.trim(), password);
      setDone(true);
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't reset your password. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-ink">
          Password updated
        </h1>

        <p className="mt-2 text-sm text-muted">
          Your password has been reset successfully. You can now sign in.
        </p>

        <button
          type="button"
          onClick={() => navigate("/auth/login", { replace: true })}
          className="mt-6 w-full rounded-lg bg-apex-600 py-3 font-semibold text-white hover:bg-apex-700"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          Reset your password
        </h1>

        <p className="mt-2 text-sm text-muted">
          Enter the email address where you received your reset code, then
          choose a new password.
        </p>
      </div>

      <FormAlert message={formError} />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((previous) => ({ ...previous, email: undefined }));
          }}
          error={errors.email}
        />

        <TextField
          label="Six-digit reset code"
          name="otp"
          type="text"
          autoComplete="one-time-code"
          value={otp}
          onChange={(event) => {
            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
            setErrors((previous) => ({ ...previous, otp: undefined }));
          }}
          error={errors.otp}
        />

        <div>
          <TextField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((previous) => ({
                ...previous,
                password: undefined,
              }));
            }}
            error={errors.password}
          />
          <PasswordRules value={password} />
        </div>

        <TextField
          label="Confirm new password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value);
            setErrors((previous) => ({
              ...previous,
              confirm: undefined,
            }));
          }}
          error={errors.confirm}
        />

        <SubmitButton loading={loading} loadingText="Updating password…">
          Update password
        </SubmitButton>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          to="/auth/forget-password"
          className="font-semibold text-apex-700 underline underline-offset-4"
        >
          Request another reset code
        </Link>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import TextField from "../Components/Textfield";
import PasswordRules from "../Components/PasswordRules";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";

import { AuthError, resetPassword } from "../lib/auth";
import { isStrongPassword } from "../lib/validation";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Invalid or missing token
  if (!token) {
    return (
      <div className="min-h-screen bg-paper px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-ink">
              This link isn't valid
            </h1>

            <p className="mt-2 text-sm text-muted">
              The reset link is missing or incomplete.
            </p>

            <Link
              to="/auth/forget-password"
              className="mt-6 block rounded-lg bg-apex-600 py-3 text-center font-semibold text-white hover:bg-apex-700"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Password successfully updated
  if (done) {
    return (
      <div className="min-h-screen bg-paper px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-ink">
              Password updated
            </h1>

            <p className="mt-2 text-sm text-muted">
              You can now sign in with your new password.
            </p>

            <button
              type="button"
              onClick={() => navigate("/auth/login", { replace: true })}
              className="mt-6 w-full rounded-lg bg-apex-600 py-3 font-semibold text-white hover:bg-apex-700"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setFormError("");

    const found: typeof errors = {};

    if (!isStrongPassword(password)) {
      found.password =
        "Your password doesn't meet all the requirements.";
    }

    if (confirm !== password) {
      found.confirm = "Passwords don't match.";
    }

    setErrors(found);

    if (Object.keys(found).length) return;

    setLoading(true);

    try {
      await resetPassword(token!, password);
      setDone(true);
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink">
              Set a new password
            </h1>

            <p className="mt-2 text-sm text-muted">
              Choose a password you haven't used here before.
            </p>
          </div>

          <FormAlert message={formError} />

          {formError.toLowerCase().includes("expired") && (
            <p className="-mt-2 mb-5 text-sm">
              <Link
                to="/auth/forget-password"
                className="font-semibold text-apex-700 underline underline-offset-4"
              >
                Request a new link
              </Link>
            </p>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <TextField
                label="New password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({
                    ...p,
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
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors((p) => ({
                  ...p,
                  confirm: undefined,
                }));
              }}
              error={errors.confirm}
            />

            <SubmitButton
              loading={loading}
              loadingText="Updating password…"
            >
              Update password
            </SubmitButton>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/auth/login"
              className="font-semibold text-apex-700 underline underline-offset-4 hover:text-apex-600"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




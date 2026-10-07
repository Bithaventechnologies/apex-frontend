import { useState, type ChangeEvent, type FormEvent } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import TextField from "../Components/Textfield";
import PasswordRules from "../Components/PasswordRules";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";
import WelcomeModal from "../Components/WelcomeModal";

import { AuthError, registerUser } from "../lib/auth";
import { isEmail, isStrongPassword } from "../lib/validation";

const PLANS = [
  { id: "starter", label: "Starter (from $250)" },
  { id: "pro", label: "Pro (from $5,000)" },
  { id: "elite", label: "Elite (from $25,000)" },
];

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  plan: string;
  terms: boolean;
};

type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};

  if (v.firstName.trim().length < 2) {
    e.firstName = "Enter your first name.";
  }

  if (v.lastName.trim().length < 2) {
    e.lastName = "Enter your last name.";
  }

  if (!isEmail(v.email)) {
    e.email = "Enter a valid email address.";
  }

  if (!isStrongPassword(v.password)) {
    e.password =
      "Your password doesn't meet all the requirements.";
  }

  if (v.confirm !== v.password) {
    e.confirm = "Passwords don't match.";
  }

  if (!v.terms) {
    e.terms = "Accept the terms to create your account.";
  }

  return e;
}

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requested = params.get("plan");

  const initialPlan = PLANS.some((p) => p.id === requested)
    ? (requested as string)
    : "starter";

  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    plan: initialPlan,
    terms: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  function onChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    const next =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setValues((v) => ({
      ...v,
      [name]: next,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setFormError("");

    const found = validate(values);

    setErrors(found);

    if (Object.keys(found).length) {
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        password: values.password,
        plan: values.plan,
      });

      setWelcomeName(user.fullName);
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

    <div className="mb-8">
  <h1 className="text-3xl font-bold tracking-tight text-apex-950">
    Create your account
  </h1>

  <p className="mt-2 text-muted">
    It takes about two minutes. You choose when to fund it.
  </p>
</div>
      <FormAlert message={formError} />

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5"
      >
     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <TextField
    label="First name"
    name="firstName"
    autoComplete="given-name"
    value={values.firstName}
    onChange={onChange}
    error={errors.firstName}
  />

  <TextField
    label="Last name"
    name="lastName"
    autoComplete="family-name"
    value={values.lastName}
    onChange={onChange}
    error={errors.lastName}
  />
</div>


        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={onChange}
          error={errors.email}
        />

      

        <div>
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={onChange}
            error={errors.password}
          />

          <PasswordRules value={values.password} />
        </div>

        <TextField
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={onChange}
          error={errors.confirm}
        />

        <div>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="terms"
              checked={values.terms}
              onChange={onChange}
              aria-invalid={!!errors.terms}
              className="mt-0.5 h-4 w-4 rounded border-apex-200 accent-apex-600"
            />

            <span>
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-semibold text-apex-700 underline underline-offset-4"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-semibold text-apex-700 underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              , and I understand trading carries risk.
            </span>
          </label>

          {errors.terms && (
            <p
              role="alert"
              className="mt-1.5 text-sm text-red-700"
            >
              {errors.terms}
            </p>
          )}
        </div>

        <SubmitButton
          loading={loading}
          loadingText="Creating account…"
        >
          Create account
        </SubmitButton>
        
      </form>
<div className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-semibold text-apex-700 underline underline-offset-4 hover:text-apex-600"
        >
          Log in
        </Link>
      </div>
      {welcomeName && (
        <WelcomeModal
          fullName={welcomeName}
          plan={values.plan}
          onContinue={() => navigate("/dashboard")}
        />
      )}
    </>
  );
}

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate} from "react-router-dom";

import TextField from "../Components/Textfield";
import PasswordRules from "../Components/PasswordRules";
import SubmitButton from "../Components/SubmitButton";
import FormAlert from "../Components/FormAlert";

import { AuthError, registerUser } from "../lib/auth";
import { isEmail, isStrongPassword } from "../lib/validation";

// const PLANS = [
//   { id: "starter", label: "Starter (from $250)" },
//   { id: "pro", label: "Pro (from $5,000)" },
//   { id: "elite", label: "Elite (from $25,000)" },
// ];

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
};

type Errors = Partial<Record<keyof Values, string>>;

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (values.firstName.trim().length < 2) {
    errors.firstName = "Enter your first name.";
  }

  if (values.lastName.trim().length < 2) {
    errors.lastName = "Enter your last name.";
  }

  if (!isEmail(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!isStrongPassword(values.password)) {
    errors.password = "Your password doesn't meet all the requirements.";
  }

  if (values.confirm !== values.password) {
    errors.confirm = "Passwords don't match.";
  }

  if (!values.terms) {
    errors.terms = "Accept the terms to create your account.";
  }

  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  // const [params] = useSearchParams();

  // const requestedPlan = params.get("plan");
  // const initialPlan = PLANS.some((plan) => plan.id === requestedPlan)
  //   ? requestedPlan!
  //   : "starter";

  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",

    terms: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = event.target;

    const nextValue =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : value;

    setValues((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const foundErrors = validate(values);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    setLoading(true);

    try {
      await registerUser({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        password: values.password,
      });

      // Registration sends the verification OTP to the user's email.
  
navigate(
  `/auth/verify-email?email=${encodeURIComponent(values.email.trim())}`,
  { replace: true }
);
    
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
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

      <form onSubmit={onSubmit} noValidate className="space-y-5">
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

        {/* <div>
          <label
            htmlFor="plan"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Investment plan
          </label>
          <select
            id="plan"
            name="plan"
            value={values.plan}
            onChange={onChange}
            className="w-full rounded-xl border border-apex-200 bg-white px-4 py-3 text-ink outline-none focus:border-apex-600"
          >
            {PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.label}
              </option>
            ))}
          </select>
        </div> */}

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
            <p role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.terms}
            </p>
          )}
        </div>

        <SubmitButton loading={loading} loadingText="Creating account…">
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
    </>
  );
}

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import FormAlert from "../Components/FormAlert";
import PasswordRules from "../Components/PasswordRules";
import SubmitButton from "../Components/SubmitButton";
import TextField from "../Components/Textfield";
import { AuthError, changePassword, getProfile,saveProfile  } from "../lib/auth";
import { initials } from "../lib/format";
import { isStrongPassword } from "../lib/validation";
import { Banner, Card, PageHeader } from "../Components/Ui";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="font-medium text-apex-950">{label}</p>
        <p className="text-sm text-muted">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-apex-600" : "bg-apex-200"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}


function ProfileTab() {
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    country: "",
    email: "",
  });

  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoadingProfile(true);
      setFormError("");

      try {
        const profile = await getProfile();

        if (!active) return;

        setValues({
          fullName: profile.fullName ?? profile.name ?? "",
          phone: profile.phone ?? "",
          country: profile.country ?? "",
          email: profile.email ?? "",
        });
      } catch (err) {
        if (!active) return;

        setFormError(
          err instanceof AuthError
            ? err.message
            : "We couldn't load your profile. Please try again."
        );
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaved(false);
    setFormError("");
    setNameError("");

    if (values.fullName.trim().length < 2) {
      setNameError("Enter your full name.");
      return;
    }

    setLoading(true);

    try {
      await saveProfile({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        country: values.country.trim(),
      });

      setSaved(true);
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't save your changes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      {loadingProfile ? (
        <p className="py-6 text-sm text-muted">
          Loading your profile...
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-apex-600 font-display text-xl font-bold text-white"
              aria-hidden="true"
            >
              {initials(values.fullName || values.email || "User")}
            </span>

            <div>
              <p className="text-lg font-bold text-apex-950">
                {values.fullName || "Your profile"}
              </p>

              <p className="text-sm text-muted">
                {values.email || "Update your profile information"}
              </p>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 max-w-lg space-y-5"
          >
            {saved && (
              <Banner tone="success">
                Your profile has been updated.
              </Banner>
            )}

            <FormAlert message={formError} />

            <TextField
              label="Full name"
              name="fullName"
              autoComplete="name"
              value={values.fullName}
              onChange={(e) => {
                setValues((v) => ({
                  ...v,
                  fullName: e.target.value,
                }));

                setNameError("");
                setSaved(false);
              }}
              error={nameError}
            />

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink"
              >
                Email
              </label>

              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  readOnly
                  className="w-full rounded-lg border border-apex-100 bg-apex-50 px-4 py-3 text-ink outline-none"
                  placeholder="Your email address"
                />

                <span className="shrink-0 rounded-full bg-apex-100 px-2.5 py-1 text-xs font-semibold text-apex-700">
                  Account email
                </span>
              </div>
            </div>

            <TextField
              label="Phone number"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => {
                setValues((v) => ({
                  ...v,
                  phone: e.target.value,
                }));

                setSaved(false);
              }}
            />

            <TextField
              label="Country"
              name="country"
              autoComplete="country-name"
              value={values.country}
              onChange={(e) => {
                setValues((v) => ({
                  ...v,
                  country: e.target.value,
                }));

                setSaved(false);
              }}
            />

            <div className="max-w-xs">
              <SubmitButton
                loading={loading}
                loadingText="Saving..."
              >
                Save changes
              </SubmitButton>
            </div>
          </form>
        </>
      )}
    </Card>
  );
}


function SecurityTab() {
  const [values, setValues] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});

  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({
        ...v,
        [key]: e.target.value,
      }));

      setErrors((p) => ({
        ...p,
        [key]: undefined,
      }));

      setSaved(false);
    };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setFormError("");

    const found: typeof errors = {};

    if (!values.current) {
      found.current = "Enter your current password.";
    }

    if (!isStrongPassword(values.next)) {
      found.next = "Your new password doesn't meet all the requirements.";
    }

    if (values.confirm !== values.next) {
      found.confirm = "Passwords don't match.";
    }

    setErrors(found);

    if (Object.keys(found).length) {
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: values.current,
        newPassword: values.next,
      });

      setValues({
        current: "",
        next: "",
        confirm: "",
      });

      setSaved(true);
    } catch (err) {
      setFormError(
        err instanceof AuthError
          ? err.message
          : "We couldn't change your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-bold text-apex-950">
          Change password
        </h2>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-5 max-w-lg space-y-5"
        >
          {saved && (
            <Banner tone="success">
              Your password has been changed.
            </Banner>
          )}

          <FormAlert message={formError} />

          <TextField
            label="Current password"
            name="current"
            type="password"
            autoComplete="current-password"
            value={values.current}
            onChange={set("current")}
            error={errors.current}
          />

          <div>
            <TextField
              label="New password"
              name="next"
              type="password"
              autoComplete="new-password"
              value={values.next}
              onChange={set("next")}
              error={errors.next}
            />

            <PasswordRules value={values.next} />
          </div>

          <TextField
            label="Confirm new password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
          />

          <div className="max-w-xs">
            <SubmitButton loading={loading} loadingText="Updating…">
              Update password
            </SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-apex-950">
          Two-factor authentication
        </h2>

        <Switch
          checked={false}
          onChange={() => undefined}
          disabled
          label="Authenticator app"
          description="Ask for a code from your phone each time you sign in. Coming soon."
        />
      </Card>
    </div>
  );
}

const NOTIF_KEY = "apex:notifications";

const defaults = {
  signals: true,
  money: true,
  news: false,
};

function NotificationsTab() {
  const [prefs, setPrefs] = useState(() => {
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "{}"),
      };
    } catch {
      return defaults;
    }
  });

  const update =
    (key: keyof typeof defaults) =>
    (value: boolean) => {
      const next = {
        ...prefs,
        [key]: value,
      };

      setPrefs(next);

      try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable
      }
    };

  return (
    <Card>
      <h2 className="text-lg font-bold text-apex-950">
        Email notifications
      </h2>

      <div className="mt-2 divide-y divide-apex-100">
        <Switch
          checked={prefs.signals}
          onChange={update("signals")}
          label="Daily signals"
          description="The morning email with today's trade ideas."
        />

        <Switch
          checked={prefs.money}
          onChange={update("money")}
          label="Deposits and withdrawals"
          description="Updates when a request is approved or needs attention."
        />

        <Switch
          checked={prefs.news}
          onChange={update("news")}
          label="Product news"
          description="Occasional updates about new plans and features."
        />
      </div>
    </Card>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<TabId>("profile");

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((t) => t.id === tab);

    const next =
      e.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : e.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : null;

    if (next === null) return;

    e.preventDefault();

    setTab(tabs[next].id);

    document
      .getElementById(`tab-${tabs[next].id}`)
      ?.focus();
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, password and notifications."
      />

      <div
        role="tablist"
        aria-label="Settings sections"
        onKeyDown={onKeyDown}
        className="mb-6 flex gap-1 overflow-x-auto border-b border-apex-100"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-gold-500 text-apex-950"
                : "border-transparent text-muted hover:text-apex-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "profile" && <ProfileTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </>
  );
}


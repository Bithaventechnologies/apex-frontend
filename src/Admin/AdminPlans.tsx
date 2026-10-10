import { useState, type FormEvent } from "react";
import SubmitButton from "../Components/SubmitButton";
import TextField from "../Components/Textfield";
import { Card, EmptyState, PageHeader, Modal, Banner } from "../Components/Ui";
import { dateOrDash, money } from "../lib/format";
import { adminApi, type AdminPlan } from "../config/AdminApi";
import LoadState from "../Components/loadState";
import { useFetch } from "../Hooks/usefetch";;

type Values = { name: string; returns: string; minAmount: string; maxAmount: string; duration: string };
type Errors = Partial<Record<keyof Values, string>>;
const empty: Values = { name: "", returns: "", minAmount: "", maxAmount: "", duration: "" };

function validate(v: Values): Errors {
  const e: Errors = {};
  const n = (s: string) => Number(s);
  if (!v.name.trim()) e.name = "Give the plan a name.";
  if (!v.returns || !(n(v.returns) > 0)) e.returns = "Enter the return as a number above 0.";
  if (!v.minAmount || !(n(v.minAmount) > 0)) e.minAmount = "Enter a minimum above 0.";
  if (!v.maxAmount || !(n(v.maxAmount) > 0)) e.maxAmount = "Enter a maximum above 0.";
  else if (n(v.maxAmount) < n(v.minAmount)) e.maxAmount = "The maximum can't be below the minimum.";
  if (!v.duration || !Number.isInteger(n(v.duration)) || n(v.duration) < 1) e.duration = "Enter the duration as a whole number.";
  return e;
}

export default function AdminPlans() {
  const { data, error, loading, reload } = useFetch(() => adminApi.plans());
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState<AdminPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
    setNotice("");
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNotice("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await adminApi.createPlan({
        name: values.name.trim(), returns: Number(values.returns), minAmount: Number(values.minAmount),
        maxAmount: Number(values.maxAmount), duration: Number(values.duration),
      });
      setNotice(`Plan "${values.name.trim()}" created.`);
      setValues(empty);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We couldn't create the plan. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deletePlan(toDelete.id);
      setNotice(`Plan "${toDelete.name}" deleted.`);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We couldn't delete the plan. Please try again.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <PageHeader title="Plans" description="Create the plans your users can invest in, and see the ones you've made." />

      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-bold text-apex-950">Create a plan</h2>
          {notice && <div className="mt-4"><Banner tone="success">{notice}</Banner></div>}
          {formError && <div className="mt-4"><Banner tone="error">{formError}</Banner></div>}
          <form onSubmit={onSubmit} noValidate className="mt-5 space-y-5">
            <TextField label="Plan name" name="name" placeholder="e.g. Starter" value={values.name} onChange={set("name")} error={errors.name} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Returns (%)" name="returns" inputMode="decimal" value={values.returns} onChange={set("returns")} error={errors.returns} />
              <TextField label="Duration (days)" name="duration" inputMode="numeric" value={values.duration} onChange={set("duration")} error={errors.duration} />
              <TextField label="Minimum amount (USD)" name="minAmount" inputMode="decimal" value={values.minAmount} onChange={set("minAmount")} error={errors.minAmount} />
              <TextField label="Maximum amount (USD)" name="maxAmount" inputMode="decimal" value={values.maxAmount} onChange={set("maxAmount")} error={errors.maxAmount} />
            </div>
            <SubmitButton loading={saving} loadingText="Creating…">Create plan</SubmitButton>
          </form>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-bold text-apex-950">Your plans</h2>
          <LoadState loading={loading} error={error} hasData={data !== null} onRetry={reload}>
            {(data ?? []).length === 0 ? (
              <EmptyState title="No plans yet" body="Plans you create will be listed here." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(data ?? []).map((p) => (
                  <Card key={p.id}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-apex-950">{p.name}</h3>
                      <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-apex-950">{p.returns}%</span>
                    </div>
                    <dl className="mt-4 space-y-1.5 text-sm">
                      <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd className="font-semibold">{money(p.minAmount)} – {money(p.maxAmount)}</dd></div>
                      <div className="flex justify-between"><dt className="text-muted">Duration</dt><dd className="font-semibold">{p.duration} days</dd></div>
                      <div className="flex justify-between"><dt className="text-muted">Created</dt><dd className="font-semibold">{dateOrDash(p.createdAt)}</dd></div>
                    </dl>
                    <button type="button" onClick={() => setToDelete(p)} className="mt-5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
                  </Card>
                ))}
              </div>
            )}
          </LoadState>
        </div>
      </div>

      {toDelete && (
        <Modal title="Delete plan" onClose={() => setToDelete(null)}>
          <p className="text-sm text-ink">Delete <strong>{toDelete.name}</strong>? Users won't be able to choose it any more. This can't be undone.</p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setToDelete(null)} className="flex-1 rounded-lg border border-apex-200 py-2.5 text-sm font-semibold text-apex-900 hover:bg-apex-50">Cancel</button>
            <button type="button" disabled={deleting} onClick={confirmDelete} className="flex-1 rounded-lg bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{deleting ? "Deleting…" : "Delete plan"}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
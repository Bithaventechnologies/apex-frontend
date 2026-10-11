import { useState, type FormEvent } from "react";
import SubmitButton from "../Components/SubmitButton";
import TextField from "../Components/Textfield";
import { Banner, Card, CopyButton, EmptyState, Modal, PageHeader, StatCard, StatusBadge } from "../Components/Ui";
import { adminApi, type AdminGateway } from "../config/AdminApi";
import LoadState from "../Components/loadState";
import { useFetch } from "../Hooks/usefetch";

const CURRENCIES = ["BTC", "ETH", "SOL", "USDT"];

type Values = { name: string; currency: string; network: string; address: string; qrCode: string; instructions: string; isActive: boolean };
type Errors = Partial<Record<"name" | "network" | "address", string>>;
const empty: Values = { name: "", currency: "BTC", network: "", address: "", qrCode: "", instructions: "", isActive: true };

const fieldClass = "mt-1.5 w-full rounded-lg border border-apex-200 bg-white px-4 py-3 text-ink outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30";

export default function AdminGateways() {
  const { data, error, loading, reload } = useFetch(() => adminApi.gateways());
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [editing, setEditing] = useState<AdminGateway | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState<AdminGateway | null>(null);
  const [deleting, setDeleting] = useState(false);

  const gateways = data ?? [];
  const activeCount = gateways.filter((g) => g.isActive).length;

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
    setNotice("");
  };

  function startEdit(g: AdminGateway) {
    setEditing(g);
    setValues({ name: g.name, currency: g.currency, network: g.network, address: g.address, qrCode: g.qrCode, instructions: g.instructions, isActive: g.isActive });
    setErrors({});
    setFormError("");
    setNotice("");
    document.getElementById("gateway-form")?.scrollIntoView();
  }

  function cancelEdit() {
    setEditing(null);
    setValues(empty);
    setErrors({});
    setFormError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNotice("");
    const found: Errors = {};
    if (!values.name.trim()) found.name = "Give the gateway a name.";
    if (!values.network.trim()) found.network = "Enter the network, e.g. Bitcoin or TRC20.";
    if (!values.address.trim()) found.address = "Enter the wallet address users should pay to.";
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      name: values.name.trim(), currency: values.currency, network: values.network.trim(), address: values.address.trim(),
      qrCode: values.qrCode.trim(), instructions: values.instructions.trim(), isActive: values.isActive,
    };

    setSaving(true);
    try {
      if (editing) await adminApi.updateGateway(editing.id, payload);
      else await adminApi.createGateway(payload);
      setNotice(editing ? `"${payload.name}" updated.` : `"${payload.name}" created.`);
      setEditing(null);
      setValues(empty);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We couldn't save the gateway. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(g: AdminGateway) {
    setBusyId(g.id);
    setFormError("");
    setNotice("");
    try {
      await adminApi.setGatewayStatus(g.id, !g.isActive);
      setNotice(`"${g.name}" ${g.isActive ? "deactivated" : "activated"}.`);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We couldn't change the status. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteGateway(toDelete.id);
      if (editing?.id === toDelete.id) cancelEdit();
      setNotice(`"${toDelete.name}" deleted.`);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We couldn't delete the gateway. Please try again.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <PageHeader title="Deposit gateways" description="The wallets your users pay into. Only active gateways are shown to users." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard accent label="Gateways" value={String(gateways.length)} />
        <StatCard label="Active" value={String(activeCount)} hint="Visible to users" />
        <StatCard label="Inactive" value={String(gateways.length - activeCount)} hint="Hidden from users" />
      </div>

      {notice && <Banner tone="success">{notice}</Banner>}
      {formError && <Banner tone="error">{formError}</Banner>}

      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div id="gateway-form" className="scroll-mt-6">
            <h2 className="text-lg font-bold text-apex-950">{editing ? `Edit ${editing.name}` : "Add a gateway"}</h2>
          </div>
          <form onSubmit={onSubmit} noValidate className="mt-5 space-y-5">
            <TextField label="Gateway name" name="name" placeholder="e.g. Bitcoin wallet" value={values.name} onChange={set("name")} error={errors.name} />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-ink">Currency</label>
                <select id="currency" value={values.currency} onChange={set("currency")} className={fieldClass}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <TextField label="Network" name="network" placeholder="e.g. Bitcoin, TRC20, ERC20" value={values.network} onChange={set("network")} error={errors.network} />
            </div>

            <TextField label="Wallet address" name="address" autoComplete="off" spellCheck={false} value={values.address} onChange={set("address")} error={errors.address} />
            <TextField label="QR code image URL (optional)" name="qrCode" type="url" placeholder="https://…" value={values.qrCode} onChange={set("qrCode")} />

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-ink">Instructions for users (optional)</label>
              <textarea id="instructions" rows={3} value={values.instructions} onChange={set("instructions")} placeholder="e.g. Send only BTC on the Bitcoin network." className={fieldClass} />
            </div>

            <label className="flex items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={values.isActive} onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))} className="h-4 w-4 rounded border-apex-200 accent-[#0c8a50]" />
              Active: show this gateway to users
            </label>

            <div className="flex gap-3">
              <div className="flex-1"><SubmitButton loading={saving} loadingText="Saving…">{editing ? "Save changes" : "Add gateway"}</SubmitButton></div>
              {editing && <button type="button" onClick={cancelEdit} className="rounded-lg border border-apex-200 px-5 py-3 font-semibold text-apex-900 hover:bg-apex-50">Cancel</button>}
            </div>
          </form>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-bold text-apex-950">Your gateways</h2>
          <LoadState loading={loading} error={error} hasData={data !== null} onRetry={reload}>
            {gateways.length === 0 ? (
              <EmptyState title="No gateways yet" body="Add a wallet and it will appear here. Users only see active ones." />
            ) : (
              <div className="space-y-4">
                {gateways.map((g) => (
                  <Card key={g.id} className={g.isActive ? "" : "bg-apex-50/60"}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-gold-100 px-2 py-0.5 text-xs font-bold text-apex-950">{g.currency}</span>
                          <h3 className="text-lg font-bold text-apex-950">{g.name}</h3>
                        </div>
                        <p className="mt-0.5 text-sm text-muted">{g.network}</p>
                      </div>
                      <StatusBadge status={g.isActive ? "active" : "inactive"} />
                    </div>

                    <div className="mt-4 flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-apex-50 px-3 py-2.5">
                          <span className="break-all font-mono text-xs text-apex-950">{g.address}</span>
                          <CopyButton value={g.address} />
                        </div>
                        {g.instructions && <p className="mt-3 text-sm text-muted">{g.instructions}</p>}
                      </div>
                      {g.qrCode && (
                        <img src={g.qrCode} alt={`${g.currency} QR code`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} className="h-20 w-20 shrink-0 rounded-md border border-apex-100 object-cover" />
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(g)} className="rounded-md border border-apex-200 px-3 py-1.5 text-xs font-semibold text-apex-900 hover:bg-apex-50">Edit</button>
                      <button type="button" disabled={busyId === g.id} onClick={() => toggle(g)} className="rounded-md border border-apex-200 px-3 py-1.5 text-xs font-semibold text-apex-900 hover:bg-apex-50 disabled:opacity-50">
                        {busyId === g.id ? "Working…" : g.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" onClick={() => setToDelete(g)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </LoadState>
        </div>
      </div>

      {toDelete && (
        <Modal title="Delete gateway" onClose={() => setToDelete(null)}>
          <p className="text-sm text-ink">Delete <strong>{toDelete.name}</strong>? Users won't see it any more. Past deposits stay in their history. To hide it without deleting, deactivate it instead.</p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setToDelete(null)} className="flex-1 rounded-lg border border-apex-200 py-2.5 text-sm font-semibold text-apex-900 hover:bg-apex-50">Cancel</button>
            <button type="button" disabled={deleting} onClick={confirmDelete} className="flex-1 rounded-lg bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{deleting ? "Deleting…" : "Delete gateway"}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
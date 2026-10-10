const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const money = (n: number) => usd.format(n);
export const shortDate = (iso: string) => dateFmt.format(new Date(iso));
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "A";

// Shows "—" instead of crashing when a date is missing or empty
export const dateOrDash = (iso: string) => (iso ? shortDate(iso) : "—");
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const passwordRules = [
  { id: "len", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "letter", label: "One letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { id: "number", label: "One number", test: (v: string) => /\d/.test(v) },
];

export const isStrongPassword = (v: string) => passwordRules.every((r) => r.test(v));
export function normalizeKenyanPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("7")) {
    return `254${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("07")) {
    return `254${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("254")) {
    return digits;
  }
  return null;
}

export function displayKenyanPhone(value: string): string {
  const normalized = normalizeKenyanPhone(value);
  return normalized ? `0${normalized.slice(3)}` : value;
}

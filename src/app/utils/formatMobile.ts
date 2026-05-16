/** Formats 10-digit mobile for display as +91 XXXXX XXXXX. */
export function formatMobileDisplay(mobileDigits: string): string {
  const digits = mobileDigits.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    return mobileDigits.trim() || '—';
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

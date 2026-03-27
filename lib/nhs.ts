export function validateNHSNumber(n: string): boolean {
  const digits = n.replace(/[\s\-]/g, "");
  if (!/^\d{10}$/.test(digits)) return false;

  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }

  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) return false;

  return checkDigit === parseInt(digits[9]);
}

export function formatNHSNumber(n: string): string {
  const digits = n.replace(/[\s\-]/g, "");
  if (digits.length !== 10) return n;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

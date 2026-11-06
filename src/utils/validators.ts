import { toEnglishDigits } from './jalali';

/** Normalises Persian/Arabic digits and trims. */
export const normalizeDigits = (value: string): string => toEnglishDigits(value ?? '').trim();

/** Official Iranian national-code checksum (10 digits). */
export function isValidNationalCode(input: string): boolean {
  const code = normalizeDigits(input);
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  const sum = code
    .slice(0, 9)
    .split('')
    .reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0);
  const rem = sum % 11;
  return rem < 2 ? check === rem : check === 11 - rem;
}

/** Passwords in this app are exactly 8 digits. */
export const isValidPassword = (input: string): boolean => /^\d{8}$/.test(normalizeDigits(input));

export const isValidPhone = (input: string): boolean => {
  const v = normalizeDigits(input);
  return v === '' || /^0?9\d{9}$/.test(v);
};

export const isValidEmail = (input: string): boolean => {
  const v = input.trim();
  return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

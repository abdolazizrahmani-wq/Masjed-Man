/**
 * Accurate Jalali (Solar Hijri / Shamsi) calendar algorithms and Persian formatting
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const SHAMSI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const SHAMSI_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * Converts Persian/Arabic digits to English digits
 */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

/**
 * Converts Gregorian date to Jalali (Solar Hijri)
 * Accurate standard algorithm
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];

  jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { jy, jm, jd };
}

/**
 * Returns current Jalali date object
 */
export function getCurrentJalali(date: Date = new Date()): JalaliDate {
  return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/**
 * Returns formatted Jalali date string: e.g. "1405/08/15"
 */
export function getShamsiDateString(date: Date = new Date()): string {
  const { jy, jm, jd } = getCurrentJalali(date);
  const mm = String(jm).padStart(2, '0');
  const dd = String(jd).padStart(2, '0');
  return `${jy}/${mm}/${dd}`;
}

/**
 * Returns human-readable Persian date: e.g. "۱۵ آبان ۱۴۰۵"
 */
export function formatShamsiDateHuman(shamsiDateStr: string): string {
  if (!shamsiDateStr) return '';
  const parts = shamsiDateStr.split('/');
  if (parts.length < 3) return toPersianDigits(shamsiDateStr);
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  const monthName = SHAMSI_MONTH_NAMES[m - 1] || '';
  return `${toPersianDigits(d)} ${monthName} ${toPersianDigits(y)}`;
}

/**
 * Returns full Persian date with weekday: e.g. "پنج‌شنبه ۱۵ آبان ۱۴۰۵"
 */
export function getFullShamsiTodayText(date: Date = new Date()): string {
  const weekday = SHAMSI_WEEKDAYS[date.getDay()];
  const { jy, jm, jd } = getCurrentJalali(date);
  const monthName = SHAMSI_MONTH_NAMES[jm - 1] || '';
  return `${weekday} ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

/**
 * Returns relative time in Persian (e.g. "چند لحظه پیش", "۵ دقیقه پیش", "۲ ساعت پیش", "دیروز")
 */
export function formatRelativePersianTime(isoDateStr: string): string {
  try {
    const past = new Date(isoDateStr).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 45) return 'چند لحظه پیش';
    if (diffSec < 3600) {
      const minutes = Math.floor(diffSec / 60);
      return `${toPersianDigits(minutes)} دقیقه پیش`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${toPersianDigits(hours)} ساعت پیش`;
    }
    const days = Math.floor(diffSec / 86400);
    if (days === 1) return 'دیروز';
    if (days < 7) return `${toPersianDigits(days)} روز پیش`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${toPersianDigits(weeks)} هفته پیش`;
    }
    const months = Math.floor(days / 30);
    return `${toPersianDigits(months)} ماه پیش`;
  } catch {
    return 'به‌تازگی';
  }
}

/**
 * Generates an array of dates in the current Shamsi month for attendance calendar
 */
export function getDaysInCurrentShamsiMonth(jy: number, jm: number): { day: number; dateStr: string }[] {
  const maxDays = jm <= 6 ? 31 : jm <= 11 ? 30 : 29; // 29 for Esfand approximation
  const result = [];
  const mm = String(jm).padStart(2, '0');
  for (let d = 1; d <= maxDays; d++) {
    const dd = String(d).padStart(2, '0');
    result.push({
      day: d,
      dateStr: `${jy}/${mm}/${dd}`,
    });
  }
  return result;
}

/**
 * Number of days in a Jalali month (handles leap-year Esfand).
 */
export function getJalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: find Nowruz of next year (around 19-22 March) and look at the day before it.
  const gy = jy + 622;
  for (let d = 19; d <= 23; d++) {
    const j = gregorianToJalali(gy, 3, d);
    if (j.jy === jy + 1 && j.jm === 1 && j.jd === 1) {
      return gregorianToJalali(gy, 3, d - 1).jd;
    }
  }
  return 29;
}

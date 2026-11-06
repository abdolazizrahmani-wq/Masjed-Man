/**
 * Password hashing (PBKDF2-SHA256 via Web Crypto).
 *
 * NOTE: this app has no server, so hashing only prevents passwords from being
 * stored/readable as plain text. Real protection requires server-side auth.
 */

const ITERATIONS = 100_000;

const toHex = (buf: ArrayBuffer | Uint8Array): string =>
  Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const fromHex = (hex: string): Uint8Array => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
};

function getSubtle(): SubtleCrypto {
  const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;
  if (!subtle) {
    throw new Error('برای ورود و ثبت رمز، برنامه باید از طریق HTTPS (یا localhost) باز شود.');
  }
  return subtle;
}

async function derive(password: string, saltHex: string): Promise<string> {
  const subtle = getSubtle();
  const key = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex) as BufferSource, iterations: ITERATIONS },
    key,
    256
  );
  return toHex(bits);
}

export async function hashPassword(password: string): Promise<{ passwordHash: string; passwordSalt: string }> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  return { passwordHash: await derive(password, salt), passwordSalt: salt };
}

export async function verifyPassword(password: string, passwordHash: string, passwordSalt: string): Promise<boolean> {
  const candidate = await derive(password, passwordSalt);
  // constant-time-ish comparison
  if (candidate.length !== passwordHash.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ passwordHash.charCodeAt(i);
  return diff === 0;
}

/** Random 8-digit temporary password using a CSPRNG. */
export function generateTempPassword(): string {
  const buf = crypto.getRandomValues(new Uint32Array(1));
  return String(10_000_000 + (buf[0] % 90_000_000));
}

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 15 * 60;
const TOKEN_SUBJECT = 'birthday-book-unlock';

const base64UrlEncode = (value) =>
  Buffer.from(value).toString('base64url');

const base64UrlDecode = (value) =>
  Buffer.from(value, 'base64url').toString('utf8');

const signPayload = (payload, secret) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

const signaturesMatch = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const createUnlockToken = (secret, now = Math.floor(Date.now() / 1000)) => {
  if (!secret) {
    return null;
  }

  const payload = base64UrlEncode(
    JSON.stringify({
      sub: TOKEN_SUBJECT,
      exp: now + TOKEN_TTL_SECONDS,
      nonce: randomBytes(12).toString('base64url'),
    }),
  );
  const signature = signPayload(payload, secret);

  return {
    token: `${payload}.${signature}`,
    expiresAt: new Date((now + TOKEN_TTL_SECONDS) * 1000).toISOString(),
  };
};

export const verifyUnlockToken = (token, secret, now = Math.floor(Date.now() / 1000)) => {
  if (!secret) {
    return {
      valid: false,
      reason: 'not_configured',
    };
  }

  const [payload, signature] = String(token || '').split('.');

  if (!payload || !signature) {
    return {
      valid: false,
      reason: 'missing',
    };
  }

  const expectedSignature = signPayload(payload, secret);

  if (!signaturesMatch(signature, expectedSignature)) {
    return {
      valid: false,
      reason: 'invalid',
    };
  }

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload));

    if (parsedPayload.sub !== TOKEN_SUBJECT || typeof parsedPayload.exp !== 'number') {
      return {
        valid: false,
        reason: 'invalid',
      };
    }

    if (parsedPayload.exp <= now) {
      return {
        valid: false,
        reason: 'expired',
      };
    }

    return {
      valid: true,
      payload: parsedPayload,
    };
  } catch {
    return {
      valid: false,
      reason: 'invalid',
    };
  }
};

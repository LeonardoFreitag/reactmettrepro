/**
 * Utilitário de Base64 com suporte a UTF-8.
 * Não depende de Buffer nem de btoa/atob (compatível com Hermes/React Native).
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function stringToUtf8Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    } else {
      // surrogate pair
      i++;
      const high = code;
      const low = str.charCodeAt(i);
      const codePoint = 0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00);
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return bytes;
}

function utf8BytesToString(bytes: number[]): string {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b < 0x80) {
      result += String.fromCharCode(b);
    } else if ((b & 0xe0) === 0xc0) {
      result += String.fromCharCode(((b & 0x1f) << 6) | (bytes[++i] & 0x3f));
    } else if ((b & 0xf0) === 0xe0) {
      const b1 = bytes[++i];
      const b2 = bytes[++i];
      result += String.fromCharCode(((b & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f));
    } else if ((b & 0xf8) === 0xf0) {
      const b1 = bytes[++i], b2 = bytes[++i], b3 = bytes[++i];
      const codePoint =
        ((b & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
      const adjusted = codePoint - 0x10000;
      result += String.fromCharCode(0xd800 + (adjusted >> 10), 0xdc00 + (adjusted & 0x3ff));
    }
  }
  return result;
}

export function encodeBase64(str: string): string {
  const bytes = stringToUtf8Bytes(str);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += CHARS[(b0 >> 2) & 0x3f];
    result += CHARS[((b0 << 4) | (b1 >> 4)) & 0x3f];
    result += i + 1 < bytes.length ? CHARS[((b1 << 2) | (b2 >> 6)) & 0x3f] : '=';
    result += i + 2 < bytes.length ? CHARS[b2 & 0x3f] : '=';
  }
  return result;
}

export function decodeBase64(encoded: string): string {
  const clean = encoded.replace(/=/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const b0 = CHARS.indexOf(clean[i]);
    const b1 = CHARS.indexOf(clean[i + 1]);
    const b2 = i + 2 < clean.length ? CHARS.indexOf(clean[i + 2]) : 64;
    const b3 = i + 3 < clean.length ? CHARS.indexOf(clean[i + 3]) : 64;
    bytes.push((b0 << 2) | (b1 >> 4));
    if (b2 !== 64) bytes.push(((b1 & 0xf) << 4) | (b2 >> 2));
    if (b3 !== 64) bytes.push(((b2 & 0x3) << 6) | b3);
  }
  return utf8BytesToString(bytes);
}

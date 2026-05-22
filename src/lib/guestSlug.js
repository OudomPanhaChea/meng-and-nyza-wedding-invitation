/* Compact, URL-safe encoding for guest names.

   Three formats coexist; the decoder auto-detects from the first byte
   of the base64url-decoded payload:

     v1 (mixed Khmer + ASCII, 8 bits/char)
       [0x01][b0][b1]…[bN]
       Each char byte: 0xxxxxxx = ASCII codepoint, 1xxxxxxx = Khmer
       offset from U+1780.

     v2 (Khmer + spaces only, 7 bits/char — TIGHTER)
       Short form (count ≤ 31): [0x80+count][packed 7-bit codes]
       Long  form (count ≤ 255): [0xA0][count][packed 7-bit codes]
       Each 7-bit code: 0x00–0x7E = Khmer offset from U+1780,
                        0x7F      = space (U+0020).

     legacy UTF-8
       base64url-of-UTF-8 bytes (no version prefix). Any first byte
       other than 0x01 / 0x80–0xA0 falls here. Valid UTF-8 first bytes
       are 0x20–0x7E or 0xC2–0xF4, so there's no ambiguity.

   `decodeGuestSlug` additionally falls back to percent-decoding for
   the oldest /i/%E1%9E%A2… link style.

   Sample sizes for "អ្នកស្រី ថុង គីមសួគ៌" (20 codepoints):
     151 chars — percent-encoded
      75 chars — base64url-of-UTF-8
      28 chars — v1
      26 chars — v2 short  ← current encoder output
*/

const COMPACT_V1 = 0x01;
const COMPACT_V2_SHORT_BASE = 0x80; // 0x80..0x9F → count 0..31
const COMPACT_V2_LONG = 0xa0;       // 0xA0 [count] → count 0..255
const KHMER_BLOCK_START = 0x1780;
const KHMER_LAST_PACKABLE = 0x17fe; // 0x7F is reserved as the space marker
const SPACE_MARKER = 0x7f;
const SPACE_CP = 0x20;

function toB64Url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(slug) {
  const b64 = slug.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function v2Codes(name) {
  // Returns an array of 7-bit codes if every char in the name fits the
  // v2 alphabet (Khmer block + space), and at least one is Khmer.
  // Returns null otherwise.
  const codes = [];
  let hasKhmer = false;
  for (const ch of name) {
    const cp = ch.codePointAt(0);
    if (cp === SPACE_CP) {
      codes.push(SPACE_MARKER);
    } else if (cp >= KHMER_BLOCK_START && cp <= KHMER_LAST_PACKABLE) {
      codes.push(cp - KHMER_BLOCK_START);
      hasKhmer = true;
    } else {
      return null;
    }
  }
  return hasKhmer ? codes : null;
}

function packBits7(codes) {
  // Pack 7-bit codes MSB-first into a byte stream.
  const bytes = [];
  let buf = 0;
  let bits = 0;
  for (const c of codes) {
    buf = (buf << 7) | (c & 0x7f);
    bits += 7;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((buf >>> bits) & 0xff);
    }
  }
  if (bits > 0) bytes.push((buf << (8 - bits)) & 0xff);
  return bytes;
}

function unpackBits7(bytes, count) {
  // Read `count` 7-bit codes from a byte stream.
  const codes = [];
  let buf = 0;
  let bits = 0;
  for (let i = 0; i < bytes.length && codes.length < count; i++) {
    buf = (buf << 8) | bytes[i];
    bits += 8;
    while (bits >= 7 && codes.length < count) {
      bits -= 7;
      codes.push((buf >>> bits) & 0x7f);
    }
  }
  return codes;
}

function isCompactV1(name) {
  // Compatible with v1: every char is ASCII or in the Khmer block,
  // and at least one char is Khmer (pure ASCII falls through to the
  // legacy UTF-8 path, which is already shorter for ASCII).
  let hasKhmer = false;
  for (const ch of name) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80) continue;
    if (cp >= KHMER_BLOCK_START && cp <= 0x17ff) {
      hasKhmer = true;
      continue;
    }
    return false;
  }
  return hasKhmer;
}

export function encodeGuestSlug(name) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "";

  // Try v2 (tightest) — Khmer + spaces only.
  const v2 = v2Codes(trimmed);
  if (v2) {
    const packed = packBits7(v2);
    const header =
      v2.length <= 31
        ? [COMPACT_V2_SHORT_BASE + v2.length]
        : [COMPACT_V2_LONG, v2.length & 0xff];
    return toB64Url(new Uint8Array([...header, ...packed]));
  }

  // Fall back to v1 (handles Khmer + arbitrary ASCII letters).
  if (isCompactV1(trimmed)) {
    const bytes = [COMPACT_V1];
    for (const ch of trimmed) {
      const cp = ch.codePointAt(0);
      bytes.push(cp < 0x80 ? cp : 0x80 | (cp - KHMER_BLOCK_START));
    }
    return toB64Url(new Uint8Array(bytes));
  }

  // Generic UTF-8 fallback (accented Latin, CJK, emoji, etc.).
  return toB64Url(new TextEncoder().encode(trimmed));
}

export function decodeGuestSlug(slug) {
  if (!slug) return "";

  try {
    const bytes = fromB64Url(slug);
    if (bytes.length === 0) return "";

    const v = bytes[0];

    // v2 short
    if (v >= COMPACT_V2_SHORT_BASE && v < COMPACT_V2_LONG) {
      const count = v - COMPACT_V2_SHORT_BASE;
      const codes = unpackBits7(bytes.subarray(1), count);
      return codes
        .map((c) =>
          String.fromCodePoint(
            c === SPACE_MARKER ? SPACE_CP : KHMER_BLOCK_START + c,
          ),
        )
        .join("");
    }

    // v2 long
    if (v === COMPACT_V2_LONG && bytes.length >= 2) {
      const count = bytes[1];
      const codes = unpackBits7(bytes.subarray(2), count);
      return codes
        .map((c) =>
          String.fromCodePoint(
            c === SPACE_MARKER ? SPACE_CP : KHMER_BLOCK_START + c,
          ),
        )
        .join("");
    }

    // v1
    if (v === COMPACT_V1) {
      let out = "";
      for (let i = 1; i < bytes.length; i++) {
        const b = bytes[i];
        const cp = b & 0x80 ? KHMER_BLOCK_START + (b & 0x7f) : b;
        out += String.fromCodePoint(cp);
      }
      return out;
    }

    // Legacy: base64url-of-UTF-8.
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // Oldest format: /i/%E1%9E%A2… or /i/Mr.+Panha.
    try {
      return decodeURIComponent(slug.replace(/\+/g, " "));
    } catch {
      return slug;
    }
  }
}

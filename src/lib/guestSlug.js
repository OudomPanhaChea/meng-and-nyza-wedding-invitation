/* Compact, URL-safe encoding for guest names.

   Khmer is the worst case under percent-encoding: 9 visible URL chars
   per Khmer codepoint. Base64url-of-UTF-8 cuts that to ~4 chars per
   Khmer codepoint. We can do even better — Khmer codepoints all live
   in the U+1780–U+17FF block (only 128 codepoints, fits in 7 bits), so
   each Khmer char packs into a single byte. ASCII chars likewise pack
   into 1 byte. Result is ~1.4 chars per Khmer codepoint after base64url
   — roughly 6× shorter than percent-encoding.

   Wire format:
     [0x01][payload bytes...]   ← compact v1
   Each payload byte:
     0xxxxxxx   → ASCII codepoint (cp < 0x80)
     1xxxxxxx   → Khmer codepoint (0x1780 + low-7-bits)

   If the name contains anything outside ASCII + Khmer (accented Latin,
   CJK, emoji), we fall back to base64url of UTF-8 — those names get
   the same encoding as before.

   decodeGuestSlug auto-detects the format:
     • slug decodes to bytes starting with 0x01 → compact v1
     • slug decodes to other bytes              → legacy UTF-8 base64url
     • slug isn't valid base64                  → percent-encoded legacy
*/

const COMPACT_V1 = 0x01;
const KHMER_BLOCK_START = 0x1780;
const KHMER_BLOCK_END = 0x17ff;

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

function isCompactable(name) {
  let hasKhmer = false;
  for (const ch of name) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80) continue;
    if (cp >= KHMER_BLOCK_START && cp <= KHMER_BLOCK_END) {
      hasKhmer = true;
      continue;
    }
    return false;
  }
  // Only use compact mode when there's at least one Khmer char — for
  // pure ASCII names the legacy UTF-8 path is already 2 chars shorter.
  return hasKhmer;
}

export function encodeGuestSlug(name) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "";

  if (isCompactable(trimmed)) {
    const bytes = [COMPACT_V1];
    for (const ch of trimmed) {
      const cp = ch.codePointAt(0);
      bytes.push(
        cp < 0x80 ? cp : 0x80 | (cp - KHMER_BLOCK_START),
      );
    }
    return toB64Url(new Uint8Array(bytes));
  }

  return toB64Url(new TextEncoder().encode(trimmed));
}

export function decodeGuestSlug(slug) {
  if (!slug) return "";

  try {
    const bytes = fromB64Url(slug);

    if (bytes.length > 0 && bytes[0] === COMPACT_V1) {
      let out = "";
      for (let i = 1; i < bytes.length; i++) {
        const b = bytes[i];
        const cp = b & 0x80 ? KHMER_BLOCK_START + (b & 0x7f) : b;
        out += String.fromCodePoint(cp);
      }
      return out;
    }

    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // Legacy percent-encoded form, e.g. /i/%E1%9E%A2... or /i/Mr.+Panha
    try {
      return decodeURIComponent(slug.replace(/\+/g, " "));
    } catch {
      return slug;
    }
  }
}

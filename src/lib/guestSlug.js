/* Compact, URL-safe encoding for guest names.

   Percent-encoding bloats Khmer text ~9x (each UTF-8 byte → 3 chars).
   Base64URL is ~33% overhead on the raw bytes, looks alphanumeric, and
   needs no escaping in URLs — so "អ្នកស្រី ថុង គីមសួគ៌" goes from
   ~150 chars to ~65.

   Decoder falls back to legacy percent-encoding so links shared before
   this change (and links containing plain ASCII like "Mr.+Panha") still
   resolve correctly. */

export function encodeGuestSlug(name) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "";
  const bytes = new TextEncoder().encode(trimmed);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeGuestSlug(slug) {
  if (!slug) return "";

  // Try base64url first.
  try {
    const b64 = slug.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // Fallback: legacy percent-encoded form, e.g. /i/%E1%9E%A2... or
    // /i/Mr.+Panha shared before the encoding change.
    try {
      return decodeURIComponent(slug.replace(/\+/g, " "));
    } catch {
      return slug;
    }
  }
}

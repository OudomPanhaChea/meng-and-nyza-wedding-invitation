import { useState, useMemo } from "react";
import { encodeGuestSlug } from "../lib/guestSlug";

/* Build an invitation URL from the current origin and the chosen guest
   name. The guest name is base64url-encoded so Khmer names stay compact
   (~65 chars) instead of bloating to ~150 chars under percent-encoding. */
function buildInvitationUrl(guest) {
  const base = `${window.location.origin}/i`;
  const slug = encodeGuestSlug(guest);
  return slug ? `${base}/${slug}` : base;
}

export default function HomePage() {
  const [guest, setGuest] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => buildInvitationUrl(guest), [guest]);
  const ready = guest.trim().length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — fallback below could be added if a target browser needs it
    }
  };

  const handleOpen = () => {
    window.location.href = url;
  };

  return (
    <div
      className="fixed inset-0 mx-auto w-full app-col overflow-y-auto"
      style={{
        background:
          "linear-gradient(160deg, #FFE5EC 0%, #FFF2F5 35%, #FEFCFD 70%, #FDF9EB 100%)",
      }}
    >
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px] text-center">
          <h1
            className="font-moul text-3xl mb-2"
            style={{ color: "#b59410" }}
          >
            ការអញ្ជើញពិសេស
          </h1>
          <p
            className="font-display italic text-lg mb-1"
            style={{ color: "#b59410", letterSpacing: "0.15em" }}
          >
            Personalized Invitation
          </p>
          <p
            className="font-hanuman text-xs"
            style={{ color: "rgba(181,148,16,0.75)" }}
          >
            បំពេញឈ្មោះភ្ញៀវ ដើម្បីបង្កើតតំណភ្ជាប់
          </p>

          {/* Divider */}
          <div className="my-6 mx-auto h-px w-32"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(181,148,16,0.55), transparent)",
            }}
          />

          {/* Input */}
          <label
            className="block text-left font-hanuman text-xs tracking-widest uppercase mb-2"
            style={{ color: "#b59410" }}
          >
            ឈ្មោះភ្ញៀវ · Guest Name
          </label>
          <input
            value={guest}
            onChange={(e) => setGuest(e.target.value)}
            placeholder="e.g. Mr. Panha"
            className="w-full px-4 py-3 rounded-full outline-none transition"
            style={{
              border: "1.5px solid #b59410",
              background: "rgba(255,255,255,0.85)",
              color: "#3a2809",
              fontFamily: "var(--font-hanuman)",
              fontSize: "0.95rem",
            }}
          />

          {/* Generated link preview */}
          <div className="mt-6 text-left">
            <p
              className="font-hanuman text-xs tracking-widest uppercase mb-2"
              style={{ color: "#b59410" }}
            >
              តំណភ្ជាប់ · Generated Link
            </p>
            <div
              className="rounded-md px-3 py-2 break-all text-xs"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(181,148,16,0.35)",
                color: "#3a2809",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                minHeight: "2.5rem",
              }}
            >
              {ready ? url : <span style={{ opacity: 0.55 }}>{url}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-center">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!ready}
              className="btn-open"
              style={{
                opacity: ready ? 1 : 0.55,
                cursor: ready ? "pointer" : "not-allowed",
              }}
            >
              {copied ? "Copied ✓" : "Copy Link"}
            </button>
            <button
              type="button"
              onClick={handleOpen}
              disabled={!ready}
              className="btn-open"
              style={{
                opacity: ready ? 1 : 0.55,
                cursor: ready ? "pointer" : "not-allowed",
              }}
            >
              Preview
            </button>
          </div>

          <p
            className="mt-8 font-display italic text-xs"
            style={{ color: "rgba(181,148,16,0.6)" }}
          >
            Share the link with your guest — they'll see their name on the
            invitation.
          </p>
        </div>
      </div>
    </div>
  );
}

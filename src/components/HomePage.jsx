import { useState, useMemo } from "react";
import { User, Link as LinkIcon, Copy, Eye, Check } from "lucide-react";
import { encodeGuestSlug } from "../lib/guestSlug";
import { GOLD } from "../tokens";
import DeveloperCredit from "./DeveloperCredit";
import FallingPetals from "./FallingPetals";
import SectionTitle from "./SectionTitle";
import backgroundImg from "../assets/background.png";
import roofFlowersImg from "../assets/roof-flowers.png";
import bottomFlowersImg from "../assets/bottom-flowers.png";
import OrnateDivider from "./OrnateDivider";

/* Build an invitation URL from the current origin and the chosen guest
   name. Khmer names are packed via a custom 1-byte-per-codepoint scheme
   so URLs stay compact (see src/lib/guestSlug.js). */
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
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard API blocked — recipient can long-press the URL field. */
    }
  };

  const handleOpen = () => {
    if (!ready) return;
    window.location.href = url;
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      {/* ── Layer 1: photo background + white overlay ── */}
      <div
        className="fixed inset-0 mx-auto w-full app-col overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImg})` }}
        />
        <div className="absolute inset-0 bg-white/30 pointer-events-none" />
      </div>

      {/* ── Layer 2: roof + bottom flowers ── */}
      <div
        className="fixed inset-0 mx-auto w-full app-col pointer-events-none overflow-hidden"
        style={{ zIndex: 30 }}
      >
        <div
          className="absolute select-none left-1/2 -translate-x-1/2"
          style={{ top: "-120px", width: "112%" }}
        >
          <img
            src={roofFlowersImg}
            alt=""
            draggable={false}
            className="w-full block"
          />
        </div>
        <div
          className="absolute bottom-flowers-anchor select-none left-1/2 -translate-x-1/2 blur-[0.5px]"
          style={{ width: "100%" }}
        >
          <img
            src={bottomFlowersImg}
            alt=""
            draggable={false}
            className="w-full block"
          />
        </div>
      </div>

      {/* ── Layer 3: ambient falling petals ── */}
      <FallingPetals zIndex={25} />

      {/* ── Layer 4: content ── */}
      <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm space-y-5">
          <SectionTitle className="home" size="3xl" subtitle="- ធៀបការ Digital -">
            WISETHEAB
          </SectionTitle>

          <p className="text-center font-display italic text-xl tracking-[0.25em]">
            Personalized Invitation
          </p>
          <p className="text-center font-hanuman -mt-3">
            បំពេញឈ្មោះភ្ញៀវ ដើម្បីបង្កើតតំណភ្ជាប់
          </p>

          {/* Form card — matches BlessingSection's translucent card */}
          <div className="bg-black/5 backdrop-blur-xs mt-6 rounded-lg p-5 space-y-5">
            {/* Guest name */}
            <div className="space-y-1.5">
              <label className="flex gap-2 font-hanuman font-semibold text-base">
                <User size={20} strokeWidth={2.25} style={{ color: GOLD }} />
                <span>ឈ្មោះភ្ញៀវ</span>
              </label>
              <input
                className="blessing-input"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder="លោក/លោកស្រី..."
                maxLength={60}
              />
            </div>

            {/* Generated link */}
            <div className="space-y-1.5">
              <label className="flex gap-2 font-hanuman font-semibold text-base">
                <LinkIcon
                  size={20}
                  strokeWidth={2.25}
                  style={{ color: GOLD }}
                />
                <span>តំណភ្ជាប់</span>
              </label>
              <div
                className="blessing-input break-all text-xs"
                style={{
                  minHeight: "2.75rem",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  opacity: ready ? 1 : 0.55,
                }}
              >
                {url}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!ready}
                className="btn-open inline-flex items-center gap-2"
                style={{
                  opacity: ready ? 1 : 0.55,
                  cursor: ready ? "pointer" : "not-allowed",
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={2.5} />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleOpen}
                disabled={!ready}
                className="btn-open inline-flex items-center gap-2"
                style={{
                  opacity: ready ? 1 : 0.55,
                  cursor: ready ? "pointer" : "not-allowed",
                }}
              >
                <Eye size={16} strokeWidth={2.5} />
                <span>Preview</span>
              </button>
            </div>
          </div>
          <OrnateDivider className="mx-auto my-8" />
          <DeveloperCredit className="mt-12" />
        </div>
      </div>
    </div>
  );
}

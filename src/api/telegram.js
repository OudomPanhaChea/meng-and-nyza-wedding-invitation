/* Telegram bot API helpers.
   Bot token + chat id come from Vite env vars (VITE_*). These values
   ship in the client bundle — see warning in .env. */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

/* Escape characters that MarkdownV2 treats as control. Without this,
   guest names or messages containing _ * [ ] ( ) ~ ` > # + - = | { } . !
   will fail Telegram's parser and the whole sendMessage call rejects. */
const MD_ESCAPE = /[_*[\]()~`>#+\-=|{}.!\\]/g;
const escapeMd = (s) => String(s ?? "").replace(MD_ESCAPE, "\\$&");

/* Format the current moment in Phnom Penh (Asia/Phnom_Penh, UTC+7) as a
   friendly long-form string like "Monday, May 27th 2026 · 3:00 PM".
   Recipients read the messages locally, so the timestamp reflects their
   wall clock — not the sender's browser timezone. */
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function formatPhnomPenhTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Phnom_Penh",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const month = get("month");
  const day = ordinal(Number(get("day")));
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const period = get("dayPeriod").toUpperCase();
  return `${weekday}, ${month} ${day} ${year} · ${hour}:${minute} ${period}`;
}

/* Send a blessing as a formatted bot message to the configured group.

   Schema (MarkdownV2):
     ╭─────────────────────────╮
     │  🪷  ពរជ័យមង្គល · Blessing  │
     ╰─────────────────────────╯

     👤 From      ឈ្មោះ
     🕒 Sent      22 May 2026 · 17:42 ICT

     ─────── 💬 Message ───────

     <blessing message body>

     · · · · · · · · · · · · ·
     💌  Meng & Nyza Wedding Invitation                                */
export async function sendBlessing(name, message) {
  const safeName = escapeMd(name?.trim() || "Anonymous");
  const safeMessage = escapeMd(message?.trim() || "");
  const timestamp = escapeMd(formatPhnomPenhTime());

  const text = [
    "    *សារជូនពរ*",
    "",
    `  *From:*  ${safeName}`,
    `  *Sent:*  ${timestamp}`,
    "",
    "━━━━━━━  💬  *Message*  ━━━━━━━",
    "",
    safeMessage,
    "",
    "·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·",
    "💌  _Meng & Nyza Wedding Invitation_",
  ].join("\n");

  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`sendBlessing failed: ${res.status} ${detail}`);
  }
  return res.json();
}

# Meng & Nyza · Digital Wedding Invitation

A cinematic, mobile-first digital wedding invitation for **MOENG SEUMENG &
PUTH SETHYNYZA**, set for **Saturday, June 27th 2026** in Poipet, Banteay
Meanchey, Cambodia.

Built as a single-page React app with a hand-crafted opening sequence,
scroll-driven section reveals, an event schedule, an interactive gallery,
and a guest-blessing form that delivers messages straight to the family's
Telegram group.

---

## ✨ Features

- **Envelope opening** — animated intro with theme song, guest-name
  personalisation, and a cinematic flash-into-content transition.
- **Hero section** — bilingual (ខ្មែរ / English) names, parents'
  blessings, animated countdown to the ceremony.
- **Schedule** — two-day ritual timeline (សែនក្រុងពលី → ហែរជំនូន →
  ពិធីបំពាក់ចិញ្ចៀន → …) on an animated rope rail with milestone reveals
  tied to scroll position.
- **Venue** — map embed, Google Maps deep link, QR code, and address card.
- **Gallery** — deterministic group-aware grid layout (`photo1.1`,
  `photo1.2`, …) with portrait pairing, landscape full-rows, and a
  full-screen lightbox with keyboard navigation.
- **Blessing form** — guests leave a message; the form posts it to a
  Telegram chat via the Bot API with a formatted card (sender, ICT
  timestamp, message body).
- **Decorative layer** — falling petals, ornate dividers, lotus motifs,
  drifting roof/bottom flowers, deterministic floral background.
- **Guest links** — `/i/<guest-name>` paths personalise the opening
  screen; a tiny no-library router resolves `/`, `/i`, `/i/<name>`, and
  legacy `/invitation?g=<name>` URLs. The `/` route serves a guest-link
  generator at `HomePage`.

---

## 🛠️ Tech stack

| Concern        | Tool                                          |
| -------------- | --------------------------------------------- |
| Framework      | [React 19](https://react.dev/)                |
| Build tool     | [Vite 8](https://vitejs.dev/)                 |
| Styling        | [Tailwind CSS 4](https://tailwindcss.com/)    |
| Animations     | [GSAP](https://gsap.com/) + ScrollTrigger     |
| Icons          | [lucide-react](https://lucide.dev/)           |
| Messaging      | Telegram Bot API                              |
| Linting        | ESLint 10 + `eslint-plugin-react-hooks`       |
| Typography     | Moul · Hanuman · Cormorant Garamond · EB Garamond (Google Fonts) |

---

## 🚀 Getting started

### Prerequisites

- **Node.js 20+** (Vite 8 requires Node 20 or newer)
- A Telegram bot if you want the blessing form to work — see
  [Telegram setup](#-telegram-setup) below.

### Install

```bash
git clone https://github.com/OudomPanhaChea/meng-and-nyza-wedding-invitation.git
cd meng-and-nyza-wedding-invitation
npm install
```

### Configure environment

```bash
cp .env.example .env
# then fill in VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID
```

> ⚠️ The `VITE_` prefix means Telegram credentials ship in the client
> bundle and are visible to anyone who opens the site. Use a bot whose
> only privilege is posting to your private group — never reuse a bot
> token from another project.

### Run

```bash
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the built output
npm run lint      # ESLint
```

---

## ⚙️ Configuration

All wedding content lives in **[`src/config.js`](src/config.js)** — edit
this single file to retarget the invitation to a different couple/event:

```js
export const weddingConfig = {
  groomKhmer: "...",
  brideKhmer: "...",
  weddingDate: "2026-06-27T13:00:00",
  ceremony: { date, partyTime, venue, address, mapUrl, mapQRCode },
  schedule: [ { date, events: [{ time, titleKhmer, icon }, ...] }, ... ],
  groomParents: { fatherKhmer, motherKhmer },
  brideParents: { fatherKhmer, motherKhmer },
  greeting: "...",
};
```

The `icon` field on each schedule event accepts any
[lucide-react](https://lucide.dev/icons/) icon name in PascalCase
(`HandHeart`, `Sparkles`, `Wine`, …).

### Gallery photos

Drop wedding photos into `src/assets/galleries/` using the naming
convention `photo<group>.<sub>.<ext>`:

```
photo1.1.jpg  photo1.2.jpg  photo1.3.jpg   ← group 1 stays together
photo2.1.jpg  photo2.2.jpg                 ← then group 2, etc.
```

The grid groups photos by their group number, lays out portraits as
side-by-side pairs within the group, promotes landscapes to full-row
tiles, and treats `photo1.1` as the feature shot (full-row portrait).
No code changes required — Vite globs the folder at build time.

### Theme song

Replace `src/assets/audios/theme-song.mp3` to swap the audio that plays
after the envelope opens.

### Decorative imagery

`src/assets/` holds the static decorations:
`background.png`, `roof-flowers.png`, `bottom-flowers.png`,
`text-frame.png`, `seumeng_and_nisa.png`, `map-qrcode.png`,
`wisestep-logo.png`. Swap with your own assets keeping the same file
names.

---

## 💌 Telegram setup

1. **Create a bot** — message [@BotFather](https://t.me/BotFather) on
   Telegram, run `/newbot`, give it a name, and copy the token.
2. **Add the bot to a chat or group** that will receive the blessings.
3. **Get the chat ID** — send a test message in that chat, then visit:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
   Copy the `chat.id` field (groups start with `-`, e.g.
   `-1003909967542`).
4. **Fill in `.env`**:
   ```env
   VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
   VITE_TELEGRAM_CHAT_ID=-1003909967542
   ```

Each blessing is sent as a MarkdownV2-formatted card with the sender's
name, an ICT timestamp (Asia/Phnom_Penh), and the message body. Format
lives in [`src/api/telegram.js`](src/api/telegram.js).

---

## 🔗 Guest links

The router (in [`src/App.jsx`](src/App.jsx)) recognises three paths:

| Path                    | Behaviour                                              |
| ----------------------- | ------------------------------------------------------ |
| `/`                     | `HomePage` — generates personalised guest links        |
| `/i` or `/i/<name>`     | Opens the invitation; greets `<name>` if provided      |
| `/invitation?g=<name>`  | Legacy URL — same as `/i/<name>`                       |

Names are URL-encoded; spaces can be `+` or `%20`. Example:
`/i/John+Doe` → "Dear John Doe".

---

## 📁 Project layout

```
src/
├── api/
│   └── telegram.js          ← bot message schema
├── assets/
│   ├── audios/              ← theme song
│   ├── galleries/           ← gallery photos (photo<group>.<sub>.<ext>)
│   ├── background.png       ← fixed photo background
│   ├── roof-flowers.png     ← top floral decoration
│   ├── bottom-flowers.png   ← bottom floral decoration (footer + intro)
│   ├── text-frame.png       ← opening-screen frame
│   ├── seumeng_and_nisa.png ← couple-name lockup
│   ├── map-qrcode.png       ← venue QR
│   └── wisestep-logo.png    ← developer credit
├── components/
│   ├── OpeningScreen.jsx    ← envelope intro + theme song trigger
│   ├── HeroSection.jsx      ← names, parents, countdown
│   ├── ScheduleSection.jsx  ← two-day ritual timeline
│   ├── VenueSection.jsx     ← address, map, QR code
│   ├── GallerySection.jsx   ← group-aware grid + lightbox
│   ├── BlessingSection.jsx  ← guest-message form → Telegram
│   ├── Footer.jsx           ← thanks, apology, developer credit
│   ├── HomePage.jsx         ← guest-link generator (route `/`)
│   ├── FallingPetals.jsx    ← ambient petal animation
│   ├── Lotus.jsx            ← SVG lotus motif
│   ├── OrnateDivider.jsx    ← line · dot · diamond · dot · line
│   └── Divider.jsx
├── hooks/
│   └── useScrollReveal.js
├── App.jsx                  ← router + cinematic open/decoration layer
├── config.js                ← wedding content (single source of truth)
├── index.css                ← Tailwind theme tokens, base, components
└── main.jsx                 ← React entry point
```

---

## 🚢 Deployment

The output is a static SPA — drop the `dist/` folder onto any static
host:

- **Vercel / Netlify** — connect the repo, set the build command to
  `npm run build`, output directory to `dist`, and add the two
  `VITE_TELEGRAM_*` environment variables.
- **GitHub Pages** — `npm run build` then publish `dist/` on the
  `gh-pages` branch. Add a SPA rewrite rule (e.g.
  `dist/404.html` mirroring `index.html`) so `/i/<name>` paths resolve.

---

## 👰🤵 The couple

| Khmer            | Latin              |
| ---------------- | ------------------ |
| ម៉ឹង ស៊ឺម៉េង     | MOENG SEUMENG      |
| ពុធ សិទ្ធីនីហ្សា | PUTH SETHYNYZA     |

**Ceremony:** ថ្ងៃសៅរ៍ ទី27 ខែមិថុនា ឆ្នាំ2026 · 5:30 នាទីល្ងាច
**Venue:** ភោជនីយដ្ឋាន ប៊ុន គឹមអ៊ី (តាឡាក់), ក្រុងប៉ោយប៉ែត ខេត្តបន្ទាយមានជ័យ

---

## 🤝 Credits

Designed & built by **[WiseTheab](https://www.facebook.com/WiseStepSolution)** — _Innovating Modern Solutions_.

Khmer typography by [Moul](https://fonts.google.com/specimen/Moul) &
[Hanuman](https://fonts.google.com/specimen/Hanuman). Latin display by
[Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond).

---

## 📜 License

Private — content (names, photos, schedule, audio) belongs to the
couple. Code structure may be reused with permission.

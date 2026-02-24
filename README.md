# ロマ字 → 日本語 · Romaji to Japanese Converter

Black-on-white, IME-style romaji converter with kanji candidate selection and furigana display.

---

## Features

- Type romaji, get Japanese with **kanji candidates** (click any word to pick)
- **Furigana** (hiragana reading) shown in small text below each word
- Three copy buttons: **Copy All** (kanji), **Copy Hiragana**, **Copy Katakana**
- Fully responsive — works on desktop and Android browsers
- Offline kanji dictionary via JMDict (bundled)

---

## Run with Docker (recommended)

```bash
docker compose up --build
```

Then open **http://localhost:3000** in your browser (or on Android, use your machine's LAN IP).

---

## Run locally (development)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** (proxies `/api` → backend automatically).

---

## Usage

1. Type romaji words separated by spaces:
   `watashi wa gakusei desu`

2. Press **変換 · Convert** (or Ctrl+Enter)

3. Tap any word in the output to pick from kanji candidates

4. Use the copy buttons to grab the text you need

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Python · FastAPI · romkan · JMDict (jamdict) |
| Frontend | React · Vite · Tailwind CSS · Framer Motion |
| Serving  | Nginx (Docker) / Vite dev server (local) |

---

## Notes

- Particles like は / が appear as `wa` / `ga` in romaji — they'll show as `わ`/`が` in kana. Use the picker to swap if needed.
- Kanji suggestions come from JMDict — common words have good coverage; rare words may only show kana.

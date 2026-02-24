from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import romkan
import re

app = FastAPI(title="Romaji to Japanese Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize jamdict (optional - kanji suggestions)
try:
    from jamdict import Jamdict
    jmd = Jamdict()
    HAS_JAMDICT = True
except Exception:
    HAS_JAMDICT = False


class ConvertRequest(BaseModel):
    text: str


class WordSegment(BaseModel):
    romaji: str
    hiragana: str
    katakana: str
    candidates: List[str]
    selected: str


class ConvertResponse(BaseModel):
    segments: List[WordSegment]


def is_pure_romaji(text: str) -> bool:
    """Check if text is pure ASCII (likely romaji)."""
    return bool(re.match(r'^[a-zA-Z\'-]+$', text))


def get_kanji_candidates(hiragana: str) -> List[str]:
    """Look up kanji candidates for a hiragana reading via JMDict."""
    if not HAS_JAMDICT:
        return []
    candidates = []
    try:
        result = jmd.lookup(hiragana)
        for entry in result.entries:
            # Only include entries whose reading matches exactly
            readings = [r.text for r in entry.kana_forms]
            if hiragana in readings:
                for kanji_form in entry.kanji_forms:
                    text = kanji_form.text
                    if text and text not in candidates:
                        candidates.append(text)
    except Exception:
        pass
    return candidates


@app.post("/convert", response_model=ConvertResponse)
async def convert(req: ConvertRequest):
    # Split on whitespace preserving multiple spaces as single tokens
    raw_words = req.text.strip().split()
    segments: List[WordSegment] = []

    for word in raw_words:
        if not word:
            continue

        if is_pure_romaji(word):
            hiragana = romkan.to_hiragana(word)
            katakana = romkan.to_katakana(word)
        else:
            # Already kana/kanji or mixed – pass through
            hiragana = word
            katakana = word

        # Build candidate list: hiragana first, then katakana, then kanji
        candidates: List[str] = [hiragana]
        if katakana != hiragana:
            candidates.append(katakana)

        kanji_candidates = get_kanji_candidates(hiragana)
        for kc in kanji_candidates:
            if kc not in candidates:
                candidates.append(kc)

        # Default selection: first kanji candidate if available, else hiragana
        selected = candidates[2] if len(candidates) > 2 else candidates[0]

        segments.append(WordSegment(
            romaji=word,
            hiragana=hiragana,
            katakana=katakana,
            candidates=candidates,
            selected=selected,
        ))

    return ConvertResponse(segments=segments)


@app.get("/health")
async def health():
    return {"status": "ok", "jamdict": HAS_JAMDICT}

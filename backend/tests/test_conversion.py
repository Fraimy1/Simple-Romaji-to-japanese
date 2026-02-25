"""
~110 grammatical tests for the Romaji → Japanese converter.

Covers:
  1. Hiragana conversion accuracy        (30 cases)
  2. Katakana conversion accuracy        (10 cases)
  3. Kanji present in candidates         (30 cases, jamdict-gated)
  4. Default selection is a kanji char   (15 cases, jamdict-gated)
  5. Sentence segmentation count         (10 cases)
  6. Edge cases (geminates, compound kana, n→ん)  (15 cases)
  7. Utility (health, empty input)        (2 cases)

Run from the project root:
    pytest backend/tests/test_conversion.py -v
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from main import HAS_JAMDICT, app  # noqa: E402

client = TestClient(app)


# ─── helpers ────────────────────────────────────────────────────────────────

def api_convert(text: str):
    r = client.post("/convert", json={"text": text})
    assert r.status_code == 200
    return r.json()["segments"]


def one(romaji: str) -> dict:
    """Convert a single word and return its only segment."""
    segs = api_convert(romaji)
    assert len(segs) == 1, f"Expected 1 segment for '{romaji}', got {len(segs)}"
    return segs[0]


def has_kanji(text: str) -> bool:
    """Return True if text contains at least one CJK unified ideograph."""
    return any("\u4e00" <= c <= "\u9fff" for c in text)


# ─── 1. Hiragana conversion (30 cases) ──────────────────────────────────────

HIRAGANA_CASES = [
    # pronouns & demonstratives
    ("watashi",  "わたし"),
    ("anata",    "あなた"),
    ("kare",     "かれ"),
    ("kanojo",   "かのじょ"),
    ("kore",     "これ"),
    ("sore",     "それ"),
    ("are",      "あれ"),
    # question words
    ("nani",     "なに"),
    ("doko",     "どこ"),
    ("dare",     "だれ"),
    # animals
    ("inu",      "いぬ"),
    ("neko",     "ねこ"),
    ("tori",     "とり"),
    ("sakana",   "さかな"),
    ("uma",      "うま"),
    # nature & elements
    ("hana",     "はな"),
    ("yama",     "やま"),
    ("kawa",     "かわ"),
    ("umi",      "うみ"),
    ("sora",     "そら"),
    ("mizu",     "みず"),
    ("hi",       "ひ"),
    ("tsuki",    "つき"),
    ("hoshi",    "ほし"),
    ("ki",       "き"),
    # body
    ("hito",     "ひと"),
    ("te",       "て"),
    ("me",       "め"),
    ("kuchi",    "くち"),
    ("atama",    "あたま"),
]


@pytest.mark.parametrize("romaji,expected", HIRAGANA_CASES)
def test_hiragana(romaji, expected):
    assert one(romaji)["hiragana"] == expected, (
        f"romaji '{romaji}': expected hiragana '{expected}'"
    )


# ─── 2. Katakana conversion (10 cases) ──────────────────────────────────────

KATAKANA_CASES = [
    ("watashi",  "ワタシ"),
    ("inu",      "イヌ"),
    ("neko",     "ネコ"),
    ("yama",     "ヤマ"),
    ("umi",      "ウミ"),
    ("hana",     "ハナ"),
    ("mizu",     "ミズ"),
    ("hito",     "ヒト"),
    ("sora",     "ソラ"),
    ("tsuki",    "ツキ"),
]


@pytest.mark.parametrize("romaji,expected", KATAKANA_CASES)
def test_katakana(romaji, expected):
    assert one(romaji)["katakana"] == expected, (
        f"romaji '{romaji}': expected katakana '{expected}'"
    )


# ─── 3. Kanji present in candidates (30 cases, jamdict-gated) ───────────────

KANJI_PRESENCE_CASES = [
    # pronouns
    ("watashi",  "私"),
    ("anata",    "貴方"),
    ("kare",     "彼"),
    ("kanojo",   "彼女"),
    # animals
    ("inu",      "犬"),
    ("neko",     "猫"),
    ("tori",     "鳥"),
    ("sakana",   "魚"),
    ("uma",      "馬"),
    # nature
    ("hana",     "花"),
    ("yama",     "山"),
    ("kawa",     "川"),
    ("umi",      "海"),
    ("sora",     "空"),
    ("mizu",     "水"),
    ("tsuki",    "月"),
    ("hoshi",    "星"),
    ("ki",       "木"),
    # body
    ("hito",     "人"),
    ("te",       "手"),
    ("me",       "目"),
    ("kuchi",    "口"),
    ("mimi",     "耳"),
    ("ashi",     "足"),
    ("atama",    "頭"),
    ("kokoro",   "心"),
    # objects & concepts
    ("hon",      "本"),
    ("kuruma",   "車"),
    ("ie",       "家"),
    ("ai",       "愛"),
]


@pytest.mark.skipif(not HAS_JAMDICT, reason="jamdict not available")
@pytest.mark.parametrize("romaji,kanji", KANJI_PRESENCE_CASES)
def test_kanji_in_candidates(romaji, kanji):
    seg = one(romaji)
    assert kanji in seg["candidates"], (
        f"Expected '{kanji}' in candidates for '{romaji}' "
        f"(got {seg['candidates']})"
    )


# ─── 4. Default selection is a kanji (15 cases, jamdict-gated) ──────────────

KANJI_SELECTED_CASES = [
    "watashi", "inu",  "neko",   "yama",  "kawa",
    "umi",     "hana", "hoshi",  "hito",  "te",
    "me",      "mimi", "ashi",   "hon",   "kokoro",
]


@pytest.mark.skipif(not HAS_JAMDICT, reason="jamdict not available")
@pytest.mark.parametrize("romaji", KANJI_SELECTED_CASES)
def test_default_selection_is_kanji(romaji):
    seg = one(romaji)
    assert has_kanji(seg["selected"]), (
        f"Expected kanji as default selection for '{romaji}', "
        f"got '{seg['selected']}' (candidates: {seg['candidates']})"
    )


# ─── 5. Sentence segmentation (10 cases) ────────────────────────────────────

SENTENCE_CASES = [
    ("watashi wa gakusei desu",         4),
    ("kore wa hon desu",                4),
    ("inu ga iru",                      3),
    ("neko wa kawaii",                  3),
    ("watashi no namae wa tanaka desu", 6),
    ("umi ga kirei desu",               4),
    ("hana wo miru",                    3),
    ("mizu wo nomu",                    3),
    ("yama ni noboru",                  3),
    ("kuruma de iku",                   3),
]


@pytest.mark.parametrize("sentence,expected_count", SENTENCE_CASES)
def test_sentence_segment_count(sentence, expected_count):
    segs = api_convert(sentence)
    assert len(segs) == expected_count, (
        f"'{sentence}': expected {expected_count} segments, got {len(segs)}"
    )


# ─── 6. Edge cases – geminates, compound kana, ん handling (15 cases) ────────

EDGE_CASES = [
    # geminate consonants (double → っ + second consonant)
    ("kitte",    "きって"),   # stamp
    ("motto",    "もっと"),   # more
    ("zasshi",   "ざっし"),   # magazine
    ("kekkou",   "けっこう"), # quite / fine
    ("mittsu",   "みっつ"),   # three (counting)
    ("kippu",    "きっぷ"),   # ticket
    # compound (palatalized) kana
    ("sha",      "しゃ"),
    ("shu",      "しゅ"),
    ("sho",      "しょ"),
    ("cha",      "ちゃ"),
    ("cho",      "ちょ"),
    ("nya",      "にゃ"),
    # n → ん before consonant
    ("densha",   "でんしゃ"),  # train
    # grammar / verb endings
    ("desu",     "です"),
    ("masu",     "ます"),
]


@pytest.mark.parametrize("romaji,expected", EDGE_CASES)
def test_edge_case_hiragana(romaji, expected):
    assert one(romaji)["hiragana"] == expected, (
        f"Edge case '{romaji}': expected '{expected}'"
    )


# ─── 8. Particle / grammar word defaults stay hiragana (12 cases) ────────────

PARTICLE_DEFAULT_CASES = [
    # Orthographic particles (written form ≠ phonetic kana)
    ("wa",      "は"),   # topic particle: pronounced "wa", written は
    ("e",       "へ"),   # direction particle: pronounced "e", written へ
    # Phonetic particles
    ("ga",      "が"),
    ("wo",      "を"),
    ("ni",      "に"),
    ("de",      "で"),
    ("no",      "の"),
    ("ka",      "か"),
    ("mo",      "も"),
    ("desu",    "です"),
    ("masu",    "ます"),
    ("da",      "だ"),
    ("nai",     "ない"),
]


@pytest.mark.parametrize("romaji,expected_hiragana", PARTICLE_DEFAULT_CASES)
def test_particle_default_stays_hiragana(romaji, expected_hiragana):
    seg = one(romaji)
    assert seg["selected"] == expected_hiragana, (
        f"'{romaji}' should default to '{expected_hiragana}', "
        f"got '{seg['selected']}'"
    )


ORTHOGRAPHIC_PARTICLE_CASES = [
    ("wa", "は", "わ"),  # hiragana=は, phonetic わ still in candidates
    ("e",  "へ", "え"),  # hiragana=へ, phonetic え still in candidates
]


@pytest.mark.parametrize("romaji,ortho,phonetic", ORTHOGRAPHIC_PARTICLE_CASES)
def test_orthographic_particle_hiragana_field(romaji, ortho, phonetic):
    seg = one(romaji)
    assert seg["hiragana"] == ortho, (
        f"'{romaji}' hiragana field should be '{ortho}', got '{seg['hiragana']}'"
    )
    assert phonetic in seg["candidates"], (
        f"Phonetic form '{phonetic}' should still appear in candidates for '{romaji}'"
    )


# ─── 9. Punctuation conversion ───────────────────────────────────────────────

PUNCT_STANDALONE_CASES = [
    ("!", "！"),
    ("?", "？"),
    (".", "。"),
]


@pytest.mark.parametrize("ascii_punct,jp_punct", PUNCT_STANDALONE_CASES)
def test_standalone_punctuation_converts(ascii_punct, jp_punct):
    seg = one(ascii_punct)
    assert seg["selected"] == jp_punct
    assert seg["hiragana"] == jp_punct
    assert seg["romaji"] == ascii_punct


def test_punctuation_attached_to_word():
    segs = api_convert("desu!")
    assert len(segs) == 2, f"Expected 2 segments for 'desu!', got {len(segs)}"
    assert segs[0]["hiragana"] == "です"
    assert segs[1]["selected"] == "！"


def test_multiple_punctuation_attached():
    segs = api_convert("nani?!")
    assert len(segs) == 3, f"Expected 3 segments for 'nani?!', got {len(segs)}"
    assert segs[0]["hiragana"] == "なに"
    assert segs[1]["selected"] == "？"
    assert segs[2]["selected"] == "！"


@pytest.mark.parametrize("sentence,expected_count", [
    ("watashi wa gakusei desu!", 5),   # 4 words + 1 punct
    ("nani?",                   2),   # 1 word + 1 punct
    ("inu ga iru.",              4),   # 3 words + 1 punct
])
def test_sentence_with_punctuation_count(sentence, expected_count):
    segs = api_convert(sentence)
    assert len(segs) == expected_count, (
        f"'{sentence}': expected {expected_count} segments, got {len(segs)}"
    )


# ─── 7. Utility ─────────────────────────────────────────────────────────────

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "jamdict" in data


def test_empty_input_returns_no_segments():
    segs = api_convert("   ")
    assert segs == []

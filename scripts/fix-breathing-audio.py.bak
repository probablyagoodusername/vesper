#!/usr/bin/env python3
"""
Fix breathing timing and count errors in Vesper meditation audio.

Uses OpenAI Whisper (local, CPU) for word-level transcription of breathing
sections, then applies surgical ffmpeg edits:
- Remove doubled/mangled counts
- Adjust phase timing to match target durations

Usage:
    python3 scripts/fix-breathing-audio.py analyze <slug> [--lang=en]
    python3 scripts/fix-breathing-audio.py analyze --all [--lang=en]
    python3 scripts/fix-breathing-audio.py fix <slug> [--lang=en]
    python3 scripts/fix-breathing-audio.py fix --all [--lang=en]
    python3 scripts/fix-breathing-audio.py fix <slug> --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ── Paths ──────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
CONTENT_DIR = PROJECT_ROOT / "src" / "content" / "meditations"
BREATHING_DIR = PROJECT_ROOT / "src" / "content" / "breathing"
AUDIO_DIRS = {
    "en": PROJECT_ROOT / "public" / "audio" / "en",
    "en-v2": PROJECT_ROOT / "public" / "audio" / "en-v2",
}
# Also check deployed location
DEPLOYED_AUDIO_DIRS = {
    "en": Path("/var/www/vesper-static/audio/en"),
    "en-v2": Path("/var/www/vesper-static/audio/en-v2"),
}

# ── Breathing pattern targets ──────────────────────────────────────────────

BREATHING_PATTERNS: dict[str, dict] = {}


def load_breathing_patterns() -> None:
    """Load breathing pattern JSONs from content dir."""
    for f in BREATHING_DIR.glob("*.json"):
        data = json.loads(f.read_text())
        BREATHING_PATTERNS[data["slug"]] = data


# ── Number word mappings ───────────────────────────────────────────────────

EN_NUMBERS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
    "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
}

FR_NUMBERS = {
    "un": 1, "deux": 2, "trois": 3, "quatre": 4, "cinq": 5,
    "six": 6, "sept": 7, "huit": 8, "neuf": 9, "dix": 10,
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
    "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
}

# Phase keywords that signal the start of a count
EN_PHASE_KEYWORDS = {
    "inhale": ["breathe in", "in", "inhale"],
    "hold_in": ["hold"],
    "exhale": ["breathe out", "out", "exhale", "release"],
    "hold_out": ["hold"],
}

FR_PHASE_KEYWORDS = {
    "inhale": ["inspire", "inspirez"],
    "hold_in": ["retiens", "retenez", "maintenez"],
    "exhale": ["expire", "expirez", "relâchez"],
    "hold_out": ["retiens", "retenez", "maintenez"],
}


# ── Data structures ────────────────────────────────────────────────────────

@dataclass
class WordTimestamp:
    word: str
    start: float
    end: float


@dataclass
class BreathingPhase:
    """One phase of breathing (e.g., 'inhale' for 4 counts)."""
    phase_type: str  # inhale, hold_in, exhale, hold_out
    expected_count: int  # target number of counts (e.g., 4)
    target_duration: float  # seconds this phase should last
    line_index: int  # index in alignment JSON
    audio_start: float  # start time in audio (seconds)
    audio_end: float  # end time in audio (seconds)
    actual_duration: float = 0.0
    # Whisper results
    words: list[WordTimestamp] = field(default_factory=list)
    detected_counts: list[int] = field(default_factory=list)
    issues: list[str] = field(default_factory=list)


@dataclass
class BreathingSection:
    """A contiguous block of breathing phases in the audio."""
    phases: list[BreathingPhase] = field(default_factory=list)
    audio_start: float = 0.0
    audio_end: float = 0.0

    @property
    def total_issues(self) -> int:
        return sum(len(p.issues) for p in self.phases)


@dataclass
class AnalysisResult:
    slug: str
    lang: str
    mp3_path: Path
    alignment_path: Path
    sections: list[BreathingSection] = field(default_factory=list)
    total_phases: int = 0
    timing_issues: int = 0
    count_issues: int = 0
    error: Optional[str] = None


# ── Meditation script parsing ──────────────────────────────────────────────

def find_audio_paths(slug: str, lang: str) -> tuple[Optional[Path], Optional[Path]]:
    """Find MP3 and alignment JSON for a meditation."""
    for dirs in [AUDIO_DIRS, DEPLOYED_AUDIO_DIRS]:
        if lang not in dirs:
            continue
        d = dirs[lang]
        mp3 = d / f"{slug}.mp3"
        align = d / f"{slug}.json"
        if mp3.exists() and align.exists():
            return mp3, align
    return None, None


def load_meditation(slug: str) -> Optional[dict]:
    """Load meditation JSON."""
    path = CONTENT_DIR / f"{slug}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def _is_pmr_hold(text: str, lang: str) -> bool:
    """
    Detect if a text describes a PMR (progressive muscle relaxation) hold,
    NOT a breathing hold. PMR holds have muscle-tension context.
    """
    lower = text.lower()
    if lang in ("en", "en-v2"):
        pmr_markers = [
            r'\b(?:tighten|squeeze|curl|flex|scrunch|press|lift|clench)\b',
            r'\b(?:muscles?|toes|calves?|thighs?|shoulders?|fists?|arms?|face|jaw)\b',
            r'\bhold\s+(?:them|it|that|this)\s+(?:tight|there)\b',
            r'\bhold\s+that\s+tension\b',
            r'\bhold\s+it\s+all\b',
        ]
    else:
        pmr_markers = [
            r'\b(?:contractez?|serrez|recroquevillez|fléchissez|pressez|montez)\b',
            r'\b(?:muscles?|orteils|mollets?|cuisses?|épaules?|poings?|bras|visage|mâchoire)\b',
            r'\bmaintenez?\s+(?:les?|cet(?:te)?|tout|serré)\b',
        ]

    return any(re.search(p, lower) for p in pmr_markers)


def _extract_counting_subsequences(text: str, lang: str) -> list[tuple[str, str, int]]:
    """
    Find all counting sub-sequences within a text, regardless of surrounding prose.

    Returns list of (sub_text, phase_type, expected_count).
    Handles:
    - Standalone counting: "In... two... three... four."
    - Prose-embedded: "Breathe in through your nose for a count of four... one... two... three... four."
    - Multi-phase: "...four. And out through your mouth... one... two... three..."

    Excludes PMR (progressive muscle relaxation) holds — these are muscle tension
    timers, not breathing phases.
    """
    numbers = EN_NUMBERS if lang in ("en", "en-v2") else FR_NUMBERS

    # Check the full line for PMR (muscle tension) context BEFORE splitting.
    # After splitting, sub-phrases like "Hold. One... two..." lose the muscle
    # context words ("squeeze", "muscles") that were in the earlier part of the line.
    # In practice, meditation scripts never mix breathing + PMR on the same line.
    if _is_pmr_hold(text, lang):
        return []

    # Split into sub-phrases at phase keyword boundaries
    sub_phrases = _split_at_phase_keywords(text, lang)

    results = []
    for phrase in sub_phrases:

        lower = phrase.lower()
        words = re.findall(r'[a-zA-ZéèêàùîâôûëïçÉÈÊÀÙÎÂÔÛËÏÇ]+|\d+', lower)
        found_numbers = [numbers[w] for w in words if w in numbers]

        if len(found_numbers) < 2:
            continue

        # Detect phase type anywhere in the phrase (not just at start)
        phase_type = _detect_phase_type_anywhere(lower, lang)
        if not phase_type:
            if _is_descending(found_numbers):
                phase_type = "countdown"
            else:
                continue

        if phase_type == "countdown":
            expected_count = found_numbers[0]
        else:
            expected_count = max(found_numbers) if found_numbers else len(found_numbers)

        results.append((phrase, phase_type, expected_count))

    return results


def _split_at_phase_keywords(text: str, lang: str) -> list[str]:
    """
    Split text at positions where a new breathing phase starts.

    Splits at any phase keyword boundary after punctuation (period or comma).
    """
    if lang in ("en", "en-v2"):
        # Split before phase keywords, whether preceded by period, comma, or just space.
        # Uses lookbehind for punctuation so we don't consume it from the text.
        # The lookahead allows keyword at end of string ([\s.,]|$).
        pattern = (
            r'(?:(?<=[.,])\s+)'
            r'(?=(?:and\s+)?(?:breathe\s+)?(?:in|out|exhale|inhale|hold|release)(?:[\s.,]|$))'
        )
    else:
        pattern = (
            r'(?:(?<=[.,])\s+)'
            r'(?=(?:et\s+)?(?:inspire|expire|expirez|inspirez|retiens|retenez|maintenez|relâchez)\b)'
        )

    parts = re.split(pattern, text, flags=re.IGNORECASE)
    return [p.strip() for p in parts if p.strip()]


def parse_counting_lines(script: str, lang: str) -> list[tuple[int, str, str, int]]:
    """
    Parse a raw meditation script and find lines with counting patterns.

    Returns list of (line_number, phase_type, raw_line, expected_count).
    Phase types: inhale, hold_in, exhale, hold_out, countdown.

    Handles counting embedded in prose lines (e.g. sleep meditations where
    inhale/exhale instructions are woven into longer sentences).
    """
    results = []
    lines = script.split("\n")

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue

        # Skip stage directions
        if stripped.startswith("["):
            continue

        # Extract all counting sub-sequences from this line
        subsequences = _extract_counting_subsequences(stripped, lang)
        for sub_text, phase_type, expected_count in subsequences:
            results.append((i, phase_type, sub_text, expected_count))

    return results


def _detect_phase_type(lower: str, lang: str) -> Optional[str]:
    """Detect breathing phase type from line start."""
    if lang in ("en", "en-v2"):
        # Order matters: "breathe in" before "in", "breathe out" before "out"
        if lower.startswith("breathe in") or lower.startswith("in...") or lower.startswith("in ") or lower.startswith("inhale"):
            return "inhale"
        if lower.startswith("breathe out") or lower.startswith("out...") or lower.startswith("out ") or lower.startswith("exhale"):
            return "exhale"
        if lower.startswith("and exhale") or lower.startswith("and release"):
            return "exhale"
        if lower.startswith("out,"):
            return "exhale"
        if lower.startswith("hold"):
            return "hold"  # disambiguated later by context
    else:
        if lower.startswith("inspire") or lower.startswith("inspirez"):
            return "inhale"
        if lower.startswith("expire") or lower.startswith("expirez") or lower.startswith("et relâchez"):
            return "exhale"
        if lower.startswith("retiens") or lower.startswith("retenez") or lower.startswith("maintenez"):
            return "hold"
    return None


def _detect_phase_type_anywhere(text: str, lang: str) -> Optional[str]:
    """
    Detect breathing phase type anywhere in text (not just at start).

    Used for prose-embedded counting like:
    "Breathe in through your nose for a count of four... one... two..."
    """
    # First try start-of-text detection (most reliable)
    result = _detect_phase_type(text, lang)
    if result:
        return result

    if lang in ("en", "en-v2"):
        # Scan for phase keywords anywhere in the text
        # Order matters: more specific patterns first
        if re.search(r'\bbreathe\s+in\b', text):
            return "inhale"
        if re.search(r'\bbreathe\s+out\b', text):
            return "exhale"
        if re.search(r'\binhale\b', text):
            return "inhale"
        if re.search(r'\bexhale\b', text):
            return "exhale"
        if re.search(r'\band\s+out\b', text):
            return "exhale"
        if re.search(r'\band\s+in\b', text):
            return "inhale"
        # "Hold that tension" = PMR countdown, not breathing hold
        if re.search(r'\bhold\s+(?:that|the|this)\s+(?:tension|squeeze|tighten)', text):
            return "countdown"
        if re.search(r'\bhold\b', text):
            return "hold"
    else:
        if re.search(r'\binspire[zr]?\b', text):
            return "inhale"
        if re.search(r'\bexpire[zr]?\b', text):
            return "exhale"
        if re.search(r'\brelâchez?\b', text):
            return "exhale"
        if re.search(r'\b(?:retiens|retenez|maintenez)\b', text):
            return "hold"

    return None


def _is_descending(nums: list[int]) -> bool:
    """Check if number sequence is strictly descending."""
    if len(nums) < 3:
        return False
    return all(nums[i] > nums[i + 1] for i in range(len(nums) - 1))



def find_counting_in_alignment(
    alignment: dict,
    script_counting_lines: list[tuple[int, str, str, int]],
    lang: str,
) -> list[tuple[int, str, int, float, float]]:
    """
    Match counting lines from the raw script to alignment JSON lines.

    The alignment uses prepared text (with [short pause] markers), so we
    fuzzy-match by looking for the counting words.

    Handles prose-embedded counting by using _extract_counting_subsequences
    to find counting patterns anywhere within alignment lines.

    Returns: [(align_index, phase_type, expected_count, start, end), ...]
    """
    align_lines = alignment["lines"]
    timestamps = alignment["timestamps"]
    numbers = EN_NUMBERS if lang in ("en", "en-v2") else FR_NUMBERS

    results = []

    for align_idx, aline in enumerate(align_lines):
        # Strip pause markers for matching
        clean = re.sub(r'\[(long|short)\s+pause\]', '', aline).strip()
        if not clean:
            continue

        ts = timestamps[align_idx]
        line_duration = ts["end"] - ts["start"]

        # Use the improved sub-sequence extraction
        subsequences = _extract_counting_subsequences(clean, lang)

        if not subsequences:
            continue

        if len(subsequences) == 1:
            # Single phase — assign full line duration
            _, phase_type, expected_count = subsequences[0]
            results.append((align_idx, phase_type, expected_count, ts["start"], ts["end"]))
        else:
            # Multiple phases — estimate sub-timestamps proportionally
            # Use character count in original alignment line as proxy for timing
            # (accounts for [long pause] tags that represent actual silence)
            sub_char_counts = []
            for sub_text, _, _ in subsequences:
                # Find the sub-text's position in the original line to estimate
                # how much of the line's duration it occupies
                # Count [long pause] tags in the sub-text region as extra time
                sub_lower = sub_text.lower()
                word_count = len(re.findall(r'[a-zA-ZéèêàùîâôûëïçÉÈÊÀÙÎÂÔÛËÏÇ]+|\d+', sub_lower))
                # Each count word with [long pause] spacing ≈ 3s in sleep category
                num_count = len([w for w in re.findall(r'[a-zA-ZéèêàùîâôûëïçÉÈÊÀÙÎÂÔÛËÏÇ]+|\d+', sub_lower) if w in numbers])
                # Weight counting words more heavily since they have pauses
                sub_char_counts.append(max(1, word_count + num_count * 2))

            total_chars = sum(sub_char_counts)
            sub_cursor = ts["start"]

            for si, (sub_text, phase_type, expected_count) in enumerate(subsequences):
                sub_duration = line_duration * (sub_char_counts[si] / total_chars)
                sub_start = sub_cursor
                sub_end = sub_cursor + sub_duration
                sub_cursor = sub_end
                results.append((align_idx, phase_type, expected_count, sub_start, sub_end))

    return results


def resolve_hold_phases(
    phases: list[tuple[int, str, int, float, float]],
    breathing_pattern: Optional[dict],
) -> list[tuple[int, str, int, float, float]]:
    """
    Disambiguate 'hold' into 'hold_in' or 'hold_out' based on surrounding phases
    and breathing pattern.
    """
    resolved = []
    for i, (idx, ptype, count, start, end) in enumerate(phases):
        if ptype != "hold":
            resolved.append((idx, ptype, count, start, end))
            continue

        # Look at previous phase
        prev_type = resolved[-1][1] if resolved else None
        if prev_type == "inhale":
            resolved.append((idx, "hold_in", count, start, end))
        elif prev_type == "exhale":
            resolved.append((idx, "hold_out", count, start, end))
        elif prev_type == "hold_in":
            # Two holds in a row after inhale → second is hold_out? Unlikely.
            # Check if pattern has holdOut
            if breathing_pattern and breathing_pattern.get("holdOut", 0) > 0:
                resolved.append((idx, "hold_out", count, start, end))
            else:
                resolved.append((idx, "hold_in", count, start, end))
        else:
            # Default: hold_in if we don't know
            resolved.append((idx, "hold_in", count, start, end))

    return resolved


def get_target_duration(
    phase_type: str,
    expected_count: int,
    breathing_pattern: Optional[dict],
    category: str = "",
) -> float:
    """
    Get target duration for a phase.

    Strategy: use the breathing pattern's target seconds for the phase.
    The pattern values represent seconds (e.g., exhale: 8 = 8 seconds),
    regardless of how many counts are spoken. In sleep category, each count
    has [long pause] spacing (~3s), so the actual audio is much longer than
    the target — the fix should compress it.

    For countdowns (PMR), use 1s per count since these are muscle-hold timers.
    """
    if phase_type == "countdown":
        return float(expected_count)  # 1s per count for countdowns

    if breathing_pattern:
        mapping = {
            "inhale": "inhale",
            "hold_in": "holdIn",
            "exhale": "exhale",
            "hold_out": "holdOut",
        }
        key = mapping.get(phase_type)
        if key:
            pattern_dur = float(breathing_pattern.get(key, 0))
            if pattern_dur > 0:
                # Always use pattern duration — it represents the target seconds.
                # The expected_count tells us how many counts are spoken, but the
                # pattern value is the authoritative target duration.
                return pattern_dur

    # Default: 1s per count
    return float(expected_count)


# ── Whisper transcription ─────────────────────────────────────────────────

_whisper_model = None


def get_whisper_model():
    """Lazy-load Whisper model (small, CPU)."""
    global _whisper_model
    if _whisper_model is None:
        import whisper
        print("  Loading Whisper model (small)...", flush=True)
        _whisper_model = whisper.load_model("small")
        print("  Model loaded.", flush=True)
    return _whisper_model


def extract_audio_segment(mp3_path: Path, start: float, end: float, out_path: Path) -> bool:
    """Extract a segment from an MP3 using ffmpeg."""
    cmd = [
        "ffmpeg", "-y", "-i", str(mp3_path),
        "-ss", f"{start:.3f}", "-to", f"{end:.3f}",
        "-c", "copy", str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def transcribe_segment(
    mp3_path: Path,
    start: float,
    end: float,
    lang: str,
) -> list[WordTimestamp]:
    """
    Transcribe an audio segment with Whisper, returning word-level timestamps.

    Extracts the segment first, then transcribes. Timestamps are offset back
    to the original audio timeline.
    """
    model = get_whisper_model()
    whisper_lang = "fr" if lang == "fr" else "en"

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        if not extract_audio_segment(mp3_path, start, end, tmp_path):
            print(f"    WARNING: ffmpeg extract failed for {start:.1f}-{end:.1f}s")
            return []

        result = model.transcribe(
            str(tmp_path),
            language=whisper_lang,
            word_timestamps=True,
        )

        words = []
        for seg in result.get("segments", []):
            for w in seg.get("words", []):
                words.append(WordTimestamp(
                    word=w["word"].strip().lower(),
                    start=w["start"] + start,  # offset to original timeline
                    end=w["end"] + start,
                ))
        return words
    finally:
        tmp_path.unlink(missing_ok=True)


# ── Analysis ───────────────────────────────────────────────────────────────

def analyze_meditation(slug: str, lang: str, use_whisper: bool = True) -> AnalysisResult:
    """Analyze a meditation's breathing sections for timing and count issues."""
    mp3_path, align_path = find_audio_paths(slug, lang)

    if not mp3_path or not align_path:
        return AnalysisResult(
            slug=slug, lang=lang,
            mp3_path=Path(""), alignment_path=Path(""),
            error=f"No audio/alignment found for {slug} ({lang})",
        )

    med = load_meditation(slug)
    if not med:
        return AnalysisResult(
            slug=slug, lang=lang,
            mp3_path=mp3_path, alignment_path=align_path,
            error=f"Meditation JSON not found: {slug}",
        )

    alignment = json.loads(align_path.read_text())
    script_key = "scriptFr" if lang == "fr" else "scriptEn"
    script = med.get(script_key, "")
    breathing_pattern = med.get("breathing")
    category = med.get("category", "")

    # For breathe-* meditations without a breathing field, infer from slug
    if not breathing_pattern and slug.startswith("breathe-"):
        pattern_slug = slug.replace("breathe-", "")
        breathing_pattern = BREATHING_PATTERNS.get(pattern_slug)

    # Find counting lines in the alignment
    counting_phases = find_counting_in_alignment(alignment, [], lang)
    counting_phases = resolve_hold_phases(counting_phases, breathing_pattern)

    if not counting_phases:
        return AnalysisResult(
            slug=slug, lang=lang,
            mp3_path=mp3_path, alignment_path=align_path,
            error="No counting phases found in alignment",
        )

    # Group into breathing sections (phases within 5s of each other)
    sections: list[BreathingSection] = []
    current_section = BreathingSection()

    for align_idx, phase_type, expected_count, start, end in counting_phases:
        target_dur = get_target_duration(phase_type, expected_count, breathing_pattern, category)

        phase = BreathingPhase(
            phase_type=phase_type,
            expected_count=expected_count,
            target_duration=target_dur,
            line_index=align_idx,
            audio_start=start,
            audio_end=end,
            actual_duration=end - start,
        )

        # Start new section if gap > 10s from previous phase
        if current_section.phases:
            last_end = current_section.phases[-1].audio_end
            if start - last_end > 10.0:
                current_section.audio_start = current_section.phases[0].audio_start
                current_section.audio_end = current_section.phases[-1].audio_end
                sections.append(current_section)
                current_section = BreathingSection()

        current_section.phases.append(phase)

    if current_section.phases:
        current_section.audio_start = current_section.phases[0].audio_start
        current_section.audio_end = current_section.phases[-1].audio_end
        sections.append(current_section)

    # Whisper transcription for each section
    if use_whisper:
        for section in sections:
            # Transcribe the whole section at once (more efficient)
            margin = 0.5  # small margin for context
            seg_start = max(0, section.audio_start - margin)
            seg_end = section.audio_end + margin

            print(f"  Transcribing {seg_start:.1f}-{seg_end:.1f}s...", flush=True)
            words = transcribe_segment(mp3_path, seg_start, seg_end, lang)

            # Assign words to phases
            for phase in section.phases:
                phase.words = [
                    w for w in words
                    if w.start >= phase.audio_start - 0.3 and w.end <= phase.audio_end + 0.3
                ]
                _analyze_phase_counts(phase, lang)

    # Timing analysis (works without Whisper too)
    timing_issues = 0
    count_issues = 0
    for section in sections:
        for phase in section.phases:
            # Timing check
            if phase.target_duration > 0:
                drift = abs(phase.actual_duration - phase.target_duration)
                drift_pct = drift / phase.target_duration * 100
                if drift_pct > 15:  # >15% off target
                    phase.issues.append(
                        f"timing: {phase.actual_duration:.1f}s vs target {phase.target_duration:.1f}s "
                        f"({drift_pct:+.0f}%)"
                    )
                    timing_issues += 1

            count_issues += len([i for i in phase.issues if i.startswith("count:")])

    return AnalysisResult(
        slug=slug,
        lang=lang,
        mp3_path=mp3_path,
        alignment_path=align_path,
        sections=sections,
        total_phases=sum(len(s.phases) for s in sections),
        timing_issues=timing_issues,
        count_issues=count_issues,
    )


def _analyze_phase_counts(phase: BreathingPhase, lang: str) -> None:
    """Check Whisper words against expected count sequence."""
    numbers = EN_NUMBERS if lang in ("en", "en-v2") else FR_NUMBERS

    detected = []
    for w in phase.words:
        clean = re.sub(r'[.,!?;:]', '', w.word).strip().lower()
        if clean in numbers:
            detected.append((numbers[clean], w))

    phase.detected_counts = [n for n, _ in detected]

    if not detected:
        return

    # Check for doubled counts: e.g., [4, 4] when expecting [4]
    for i in range(1, len(detected)):
        curr_num, curr_word = detected[i]
        prev_num, prev_word = detected[i - 1]
        if curr_num == prev_num:
            # Same number repeated — likely a double
            gap = curr_word.start - prev_word.end
            if gap < 1.5:  # within 1.5s = probably a stutter/double
                phase.issues.append(
                    f"count: doubled '{curr_num}' at {curr_word.start:.2f}s "
                    f"(gap {gap:.2f}s from previous)"
                )

    # Check for missing counts
    if phase.phase_type != "countdown":
        expected_seq = list(range(1, phase.expected_count + 1))
        # The first count is often replaced by the phase keyword ("in" = 1)
        actual_seq = phase.detected_counts[:]
        if actual_seq and actual_seq[0] != 1:
            # Phase keyword serves as count 1
            actual_seq = [1] + actual_seq

        # Remove duplicates for sequence check
        deduped = []
        for n in actual_seq:
            if not deduped or n != deduped[-1]:
                deduped.append(n)

        if len(deduped) < len(expected_seq):
            missing = set(expected_seq) - set(deduped)
            if missing:
                phase.issues.append(
                    f"count: missing {sorted(missing)} "
                    f"(got {deduped}, expected {expected_seq})"
                )
    else:
        # Countdown: should be descending from expected_count to 1
        expected_seq = list(range(phase.expected_count, 0, -1))
        deduped = []
        for n in phase.detected_counts:
            if not deduped or n != deduped[-1]:
                deduped.append(n)
        if deduped != expected_seq[:len(deduped)]:
            phase.issues.append(
                f"count: countdown mismatch (got {deduped}, expected {expected_seq})"
            )


# ── Fixing ─────────────────────────────────────────────────────────────────

@dataclass
class AudioEdit:
    """A planned edit to the audio file."""
    edit_type: str  # "cut" or "tempo"
    start: float
    end: float
    # For tempo changes
    target_duration: Optional[float] = None
    tempo_ratio: Optional[float] = None
    # For cuts (remove a word)
    cut_start: Optional[float] = None
    cut_end: Optional[float] = None
    description: str = ""


def plan_fixes(result: AnalysisResult) -> list[AudioEdit]:
    """Plan audio edits based on analysis results."""
    edits: list[AudioEdit] = []

    for section in result.sections:
        for phase in section.phases:
            for issue in phase.issues:
                if issue.startswith("count: doubled"):
                    # Extract the doubled word's timestamp
                    match = re.search(r"at (\d+\.\d+)s", issue)
                    if match:
                        doubled_time = float(match.group(1))
                        # Find the word to cut
                        for w in phase.words:
                            if abs(w.start - doubled_time) < 0.05:
                                # Cut this word + surrounding silence
                                cut_start = max(phase.audio_start, w.start - 0.1)
                                cut_end = min(phase.audio_end, w.end + 0.1)
                                edits.append(AudioEdit(
                                    edit_type="cut",
                                    start=phase.audio_start,
                                    end=phase.audio_end,
                                    cut_start=cut_start,
                                    cut_end=cut_end,
                                    description=f"Remove doubled '{w.word}' at {w.start:.2f}s",
                                ))
                                break

                if issue.startswith("timing:"):
                    if phase.target_duration > 0 and phase.actual_duration > 0:
                        ratio = phase.actual_duration / phase.target_duration
                        if abs(ratio - 1.0) > 0.15:
                            edits.append(AudioEdit(
                                edit_type="tempo",
                                start=phase.audio_start,
                                end=phase.audio_end,
                                target_duration=phase.target_duration,
                                tempo_ratio=ratio,
                                description=(
                                    f"Adjust {phase.phase_type} "
                                    f"{phase.actual_duration:.1f}s → {phase.target_duration:.1f}s "
                                    f"(atempo={ratio:.2f})"
                                ),
                            ))

    # Sort edits by start time (reverse for safe application)
    edits.sort(key=lambda e: e.start)
    return edits


def apply_fixes(
    result: AnalysisResult,
    edits: list[AudioEdit],
    dry_run: bool = False,
) -> bool:
    """Apply planned audio edits using ffmpeg in a single pass."""
    if not edits:
        print(f"  No fixes needed for {result.slug}")
        return True

    if dry_run:
        print(f"\n  DRY RUN — {len(edits)} edits planned for {result.slug}:")
        for i, edit in enumerate(edits):
            print(f"    [{i+1}] {edit.description}")
        return True

    mp3_path = result.mp3_path
    backup_path = mp3_path.with_suffix(".mp3.bak")

    # Backup original
    if not backup_path.exists():
        shutil.copy2(mp3_path, backup_path)
        print(f"  Backed up to {backup_path.name}")

    # Single-pass approach: build one ffmpeg filter_complex that splits the
    # audio into segments (untouched gaps + tempo-adjusted phases), then
    # concatenates them all.
    #
    # For cuts, we exclude the cut region entirely.
    # For tempo, we apply atempo to just that segment.

    # Sort edits by start time
    sorted_edits = sorted(edits, key=lambda e: e.start)

    # Build segment list: alternating between untouched and edited regions
    segments: list[dict] = []  # {type: "pass"|"tempo"|"cut", start, end, ...}
    cursor = 0.0

    for edit in sorted_edits:
        # Gap before this edit (untouched audio)
        if edit.start > cursor + 0.001:
            segments.append({"type": "pass", "start": cursor, "end": edit.start})

        if edit.edit_type == "tempo" and edit.tempo_ratio:
            segments.append({
                "type": "tempo",
                "start": edit.start,
                "end": edit.end,
                "ratio": edit.tempo_ratio,
            })
            cursor = edit.end
        elif edit.edit_type == "cut" and edit.cut_start is not None and edit.cut_end is not None:
            # Keep audio before cut, skip cut region, keep audio after cut
            if edit.cut_start > edit.start + 0.001:
                segments.append({"type": "pass", "start": edit.start, "end": edit.cut_start})
            if edit.cut_end < edit.end - 0.001:
                segments.append({"type": "pass", "start": edit.cut_end, "end": edit.end})
            cursor = edit.end
        else:
            cursor = edit.end

    # Trailing untouched audio (after last edit to end of file)
    # We use a large number as "end of file" — ffmpeg handles it gracefully
    segments.append({"type": "pass", "start": cursor, "end": 99999.0})

    # Build ffmpeg filter_complex
    filter_parts = []
    labels = []

    for i, seg in enumerate(segments):
        label = f"s{i}"
        labels.append(f"[{label}]")

        if seg["type"] == "pass":
            filter_parts.append(
                f"[0:a]atrim={seg['start']:.3f}:{seg['end']:.3f},"
                f"asetpts=PTS-STARTPTS[{label}]"
            )
        elif seg["type"] == "tempo":
            atempo = _build_atempo_chain(seg["ratio"])
            filter_parts.append(
                f"[0:a]atrim={seg['start']:.3f}:{seg['end']:.3f},"
                f"asetpts=PTS-STARTPTS,{atempo}[{label}]"
            )

    # Concatenate all segments
    concat_inputs = "".join(labels)
    filter_parts.append(f"{concat_inputs}concat=n={len(labels)}:v=0:a=1")

    filter_complex = ";\n".join(filter_parts)

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        out_path = Path(tmp.name)

    try:
        cmd = [
            "ffmpeg", "-y", "-i", str(mp3_path),
            "-filter_complex", filter_complex,
            "-b:a", "128k", str(out_path),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

        if proc.returncode != 0:
            print(f"    ffmpeg FAILED: {proc.stderr[-300:]}")
            return False

        # Overwrite original with fixed version
        shutil.copy2(out_path, mp3_path)
        print(f"  Applied {len(sorted_edits)} edits in single pass")
        print(f"  Wrote fixed audio: {mp3_path}")
        return True
    except subprocess.TimeoutExpired:
        print(f"    ffmpeg timed out after 120s")
        return False
    finally:
        out_path.unlink(missing_ok=True)


def _build_atempo_chain(ratio: float) -> str:
    """
    Build atempo filter chain for ratios outside 0.5-2.0 range.
    ffmpeg atempo only supports 0.5-2.0, so chain multiple filters.
    """
    if 0.5 <= ratio <= 2.0:
        return f"atempo={ratio:.4f}"

    parts = []
    remaining = ratio
    while remaining > 2.0:
        parts.append("atempo=2.0")
        remaining /= 2.0
    while remaining < 0.5:
        parts.append("atempo=0.5")
        remaining /= 0.5
    parts.append(f"atempo={remaining:.4f}")
    return ",".join(parts)


def _apply_cut(input_path: Path, output_path: Path, edit: AudioEdit) -> bool:
    """Remove a segment from the audio with crossfade."""
    assert edit.cut_start is not None and edit.cut_end is not None

    # Use ffmpeg to concatenate before + after the cut, with crossfade
    crossfade_ms = 20
    crossfade_s = crossfade_ms / 1000.0

    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-filter_complex",
        (
            f"[0:a]atrim=0:{edit.cut_start:.3f},asetpts=PTS-STARTPTS[pre];"
            f"[0:a]atrim={edit.cut_end:.3f},asetpts=PTS-STARTPTS[post];"
            f"[pre][post]acrossfade=d={crossfade_s}:c1=tri:c2=tri"
        ),
        "-b:a", "128k", str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"    ffmpeg error: {result.stderr[:200]}")
    return result.returncode == 0


def _apply_tempo(input_path: Path, output_path: Path, edit: AudioEdit) -> bool:
    """Adjust tempo of a specific section, leaving rest untouched."""
    assert edit.tempo_ratio is not None

    atempo = _build_atempo_chain(edit.tempo_ratio)

    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-filter_complex",
        (
            f"[0:a]atrim=0:{edit.start:.3f},asetpts=PTS-STARTPTS[pre];"
            f"[0:a]atrim={edit.start:.3f}:{edit.end:.3f},asetpts=PTS-STARTPTS,"
            f"{atempo}[mid];"
            f"[0:a]atrim={edit.end:.3f},asetpts=PTS-STARTPTS[post];"
            f"[pre][mid][post]concat=n=3:v=0:a=1"
        ),
        "-b:a", "128k", str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"    ffmpeg error: {result.stderr[:200]}")
    return result.returncode == 0


# ── Post-processing ───────────────────────────────────────────────────────

def fix_mp3_headers(mp3_path: Path) -> None:
    """Run fix-mp3-headers.py on the directory containing the MP3."""
    header_script = SCRIPT_DIR / "fix-mp3-headers.py"
    if header_script.exists():
        subprocess.run(
            ["python3", str(header_script), str(mp3_path.parent)],
            capture_output=True,
        )
        print(f"  Fixed Xing headers in {mp3_path.parent.name}/")


def rebuild_alignment(slug: str, lang: str) -> None:
    """Run rebuild-alignment.ts for the meditation."""
    rebuild_script = SCRIPT_DIR / "rebuild-alignment.ts"
    if not rebuild_script.exists():
        print(f"  WARNING: rebuild-alignment.ts not found")
        return

    cmd = [
        "npx", "tsx", str(rebuild_script),
        slug,
        f"--lang={'en' if lang == 'en-v2' else lang}",
    ]
    if lang == "en-v2":
        cmd.append("--dir=en-v2")

    result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(PROJECT_ROOT))
    if result.returncode == 0:
        print(f"  Rebuilt alignment for {slug} ({lang})")
    else:
        print(f"  WARNING: Alignment rebuild failed: {result.stderr[:200]}")


def validate_fix(slug: str, lang: str) -> bool:
    """Re-analyze after fix to verify improvements."""
    print(f"\n  Validating fix for {slug}...")
    result = analyze_meditation(slug, lang, use_whisper=True)
    if result.error:
        print(f"    Validation error: {result.error}")
        return False

    total_issues = result.timing_issues + result.count_issues
    if total_issues == 0:
        print(f"    PASS: No issues found after fix")
        return True
    else:
        print(f"    WARN: {total_issues} issues remain ({result.timing_issues} timing, {result.count_issues} count)")
        for section in result.sections:
            for phase in section.phases:
                for issue in phase.issues:
                    print(f"      - {phase.phase_type}: {issue}")
        return False


# ── Reporting ──────────────────────────────────────────────────────────────

def print_analysis(result: AnalysisResult) -> None:
    """Print analysis results in a readable format."""
    if result.error:
        print(f"\n  {result.slug} ({result.lang}): {result.error}")
        return

    status = "OK" if (result.timing_issues + result.count_issues) == 0 else "ISSUES"
    print(f"\n  {result.slug} ({result.lang}): {result.total_phases} phases — {status}")

    for si, section in enumerate(result.sections):
        print(f"    Section {si+1}: {section.audio_start:.1f}s - {section.audio_end:.1f}s "
              f"({len(section.phases)} phases)")

        for phase in section.phases:
            marker = " !" if phase.issues else "  "
            timing = ""
            if phase.target_duration > 0:
                drift = phase.actual_duration - phase.target_duration
                timing = f" ({phase.actual_duration:.1f}s, target {phase.target_duration:.1f}s, {drift:+.1f}s)"
            else:
                timing = f" ({phase.actual_duration:.1f}s)"

            counts_str = ""
            if phase.detected_counts:
                counts_str = f" counts={phase.detected_counts}"

            print(f"   {marker} {phase.phase_type}[{phase.expected_count}]{timing}{counts_str}")

            for issue in phase.issues:
                print(f"        → {issue}")

    print(f"    Summary: {result.timing_issues} timing issues, {result.count_issues} count issues")


# ── CLI ────────────────────────────────────────────────────────────────────

def get_all_meditation_slugs() -> list[str]:
    """Get all meditation slugs from content directory."""
    return sorted(
        f.stem for f in CONTENT_DIR.glob("*.json")
    )


def get_slugs_with_counting(lang: str) -> list[str]:
    """Get meditation slugs that have counting in their scripts."""
    slugs = []
    for slug in get_all_meditation_slugs():
        med = load_meditation(slug)
        if not med:
            continue
        script_key = "scriptFr" if lang == "fr" else "scriptEn"
        script = med.get(script_key, "")
        if not script:
            continue

        counting = parse_counting_lines(script, lang)
        if counting:
            slugs.append(slug)
    return slugs


def main() -> None:
    load_breathing_patterns()

    parser = argparse.ArgumentParser(
        description="Fix breathing timing in Vesper meditation audio"
    )
    parser.add_argument("command", choices=["analyze", "fix"],
                        help="analyze: report issues; fix: apply corrections")
    parser.add_argument("slug", nargs="?", help="Meditation slug (or --all)")
    parser.add_argument("--all", action="store_true", help="Process all meditations")
    parser.add_argument("--lang", default="en", help="Language: en, en-v2, fr")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview fixes without applying")
    parser.add_argument("--no-whisper", action="store_true",
                        help="Skip Whisper transcription (timing analysis only)")
    parser.add_argument("--no-validate", action="store_true",
                        help="Skip post-fix validation")
    args = parser.parse_args()

    if not args.slug and not args.all:
        parser.error("Provide a slug or --all")

    use_whisper = not args.no_whisper

    # Determine which slugs to process
    if args.all:
        slugs = get_slugs_with_counting(args.lang)
        print(f"Found {len(slugs)} meditations with counting ({args.lang})")
    else:
        slugs = [args.slug]

    if args.command == "analyze":
        total_timing = 0
        total_count = 0
        total_phases = 0

        for slug in slugs:
            print(f"\nAnalyzing {slug}...", flush=True)
            result = analyze_meditation(slug, args.lang, use_whisper=use_whisper)
            print_analysis(result)
            total_timing += result.timing_issues
            total_count += result.count_issues
            total_phases += result.total_phases

        if len(slugs) > 1:
            print(f"\n{'='*60}")
            print(f"TOTAL: {len(slugs)} meditations, {total_phases} phases")
            print(f"  Timing issues: {total_timing}")
            print(f"  Count issues: {total_count}")

    elif args.command == "fix":
        fixed = 0
        failed = 0

        for slug in slugs:
            print(f"\n{'='*60}")
            print(f"Processing {slug} ({args.lang})...", flush=True)

            # Analyze
            result = analyze_meditation(slug, args.lang, use_whisper=use_whisper)
            if result.error:
                print(f"  Skip: {result.error}")
                continue

            if result.timing_issues + result.count_issues == 0:
                print(f"  No issues found — skipping")
                continue

            print_analysis(result)

            # Plan fixes
            edits = plan_fixes(result)
            if not edits:
                print(f"  No actionable fixes planned")
                continue

            # Apply
            success = apply_fixes(result, edits, dry_run=args.dry_run)
            if not success:
                failed += 1
                continue

            if args.dry_run:
                continue

            # Post-process
            fix_mp3_headers(result.mp3_path)
            rebuild_alignment(slug, args.lang)

            # Validate
            if not args.no_validate:
                validate_fix(slug, args.lang)

            fixed += 1

        if len(slugs) > 1:
            print(f"\n{'='*60}")
            status = "DRY RUN" if args.dry_run else "DONE"
            print(f"{status}: {fixed} fixed, {failed} failed, "
                  f"{len(slugs) - fixed - failed} skipped")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Records every fixed Polish text in the course with Piper, a free neural voice that runs locally.

    pip install piper-tts lameenc
    npm run voice

Only texts without a recording are generated, so after a content change this takes seconds. Recordings
of texts no longer in the course are deleted. Files go to public/voice/<VOICE>/<id>.mp3, where the id is
a hash of the text (see audioId in src/app/lib/speech.ts), and public/voice-index.json lists them.

Changing the voice or its settings: bump VOICE, which starts a fresh folder (browsers cache recordings
forever, so a file's content must never change under the same name).
"""

import io
import json
import shutil
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path

import lameenc
from piper import PiperVoice, SynthesisConfig

# Voices and settings: https://huggingface.co/rhasspy/piper-voices (CC0 datasets). The main voice (a man's) reads
# everything; the second (a woman's) reads the texts src/app/lib/voices.ts gives it: women's lines, a woman's
# first-person forms and half of the listening practice.
MODEL = 'pl_PL-mc_speech-medium'
MODEL_URL = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/pl/pl_PL/mc_speech/medium/'
VOICE = 'mc-speech-2'
FEMALE_MODEL = 'pl_PL-gosia-medium'
FEMALE_MODEL_URL = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/pl/pl_PL/gosia/medium/'
FEMALE_VOICE = 'gosia-1'
# Slightly slower than natural: these are learners.
SYNTH = SynthesisConfig(length_scale=1.08)
BITRATE = 40  # kbit/s, mono: clear speech at about 5 KB a second
# Silence before the first sound. Piper starts a word like "szkoła" at full volume on its first sample, and
# browsers and audio devices often swallow the first moments of playback, which left "szkoła" as "koła".
LEAD_IN = 0.15  # seconds

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'voice'
INDEX = ROOT / 'public' / 'voice-index.json'
CACHE = Path.home() / '.cache' / 'wycinanka-voice'


def model_path(model: str = MODEL, url: str = MODEL_URL) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    for ext in ('.onnx', '.onnx.json'):
        f = CACHE / f'{model}{ext}'
        if not f.exists():
            print(f'Downloading {f.name}…', flush=True)
            urllib.request.urlretrieve(url + f.name, f)
    return CACHE / f'{model}.onnx'


def texts() -> list[dict]:
    out = subprocess.run(['npx', 'tsx', 'scripts/spoken-list.ts'], cwd=ROOT, check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


def lead_in(pcm: bytes, rate: int) -> bytes:
    """Pads 16-bit mono audio so at least LEAD_IN seconds of silence come before the first sound."""
    samples = memoryview(pcm).cast('h')
    quiet = next((i for i, s in enumerate(samples) if abs(s) > 500), len(samples))
    pad = max(0, int(LEAD_IN * rate) - quiet)
    return bytes(2 * pad) + pcm


def mp3(voice: PiperVoice, text: str) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        voice.synthesize_wav(text, w, syn_config=SYNTH)
    buf.seek(0)
    with wave.open(buf, 'rb') as w:
        rate, pcm = w.getframerate(), w.readframes(w.getnframes())
    pcm = lead_in(pcm, rate)
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def record(folder: Path, items: list[dict], model: str, url: str) -> tuple[int, int]:
    """Records the texts missing from a voice's folder and deletes ones no longer needed. Returns (new, removed)."""
    ids = {i['id'] for i in items}
    folder.mkdir(parents=True, exist_ok=True)
    removed = 0
    for f in folder.glob('*.mp3'):
        if f.stem not in ids:
            f.unlink()
            removed += 1
    todo = [i for i in items if not (folder / f"{i['id']}.mp3").exists()]
    if todo:
        voice = PiperVoice.load(model_path(model, url))
        for n, i in enumerate(todo, 1):
            (folder / f"{i['id']}.mp3").write_bytes(mp3(voice, i['text']))
            if n % 100 == 0 or n == len(todo):
                print(f'{folder.name}: {n}/{len(todo)}', flush=True)
    return len(todo), removed


def main() -> None:
    items = texts()
    ids = {i['id'] for i in items}
    if len(ids) != len(items):
        sys.exit('Two texts share a recording id: change audioId.')
    female = [i for i in items if i.get('female')]
    # Voices and settings no longer used.
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.iterdir():
        if old.is_dir() and old.name not in (VOICE, FEMALE_VOICE):
            shutil.rmtree(old)
    new, removed = record(OUT / VOICE, items, MODEL, MODEL_URL)
    new_f, removed_f = record(OUT / FEMALE_VOICE, female, FEMALE_MODEL, FEMALE_MODEL_URL)
    INDEX.write_text(
        json.dumps(
            {'voice': VOICE, 'ids': sorted(ids), 'female': {'voice': FEMALE_VOICE, 'ids': sorted(i['id'] for i in female)}},
            separators=(',', ':'),
        )
        + '\n'
    )
    size = sum(f.stat().st_size for f in OUT.glob('*/*.mp3'))
    print(f'{len(ids)} + {len(female)} recordings ({new} + {new_f} new, {removed + removed_f} removed), {size / 1e6:.1f} MB')


if __name__ == '__main__':
    main()

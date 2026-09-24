/** Prints every fixed Polish text the app speaks, with its recording's file id, as JSON for scripts/voice.py. */
import { spokenTexts } from '../src/app/lib/spoken';
import { audioId } from '../src/app/lib/speech';

process.stdout.write(JSON.stringify(spokenTexts().map((text) => ({ id: audioId(text), text }))));

/** Prints every fixed Polish text the app speaks, with its recording's file id and whether the second voice records it too, as JSON for scripts/voice.py. */
import { femaleTexts, spokenTexts } from '../src/app/lib/spoken';
import { audioId } from '../src/app/lib/speech';

const female = new Set(femaleTexts());
process.stdout.write(JSON.stringify(spokenTexts().map((text) => ({ id: audioId(text), text, female: female.has(text) }))));

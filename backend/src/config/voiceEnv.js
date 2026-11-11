import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// El .env raíz también contiene puertos de Docker; aquí solo cargamos ElevenLabs.
try {
  const variables = parseEnv(readFileSync(new URL('../../../.env', import.meta.url), 'utf8'));
  for (const name of ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ELEVENLABS_MODEL_ID']) {
    if (process.env[name] === undefined && variables[name] !== undefined) {
      process.env[name] = variables[name];
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

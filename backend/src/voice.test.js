import test from 'node:test';
import assert from 'node:assert/strict';
import { getVoiceConfig, synthesizeVoice } from './controllers/voiceController.js';

function response() {
  return {
    statusCode: 200,
    set() {
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    type(value) {
      this.contentType = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

test('ElevenLabs: configuración privada, validación, audio y fallos del proveedor', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.match(url, /text-to-speech\/cloned-voice\?output_format=/);
    assert.equal(options.headers['xi-api-key'], 'test-secret');
    assert.deepEqual(JSON.parse(options.body), {
      text: 'Hola',
      model_id: 'eleven_multilingual_v2',
    });
    return new Response(Buffer.from([1, 2, 3]), { headers: { 'Content-Type': 'audio/mpeg' } });
  });
  const names = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ELEVENLABS_MODEL_ID'];
  const previous = names.map((name) => process.env[name]);
  try {
    names.forEach((name) => delete process.env[name]);
    const unavailable = response();
    getVoiceConfig({}, unavailable);
    assert.deepEqual(unavailable.body, { available: false });
    const missing = response();
    await synthesizeVoice({ body: { text: 'Hola' } }, missing);
    assert.equal(missing.statusCode, 503);
    process.env.ELEVENLABS_API_KEY = 'test-secret';
    process.env.ELEVENLABS_VOICE_ID = 'cloned-voice';
    const config = response();
    getVoiceConfig({}, config);
    assert.deepEqual(config.body, { available: true });
    for (const text of [null, '', '   ', 12, 'a'.repeat(5001)]) {
      const invalid = response();
      await synthesizeVoice({ body: { text } }, invalid);
      assert.equal(invalid.statusCode, 422);
    }
    assert.equal(globalThis.fetch.mock.callCount(), 0);
    const audio = response();
    await synthesizeVoice({ body: { text: ' Hola ' } }, audio);
    assert.equal(audio.contentType, 'audio/mpeg');
    assert.deepEqual(audio.body, Buffer.from([1, 2, 3]));
    globalThis.fetch.mock.mockImplementation(
      async () => new Response('private-provider-detail', { status: 401 }),
    );
    const rejected = response();
    await synthesizeVoice({ body: { text: 'Hola' } }, rejected);
    assert.equal(rejected.statusCode, 502);
    assert.doesNotMatch(JSON.stringify(rejected.body), /private-provider-detail|test-secret/);
    globalThis.fetch.mock.mockImplementation(async () => {
      throw new Error('network');
    });
    const offline = response();
    await synthesizeVoice({ body: { text: 'Hola' } }, offline);
    assert.equal(offline.statusCode, 502);
  } finally {
    names.forEach((name, index) => {
      if (previous[index] === undefined) delete process.env[name];
      else process.env[name] = previous[index];
    });
  }
});

function voiceConfig() {
  return {
    apiKey: process.env.ELEVENLABS_API_KEY?.trim(),
    voiceId: process.env.ELEVENLABS_VOICE_ID?.trim(),
    modelId: process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2',
  };
}

export function getVoiceConfig(_request, response) {
  const { apiKey, voiceId } = voiceConfig();
  response.set('Cache-Control', 'no-store').json({ available: Boolean(apiKey && voiceId) });
}

export async function synthesizeVoice(request, response) {
  response.set('Cache-Control', 'no-store');
  const { text } = request.body ?? {};
  if (typeof text !== 'string' || !text.trim() || text.length > 5000) {
    return response
      .status(422)
      .json({ error: 'El texto debe contener entre 1 y 5000 caracteres.' });
  }
  const { apiKey, voiceId, modelId } = voiceConfig();
  if (!apiKey || !voiceId) {
    return response.status(503).json({ error: 'La voz de ElevenLabs no está configurada.' });
  }
  try {
    const audio = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text: text.trim(), model_id: modelId }),
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!audio.ok) {
      await audio.body?.cancel();
      return response.status(502).json({
        error:
          'ElevenLabs no pudo generar la voz. Revisa la clave, el ID de voz y los créditos de tu cuenta.',
      });
    }
    return response.type('audio/mpeg').send(Buffer.from(await audio.arrayBuffer()));
  } catch {
    return response
      .status(502)
      .json({ error: 'No se pudo conectar con ElevenLabs. Intenta nuevamente.' });
  }
}

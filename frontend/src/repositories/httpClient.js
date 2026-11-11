const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function post(path, body, signal) {
  const response = await fetch(`${API}/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

export async function getVoiceConfig(signal) {
  const response = await fetch(`${API}/api/voice/config`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo consultar la voz.');
  return response.json();
}

export async function requestSpeech(text, signal) {
  const response = await fetch(`${API}/api/voice/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'No se pudo generar la voz.');
  }
  return response.blob();
}

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

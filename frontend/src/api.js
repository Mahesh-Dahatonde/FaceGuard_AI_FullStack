const API = 'http://localhost:8081/api';

async function readResponse(res) {
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json;
}

export async function post(path, data) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  return readResponse(res);
}

export async function get(path) {
  const res = await fetch(API + path);
  return readResponse(res);
}

export async function remove(path) {
  const res = await fetch(API + path, {method: 'DELETE'});
  return readResponse(res);
}

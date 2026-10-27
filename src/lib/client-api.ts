"use client";

export async function api<T = any>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !path.endsWith("/login")) window.location.href = "/admin/login";
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
  return json as T;
}

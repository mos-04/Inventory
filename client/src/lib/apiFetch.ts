// lib/apiFetch.ts
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const method = (init.method || "GET").toUpperCase();

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const hasBody =
    init.body !== undefined &&
    init.body !== null &&
    method !== "GET" &&
    method !== "HEAD";

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}

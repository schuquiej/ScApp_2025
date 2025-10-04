import { API_URL } from '../config/env';

type Options = RequestInit & { json?: unknown };

export class ApiError extends Error {
  status: number;
  payload?: any;
  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(opts.json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const res = await fetch(
    path.startsWith('http') ? path : `${API_URL}${path}`,
    {
      ...opts,
      headers,
      body: opts.json ? JSON.stringify(opts.json) : opts.body,
    }
  );

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

function safeJson(txt: string) {
  try { return JSON.parse(txt); } catch { return txt; }
}

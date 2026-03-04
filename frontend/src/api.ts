export interface Memo {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

const API_URL = import.meta.env.VITE_API_URL || "";
const BASE = `${API_URL}/api`;

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function saveAuth(auth: AuthResponse): void {
  localStorage.setItem("token", auth.token);
  localStorage.setItem("user", JSON.stringify(auth.user));
}

export function loadUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearAuth();
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

// Auth API
export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "登録に失敗しました");
  }
  return res.json();
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "ログインに失敗しました");
  }
  return res.json();
}

// Memo API
export async function fetchMemos(): Promise<Memo[]> {
  const res = await fetch(`${BASE}/memos`, { headers: authHeaders() });
  return handleResponse<Memo[]>(res);
}

export async function fetchMemo(id: number): Promise<Memo> {
  const res = await fetch(`${BASE}/memos/${id}`, { headers: authHeaders() });
  return handleResponse<Memo>(res);
}

export async function createMemo(
  title: string,
  content: string
): Promise<Memo> {
  const res = await fetch(`${BASE}/memos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, content }),
  });
  return handleResponse<Memo>(res);
}

export async function updateMemo(
  id: number,
  title: string,
  content: string
): Promise<Memo> {
  const res = await fetch(`${BASE}/memos/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ title, content }),
  });
  return handleResponse<Memo>(res);
}

export async function deleteMemo(id: number): Promise<void> {
  const res = await fetch(`${BASE}/memos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) {
    clearAuth();
    throw new UnauthorizedError();
  }
  if (!res.ok) throw new Error("Failed to delete memo");
}

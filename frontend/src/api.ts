export interface Memo {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "";
const BASE = `${API_URL}/api/memos`;

export async function fetchMemos(): Promise<Memo[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch memos");
  return res.json();
}

export async function fetchMemo(id: number): Promise<Memo> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Memo not found");
  return res.json();
}

export async function createMemo(
  title: string,
  content: string
): Promise<Memo> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to create memo");
  return res.json();
}

export async function updateMemo(
  id: number,
  title: string,
  content: string
): Promise<Memo> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to update memo");
  return res.json();
}

export async function deleteMemo(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete memo");
}

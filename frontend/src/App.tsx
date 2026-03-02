import { useEffect, useState, useCallback } from "react";
import {
  type Memo,
  fetchMemos,
  createMemo,
  updateMemo,
  deleteMemo,
} from "./api";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP");
}

export default function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selected, setSelected] = useState<Memo | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const loadMemos = useCallback(async () => {
    const data = await fetchMemos();
    setMemos(data);
  }, []);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  function handleNew() {
    setSelected(null);
    setTitle("");
    setContent("");
    setError("");
    setEditing(true);
  }

  function handleSelect(memo: Memo) {
    setSelected(memo);
    setTitle(memo.title);
    setContent(memo.content);
    setError("");
    setEditing(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    if (selected) {
      await updateMemo(selected.id, title, content);
    } else {
      await createMemo(title, content);
    }
    setEditing(false);
    setSelected(null);
    await loadMemos();
  }

  async function handleDelete() {
    if (!selected) return;
    if (!window.confirm("Are you sure you want to delete this memo?")) return;
    await deleteMemo(selected.id);
    setEditing(false);
    setSelected(null);
    await loadMemos();
  }

  function handleCancel() {
    setEditing(false);
    setSelected(null);
  }

  if (editing) {
    return (
      <div className="app">
        <header>
          <h1>
            <span className="header-link" onClick={handleCancel}>Memo App</span>
            <span className="header-separator">/</span>
            {selected ? "Edit Memo" : "New Memo"}
          </h1>
        </header>
        <div className="editor">
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="Write your memo here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="editor-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
            {selected && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Memo App</h1>
        <button className="btn btn-primary" onClick={handleNew}>
          + New Memo
        </button>
      </header>
      {memos.length === 0 ? (
        <div className="empty-state">
          <p>No memos yet.</p>
          <button className="btn btn-primary" onClick={handleNew}>
            Create your first memo
          </button>
        </div>
      ) : (
        <div className="memo-list">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="memo-card"
              onClick={() => handleSelect(memo)}
            >
              <h3>{memo.title}</h3>
              <p>{memo.content}</p>
              <div className="meta">
                Updated: {formatDate(memo.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

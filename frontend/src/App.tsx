import { useEffect, useState, useCallback, useRef } from "react";
import {
  type Memo,
  type AuthUser,
  UnauthorizedError,
  fetchMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  login,
  register,
  saveAuth,
  loadUser,
  clearAuth,
} from "./api";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [memos, setMemos] = useState<Memo[]>([]);
  const [selected, setSelected] = useState<Memo | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [booting, setBooting] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const loadMemos = useCallback(async () => {
    const data = await fetchMemos();
    setMemos(data);
  }, []);

  useEffect(() => {
    if (!user) {
      setBooting(false);
      return;
    }

    let cancelled = false;

    async function init() {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      while (!cancelled) {
        try {
          await loadMemos();
          break;
        } catch (err) {
          if (err instanceof UnauthorizedError) {
            clearAuth();
            setUser(null);
            break;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      if (!cancelled) {
        clearInterval(timerRef.current);
        setBooting(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
  }, [user, loadMemos]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const authFn = authMode === "login" ? login : register;
      const result = await authFn(authEmail, authPassword);
      saveAuth(result);
      setUser(result.user);
      setAuthEmail("");
      setAuthPassword("");
      setBooting(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    setUser(null);
    setMemos([]);
    setEditing(false);
    setSelected(null);
  }

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
      setError("タイトルを入力してください");
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
    if (!window.confirm("このメモを削除しますか？")) return;
    await deleteMemo(selected.id);
    setEditing(false);
    setSelected(null);
    await loadMemos();
  }

  function handleCancel() {
    setEditing(false);
    setSelected(null);
  }

  // Auth screen
  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <span className="header-icon">📝</span>
              <h1>Memo App</h1>
            </div>
            <h2 className="auth-title">
              {authMode === "login" ? "ログイン" : "アカウント登録"}
            </h2>
            <form onSubmit={handleAuth}>
              {authError && <div className="error-message">{authError}</div>}
              <input
                type="email"
                placeholder="メールアドレス"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                autoFocus
              />
              <input
                type="password"
                placeholder="パスワード（6文字以上）"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                className="btn btn-primary auth-submit"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "処理中..."
                  : authMode === "login"
                  ? "ログイン"
                  : "登録"}
              </button>
            </form>
            <p className="auth-switch">
              {authMode === "login" ? (
                <>
                  アカウントをお持ちでないですか？{" "}
                  <span
                    className="auth-switch-link"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                  >
                    新規登録
                  </span>
                </>
              ) : (
                <>
                  既にアカウントをお持ちですか？{" "}
                  <span
                    className="auth-switch-link"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                  >
                    ログイン
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Boot screen
  if (booting) {
    return (
      <div className="app">
        <div className="boot-screen">
          <div className="boot-spinner" />
          <h2>サーバーを起動しています...</h2>
          <p className="boot-sub">
            無料プランのため初回アクセス時に時間がかかります
          </p>
          <div className="boot-elapsed">{elapsed} 秒経過</div>
          {elapsed >= 10 && (
            <p className="boot-hint">まもなく完了します。しばらくお待ちください。</p>
          )}
        </div>
      </div>
    );
  }

  // Editor screen
  if (editing) {
    return (
      <div className="app">
        <header>
          <h1>
            <span className="header-link" onClick={handleCancel}>
              <span className="header-icon">📝</span>Memo App
            </span>
            <span className="header-separator">/</span>
            <span className="header-mode">
              {selected ? "編集" : "新規作成"}
            </span>
          </h1>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </header>
        <div className="editor">
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="メモを入力..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="editor-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              💾 保存
            </button>
            {selected && (
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑 削除
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleCancel}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Memo list screen
  return (
    <div className="app">
      <header>
        <h1>
          <span className="header-icon">📝</span>Memo App
        </h1>
        <div className="header-right">
          <button className="btn btn-primary" onClick={handleNew}>
            ＋ 新規メモ
          </button>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </div>
      </header>
      {memos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>メモはまだありません</p>
          <button className="btn btn-primary" onClick={handleNew}>
            ＋ 最初のメモを作成
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
              <div className="meta">🕐 {formatDate(memo.updatedAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

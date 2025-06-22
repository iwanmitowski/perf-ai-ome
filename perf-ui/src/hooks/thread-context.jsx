import React from "react";

const ThreadContext = React.createContext(null);

export function ThreadProvider({ children }) {
  const [threadId, setThreadIdState] = React.useState(
    () => localStorage.getItem("threadId") ?? ""
  );
  const [threads, setThreads] = React.useState([]);

  const setThreadId = React.useCallback((id) => {
    setThreadIdState(id);
    if (id) {
      localStorage.setItem("threadId", id);
    } else {
      localStorage.removeItem("threadId");
    }
  }, []);

  const loadThreads = React.useCallback(() => {
    fetch("http://localhost:8088/threads?user_id=user-666")
      .then((r) => r.json())
      .then(setThreads)
      .catch((e) => console.error(e));
  }, []);

  React.useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const value = React.useMemo(
    () => ({ threadId, setThreadId, threads, loadThreads }),
    [threadId, setThreadId, threads, loadThreads]
  );

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const ctx = React.useContext(ThreadContext);
  if (!ctx) {
    throw new Error("useThreads must be used within ThreadProvider");
  }
  return ctx;
}

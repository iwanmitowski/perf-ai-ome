import React from "react";

const ThreadContext = React.createContext(null);

async function apiFetchThreads({ page = 1, searchQuery = "" }) {
  const limit = 2;
  const params = new URLSearchParams({
    page: page,
    limit: String(limit),
    q: searchQuery,
    user_id: "user-666",
  });
  const res = await fetch(`http://localhost:8088/threads?${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch threads");
  }
  return res.json();
}

export function ThreadProvider({ children }) {
  const [threadId, setThreadIdState] = React.useState(
    () => localStorage.getItem("threadId") ?? ""
  );

  const [threads, setThreads] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [currentQuery, setCurrentQuery] = React.useState("");

  const setThreadId = React.useCallback((id) => {
    setThreadIdState(id);
    if (id) {
      localStorage.setItem("threadId", id);
    } else {
      localStorage.removeItem("threadId");
    }
  }, []);

  const loadThreads = React.useCallback(
    async ({ isNewSearch = false, searchQuery = currentQuery } = {}) => {
      if (loading || (!isNewSearch && !hasMore)) {
        return;
      }

      setLoading(true);

      const pageToFetch = isNewSearch ? 1 : page;

      if (isNewSearch) {
        setThreads([]);
        setPage(1);
        setCurrentQuery(searchQuery);
      }

      try {
        const data = await apiFetchThreads({
          page: pageToFetch,
          searchQuery,
        });

        setThreads((prevThreads) =>
          isNewSearch ? data.threads : [...prevThreads, ...data.threads]
        );
        setHasMore(data.hasMore);
        setPage(pageToFetch + 1);
      } catch (e) {
        console.error("Error loading threads:", e);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, page, currentQuery]
  );

  React.useEffect(() => {
    loadThreads({ isNewSearch: true });
  }, []);

  const value = React.useMemo(
    () => ({
      threadId,
      setThreadId,
      threads,
      loadThreads,
      loading,
      hasMore,
      currentQuery,
    }),
    [
      threadId,
      setThreadId,
      threads,
      loadThreads,
      loading,
      hasMore,
      currentQuery,
    ]
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

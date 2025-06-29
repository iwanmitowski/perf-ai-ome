import React from "react";

const FeedContext = React.createContext(null);

async function apiFetchFeed({ page = 1, searchQuery = "" }) {
  const limit = 3;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    q: searchQuery,
  });
  // NOTE: Using a real placeholder API for demonstration if localhost isn't running
  // const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`);
  const res = await fetch(`http://localhost:8088/feed?${params}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

async function apiGenerateMoreFeedItems() {
  console.log("GENERATING...");
  await fetch(`http://localhost:8088/feed/generate`, { method: "POST" });
}

export function FeedProvider({ children }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [currentQuery, setCurrentQuery] = React.useState("");

  const loadFeed = React.useCallback(
    async ({ isNewSearch = false, searchQuery = "" } = {}) => {
      if (loading || (!isNewSearch && !hasMore)) {
        return;
      }

      setLoading(true);

      const pageToFetch = isNewSearch ? 1 : page;
      const queryToFetch = isNewSearch ? searchQuery : currentQuery;

      if (isNewSearch) {
        setItems([]);
        setPage(1);
        setCurrentQuery(searchQuery);
      }

      try {
        const data = await apiFetchFeed({
          page: pageToFetch,
          searchQuery: queryToFetch,
        });

        setItems((prev) =>
          isNewSearch ? data.items : [...prev, ...data.items]
        );
        setHasMore(data.hasMore);
        setPage((prevPage) => (isNewSearch ? 2 : prevPage + 1));
      } catch (e) {
        console.error("Error loading feed:", e);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, page, currentQuery]
  );

  React.useEffect(() => {
    loadFeed({ isNewSearch: true });
  }, []);

  const value = React.useMemo(
    () => ({
      items,
      loadFeed,
      loading,
      hasMore,
      generate: apiGenerateMoreFeedItems,
    }),
    [items, loadFeed, loading, hasMore]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const ctx = React.useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}

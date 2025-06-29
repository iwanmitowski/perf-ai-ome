import { useFeed } from "@/hooks/feed-context";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { FeedCard, FeedCardSkeleton } from "@/components/FeedCard";

export function FeedPage() {
  const { items, loadFeed, loading, hasMore, generate } = useFeed();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [didGenerate, setDidGenerate] = useState(false);

  const observer = useRef(null);
  const lastItemElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) {
          return;
        }

        if (debouncedSearchQuery) {
          return;
        }

        if (hasMore) {
          loadFeed();
        } else if (!didGenerate) {
          generate();
          setDidGenerate(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadFeed, generate, debouncedSearchQuery, didGenerate]
  );

  useEffect(() => {
    setDidGenerate(false); // Reset generation flag on new search
    loadFeed({ isNewSearch: true, searchQuery: debouncedSearchQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Scent Feed</h1>
      <p className="text-muted-foreground mb-8">
        Your daily dose of fragrance news, stories, and deep dives, powered by
        AI.
      </p>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for a scent, note, or brand..."
          className="pl-10 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {items.map((item, index) => (
          <div
            ref={items.length === index + 1 ? lastItemElementRef : null}
            key={item.id}
          >
            <FeedCard item={item} />
          </div>
        ))}

        {loading && (
          <>
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </>
        )}

        {!loading && !hasMore && didGenerate && !debouncedSearchQuery && (
          <div className="text-center text-muted-foreground py-10">
            <p className="font-semibold">You've reached the end for now.</p>
            <p>Check back soon!</p>
          </div>
        )}

        {!loading && !hasMore && debouncedSearchQuery && (
          <div className="text-center text-muted-foreground py-10">
            <p className="font-semibold">End of search results.</p>
          </div>
        )}
      </div>
    </div>
  );
}

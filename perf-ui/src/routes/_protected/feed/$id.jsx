import FeedDetailPage from "@/components/feed/FeedDetailPage";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_protected/feed/$id")({
  loader: async ({ params }) => {
    const res = await fetch(`http://localhost:8088/feed/${params.id}`);
    if (!res.ok) {
      throw new Response("Item not found", { status: res.status });
    }
    const json = await res.json();
    return json;
  },
  component: FeedDetailPage,
  pendingComponent: () => (
    <div className="container mx-auto max-w-2xl py-8">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="aspect-[16/10] w-full mb-4" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
  errorComponent: () => <p className="text-center py-10">Item not found</p>,
});

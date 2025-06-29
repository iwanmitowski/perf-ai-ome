import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FeedPage } from "@/components/feed/FeedPage";

export const Route = createFileRoute("/feed/")({
  component: FeedLayout,
});

function FeedLayout() {
  return (
    <>
      <FeedPage />
      <Outlet />
    </>
  );
}

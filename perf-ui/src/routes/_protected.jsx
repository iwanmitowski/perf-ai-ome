import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    const { isLoading, isAuthenticated } = context.auth;

    if (isLoading) {
      throw new Promise(() => {});
    }

    if (!isAuthenticated) {
      throw redirect({ to: "/perf-ai-ome" });
    }
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import PerfAIomeLanding from "@/components/landing/PerfAIomeLanding";

export const Route = createFileRoute("/perf-ai-ome")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: PerfAIomeLanding,
});

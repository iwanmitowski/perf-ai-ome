import { createFileRoute } from "@tanstack/react-router";
import PerfAIomeLanding from "@/components/landing/PerfAIomeLanding";

export const Route = createFileRoute("/perf-ai-ome")({
  component: PerfAIomeLanding,
});

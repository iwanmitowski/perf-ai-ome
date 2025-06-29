import App from "@/App";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/")({
  component: Index,
});

function Index() {
  return <App />;
}

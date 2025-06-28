import App from "@/App";
import { ChatProvider } from "@/hooks/chat-context";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <App />;
}

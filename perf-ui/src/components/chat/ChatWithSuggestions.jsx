import { useChat } from "ai/react";
import { Chat } from "@/components/ui/chat";

export function ChatWithSuggestions() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  } = useChat({
    api: "http://localhost:8088",

    fetch: async (url, options) => {
      // userTypedText === whatever is currently in the input box
      console.log("messages array:", messages);
      const body = JSON.parse(options.body);
      const last = body.messages?.[body.messages.length - 1];
      const message = last?.content ?? "";
      return fetch("http://localhost:8088/agentic-rag-alfa/stream", {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          model: "gpt-4o",
          thread_id: localStorage.getItem("threadId") ?? crypto.randomUUID(),
          stream_tokens: true,
        }),
      });
    },
    streamMode: "sse",
    // Tell useChat that the response is SSE (“data:” frames)
    streamProtocol: "data",
  });

  return (
    <Chat
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isLoading}
      stop={stop}
      append={append}
      suggestions={[
        "Generate a tasty vegan lasagna recipe for 3 people.",
        "Generate a list of 5 questions for a frontend job interview.",
        "Who won the 2022 FIFA World Cup?",
      ]}
    />
  );
}

import { Chat } from "@/components/ui/chat";

import { useSSEChat } from "@/hooks/use-sse-chat";

export function ChatWithSuggestions() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  } = useSSEChat();

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

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
        "I'm feeling happy today, suggest me 2 fresh fragrances.",
        "I'm attending a wedding, suggest me a scent.",
        "What are the top 3 trending perfumes right now?",
      ]}
    />
  );
}

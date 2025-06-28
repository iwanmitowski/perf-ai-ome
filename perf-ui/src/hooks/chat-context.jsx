import React, { createContext } from "react";
import { useSSEChat } from "@/hooks/use-sse-chat";

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const chat = useSSEChat();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

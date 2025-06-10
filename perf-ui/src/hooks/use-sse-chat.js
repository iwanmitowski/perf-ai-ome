import { useAuth0 } from "@auth0/auth0-react";
import { useState, useRef } from "react";

export function useSSEChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth0();
  console.log("user", user);
  const abortRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const stop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const sendMessage = async (text) => {
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);

    const threadId = localStorage.getItem("threadId") ?? crypto.randomUUID();
    localStorage.setItem("threadId", threadId);

    abortRef.current = new AbortController();
    setIsLoading(true);
    let assistant = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistant]);

    try {
      const res = await fetch("http://localhost:8088/agentic-rag-alfa/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: "gpt-4o",
          thread_id: threadId,
          stream_tokens: true,
          user_id: "user-123",
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to connect to stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // 4) Read and process only `token` events
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);

          if (!chunk.startsWith("data:")) continue;
          const data = chunk.slice(5).trim();
          if (data === "[DONE]") {
            // End of stream
            reader.cancel();
            return;
          }

          let obj;
          try {
            obj = JSON.parse(data);
          } catch {
            continue;
          }

          if (obj.type !== "token") {
            // ignore everything except tokens
            continue;
          }

          // 5) Append the token to assistant and update state
          assistant = {
            ...assistant,
            content: assistant.content + obj.content,
          };
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = assistant;
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const append = async (message) => {
    await sendMessage(message.content);
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  };
}

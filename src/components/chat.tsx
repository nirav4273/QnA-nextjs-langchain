"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId }),
      });
      const data = await res.json();
      const answer = res.ok
        ? String(data.answer)
        : (data.error ?? "Something went wrong.");
      if (res.ok && typeof data.sessionId === "string") {
        setSessionId(data.sessionId);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to reach the server." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between border-b pb-3">
        <h1 className="text-lg font-semibold tracking-tight">Groq Chat</h1>
        {sessionId && (
          <span className="text-xs text-muted-foreground">
            Session active
          </span>
        )}
      </header>

      <ScrollArea className="min-h-0 flex-1 rounded-lg border">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask anything to get started.
            </p>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                message.role === "user"
                  ? "self-end whitespace-pre-wrap bg-primary text-primary-foreground"
                  : "self-start bg-muted text-foreground"
              )}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-pre:bg-background/80 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-1 self-start rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          autoFocus
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

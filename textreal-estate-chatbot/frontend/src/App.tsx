import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Loader2, Moon, Send, Sparkles, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { ChatMessage } from "./components/ChatMessage";
import { FileUpload } from "./components/FileUpload";
import { ThemeProvider, useTheme } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import type { AnalysisResponse, ConversationMessage } from "./types/chat";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);

const TypingIndicator = () => (
  <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
    <span className="inline-flex gap-1">
      <span className="h-2 w-2 animate-pulse-dots rounded-full bg-primary" />
      <span className="h-2 w-2 animate-pulse-dots rounded-full bg-primary delay-150" />
      <span className="h-2 w-2 animate-pulse-dots rounded-full bg-primary delay-300" />
    </span>
    Crunching the freshest Pune market intelligence…
  </div>
);

const ThemeAwareApp = () => {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { theme, toggleTheme } = useTheme();

  const quickPrompts = useMemo(
    () => [
      "Compare Wakad vs Baner absorption last 2 years",
      "Show price trend for Akurdi since 2020",
      "Where is office supply heating up in 2024?",
    ],
    []
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const pushMessage = (message: ConversationMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!query.trim()) {
      return;
    }

    const formattedQuery = query.trim();
    const userMessage: ConversationMessage = {
      id: createId(),
      role: "user",
      content: formattedQuery,
      createdAt: new Date().toISOString(),
    };
    pushMessage(userMessage);

    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("query", formattedQuery);
      if (file) {
        payload.append("file", file);
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze/`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("The analysis service is temporarily unavailable.");
      }

      const data: AnalysisResponse = await response.json();
      const assistantMessage: ConversationMessage = {
        id: createId(),
        role: "assistant",
        content: `Here’s the insight pack for **${formattedQuery}**.`,
        response: data,
        createdAt: new Date().toISOString(),
      };
      pushMessage(assistantMessage);
      setFile(null);
    } catch (error) {
      const assistantMessage: ConversationMessage = {
        id: createId(),
        role: "assistant",
        content: `⚠️ ${error instanceof Error ? error.message : "Something went wrong"} Please try again in a moment.`,
        createdAt: new Date().toISOString(),
      };
      pushMessage(assistantMessage);
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950/95 text-foreground">
      <div className="chat-background">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-6 pt-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                  <Sparkles className="h-4 w-4 text-primary" /> SigmaValue Labs
                </p>
                <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                  Mini Real Estate Analysis Chatbot
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-white/70">
                  Ask anything about Pune’s micro-markets. We parse the dataset,
                  detect geography & timeframes, and deliver polished insight
                  packs with charts and tables.
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setQuery(prompt);
                  }}
                  className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-primary/50 hover:text-primary"
                >
                  {prompt}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ))}
            </div>
          </header>

          <main className="glass relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
            <div
              ref={chatRef}
              className="flex-1 space-y-6 overflow-y-auto px-6 py-8"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center text-white/70">
                  <p className="text-xl font-semibold">
                    ⚡️ Kick off with a market question
                  </p>
                  <p className="mt-2 max-w-md text-sm">
                    Try “Compare Wakad and Baner supply in 2024” or upload your
                    own Excel snapshot to work with bespoke numbers.
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && <TypingIndicator />}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-white/10 bg-slate-950/50 p-6"
            >
              <div className="space-y-4">
                <Textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Analyse Wakad absorption vs Baner during 2021-2024..."
                  className="text-base"
                  rows={4}
                />
                <FileUpload file={file} onFileChange={setFile} />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Drop a question, attach an Excel, and we’ll do the rest.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="gap-2 rounded-2xl px-6 py-6 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Crunching numbers
                      </>
                    ) : (
                      <>
                        Send insight request
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemeAwareApp />
    </ThemeProvider>
  );
}

export default App;

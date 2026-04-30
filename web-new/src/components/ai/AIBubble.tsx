import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouterState } from "@tanstack/react-router"
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Loader2,
  ShieldAlert,
  Keyboard,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../ui/button"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function AIBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const router = useRouterState()
  const pageContext =
    router.location.pathname.replace(/^\/+/, "") || "dashboard"

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetchWithAuth("/v1/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          provider: "openai",
          messages: allMessages,
          pageContext,
        }),
      })

      const content =
        typeof response.message === "string"
          ? response.message
          : typeof response.content === "string"
            ? response.content
            : "I'm sorry, I couldn't process that request."

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorContent =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: errorContent,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, pageContext])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating bubble button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open AI assistant"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card shadow-2xl sm:w-[420px]"
              role="dialog"
              aria-label="AI chat assistant"
            >
              {/* Header */}
              <div className="flex flex-col border-b">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold leading-none text-foreground">
                        AI Assistant
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ask anything about your clinic
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Medical disclaimer */}
                <div className="flex items-start gap-2 border-y border-border bg-muted px-4 py-2.5 text-xs text-muted-foreground">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                  <span>
                    <span className="font-medium text-foreground">
                      Medical disclaimer:
                    </span>{" "}
                    This is an AI assistant, not a veterinarian. Always consult
                    a licensed professional for medical advice.
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full flex-col items-center justify-center text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      How can I help you today?
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask about patients, appointments, or general clinic
                      questions.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Keyboard className="h-3 w-3" />
                      <span>
                        Press{" "}
                        <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px]">
                          Ctrl
                        </kbd>{" "}
                        +{" "}
                        <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px]">
                          J
                        </kbd>{" "}
                        to toggle
                      </span>
                    </div>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index === messages.length - 1 ? 0.05 : 0,
                    }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[88%] items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <Bot className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                      )}
                      <span className="whitespace-pre-wrap break-words">
                        {message.content}
                      </span>
                      {message.role === "user" && (
                        <User className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex max-w-[88%] items-center gap-2.5 rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                      <Bot className="h-4 w-4 opacity-70" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t bg-card p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    disabled={isLoading}
                    className="flex min-h-[40px] max-h-[120px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

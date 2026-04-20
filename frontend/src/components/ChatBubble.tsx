import { useState, type FormEvent } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { BRAND_TEXT, PRIMARY_BUTTON_COLORS } from '../lib/ui';
import { sendChatbotMessage } from '../lib/api';

// Floating support chat:
// open/close the panel and show a ready mount point for chat integration.
type ChatBubbleProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChatBubble({ open, onOpenChange }: ChatBubbleProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    try {
      const reply = await sendChatbotMessage(text);
      const botMessages = reply.messages.length > 0 ? reply.messages : ['Thanks for your message.'];
      setMessages((prev) => [...prev, ...botMessages.map((m) => ({ role: 'bot' as const, text: m }))]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close chat"
          className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[1px] md:bg-black/10"
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <div
        className={cn(
          'fixed z-[50] flex flex-col items-end gap-3',
          'right-4 max-[767px]:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]',
          'md:bottom-6 md:right-6',
        )}
      >
        <div
          id="chatbot-panel"
          className={cn(
            'flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_12px_40px_rgba(45,122,143,0.18)] transition-all duration-200 ease-out motion-reduce:transition-none',
            open
              ? 'pointer-events-auto max-h-[min(70vh,28rem)] translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none max-h-0 -translate-y-2 scale-95 opacity-0',
          )}
          aria-hidden={!open}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-gradient-to-r from-[#e8f4f7] to-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${PRIMARY_BUTTON_COLORS} text-white shadow-sm`}>
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${BRAND_TEXT}`}>
                  MindBridge Assistant
                </p>
                <p className="text-xs text-muted-foreground">We&apos;re here to help</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Close chat panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex min-h-[12rem] flex-1 flex-col bg-gradient-to-b from-white to-[#f8fafb]">
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Start a conversation with the assistant.
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'ml-auto bg-[#2d7a8f] text-white'
                        : 'mr-auto bg-muted text-foreground'
                    )}
                  >
                    {message.text}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="border-t border-border/60 p-3 space-y-2">
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message"
                  disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="chatbot-panel"
          className={cn(
            `h-14 w-14 rounded-full border-0 ${PRIMARY_BUTTON_COLORS} text-white shadow-[0_8px_24px_rgba(45,122,143,0.35)] transition-transform`,
            'hover:scale-[1.03] active:scale-[0.98]',
            open && 'ring-2 ring-[#2d7a8f]/30 ring-offset-2',
          )}
          title={open ? 'Close chat' : 'Open chat'}
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
}

import { MessageCircle, X } from 'lucide-react';

import { Button } from './ui/button';
import { cn } from './ui/utils';

type ChatBubbleProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Floating chat launcher (bottom-right). The inner mount node is reserved for a
 * future embeddable chat plugin (iframe, web component, or SDK root).
 */
export function ChatBubble({ open, onOpenChange }: ChatBubbleProps) {
  return (
    <>
      {/* Backdrop — only when panel is open */}
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
          // Clear mobile bottom nav + safe area; desktop sits above content padding
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2d7a8f] text-white shadow-sm">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#2d7a8f]">
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

          {/* Mount point for a future chat widget / plugin */}
          <div
            id="chatbot-plugin-mount"
            className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-2 bg-gradient-to-b from-white to-[#f8fafb] px-4 py-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Chat support will appear here.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Your team can mount a plugin or embed in{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
                #chatbot-plugin-mount
              </code>
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="chatbot-panel"
          className={cn(
            'h-14 w-14 rounded-full border-0 bg-[#2d7a8f] text-white shadow-[0_8px_24px_rgba(45,122,143,0.35)] transition-transform hover:bg-[#236272]',
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

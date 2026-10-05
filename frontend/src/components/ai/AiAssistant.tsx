import { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Loader2, Sparkles, RotateCcw, ChevronDown, FolderPlus, ClipboardList } from 'lucide-react';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  action?: ActionResult;
  timestamp: Date;
}

interface ActionResult {
  type: 'project_created' | 'plan_created' | 'none';
  data?: any;
}

// ─── Suggested prompts shown when chat is empty ───────────────────────────────

const SUGGESTIONS = [
  'What is the current inventory status?',
  'Which materials are below reorder level?',
  'Create a new project for highway construction in Pune',
  'Show me the waste cost summary',
  'What are the top cost drivers in this system?',
  'Create a consumption plan for cement this month',
  'Which suppliers have the highest rating?',
  'Give me a procurement recommendation',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2);

const ActionBadge = ({ action }: { action: ActionResult }) => {
  if (action.type === 'none') return null;

  const isProject = action.type === 'project_created';
  const Icon = isProject ? FolderPlus : ClipboardList;
  const label = isProject
    ? `Project created: ${action.data?.name || action.data?.code || ''}`
    : `Plan created for period ${action.data?.period || ''}`;

  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
      <Icon size={13} className="shrink-0" />
      <span>{label}</span>
    </div>
  );
};

// Render markdown-like bold (**text**) simply
const renderContent = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const payload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post<{ message: string; action: ActionResult }>('/ai/chat', {
        messages: payload,
      });

      const data = res.data;

      const modelMsg: Message = {
        id: uid(),
        role: 'model',
        content: data?.message || 'No response received.',
        action: data?.action,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If the AI created something, refresh the relevant queries
      if (data?.action?.type === 'project_created') {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
      if (data?.action?.type === 'plan_created') {
        queryClient.invalidateQueries({ queryKey: ['consumption-plans'] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-200 ${
          open
            ? 'bg-slate-800 text-slate-300 rotate-0'
            : 'bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 hover:scale-105 shadow-amber-500/30'
        }`}
      >
        {open ? <ChevronDown size={22} /> : <Bot size={22} strokeWidth={2.5} />}
      </button>

      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/60 transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '560px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400">
              <Sparkles size={15} className="text-slate-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Con.AI Assistant</p>
              <p className="text-[10px] text-slate-500">Powered by Gemini · Live system data</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear chat"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-slate-300">
                <p className="mb-1 font-semibold text-amber-300">👋 Hello! I'm your AI assistant.</p>
                <p className="text-slate-400">I have live access to your projects, inventory, costs, and waste data. Ask me anything or let me create something for you.</p>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-left text-[11px] text-slate-400 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-amber-500 text-slate-950 font-medium'
                    : 'rounded-bl-sm border border-slate-800 bg-slate-900 text-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{renderContent(msg.content)}</p>
                {msg.action && msg.action.type !== 'none' && (
                  <ActionBadge action={msg.action} />
                )}
                <p className={`mt-1.5 text-[10px] ${msg.role === 'user' ? 'text-amber-800' : 'text-slate-600'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-800 bg-slate-900 px-4 py-3">
                <Loader2 size={13} className="animate-spin text-amber-400" />
                <span className="text-xs text-slate-500">Thinking…</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 px-3 py-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-end gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 focus-within:border-amber-500/50">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or say 'create a project…'"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none disabled:opacity-50"
              style={{ maxHeight: '80px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={13} strokeWidth={2.5} />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-700">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}

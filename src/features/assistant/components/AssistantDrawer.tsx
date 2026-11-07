"use client";

import React, { useState } from "react";
import { MessageSquareCode, X, Send, Sparkles, Bot } from "lucide-react";
import { Question } from "@/types/interview";
import { ChatMessage } from "@/services/ai/interface";
import { useLanguage } from "@/context/LanguageContext";
import { Language, getLocalizedText } from "@/lib/i18n";

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  projectContext: string;
  lang?: Language;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  question,
  projectContext,
  lang: propLang,
}) => {
  const { t, lang: ctxLang } = useLanguage();
  const activeLang = propLang || ctxLang || "tr";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = t.assistantQuickPrompts || [
    "Bana somut bir örnek verir misiniz?",
    "Bu soruda tam olarak neyi kastediyorsunuz?",
    "Bu veri projenizde nasıl kullanılacak?",
  ];

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: activeLang,
          questionTitle: getLocalizedText(question, "title", activeLang),
          questionDescription: getLocalizedText(question, "description", activeLang),
          questionHint: getLocalizedText(question, "clarificationHint", activeLang),
          userQuery: text,
          conversationHistory: messages,
          projectContext,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: t.assistantErrorDefault },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: t.assistantConnectionError },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 text-white flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <span>{t.assistantDrawerTitle}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{t.assistantDrawerSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aktif Soru Özeti */}
        <div className="p-3 bg-slate-800/40 border-b border-slate-800/60 text-xs text-slate-300">
          <span className="font-semibold text-indigo-300">
            {activeLang === "en" ? "Related Question: " : "İlgili Soru: "}
          </span>
          {getLocalizedText(question, "title", activeLang)}
        </div>

        {/* Mesaj Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.length === 0 && (
            <div className="py-6 flex flex-col items-center text-center text-slate-400 gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400/80" />
              <p className="max-w-[260px] text-xs">
                {activeLang === "en"
                  ? "If anything in this question is unclear or you need context, feel free to ask below."
                  : "Soruyu tam olarak anlayamadıysanız veya aklınıza takılan bir detay varsa aşağıdan sorabilirsiniz."}
              </p>

              {/* Hızlı Butonlar */}
              <div className="w-full flex flex-col gap-2 mt-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/60 text-slate-300 text-left transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 border border-slate-700/70 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700/70 rounded-bl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder={activeLang === "en" ? "Type your question..." : "Sorunuzu yazın..."}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all cursor-pointer"
            aria-label={activeLang === "en" ? "Send" : "Gönder"}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

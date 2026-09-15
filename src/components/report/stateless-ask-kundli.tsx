"use client";

import { ArrowUp, BrainCircuit, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import type { KundliAnswer } from "@/lib/ai/schemas";
import type { CalculatedChart } from "@/lib/astrology/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SUGGESTIONS = [
  "How is my career traditionally indicated?",
  "Explain my current Mahadasha and Antardasha.",
  "What does my 7th house indicate?",
  "Compare my current dasha with upcoming Jupiter and Saturn transits.",
];

export function StatelessAskKundli({ chart }: { chart: CalculatedChart }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<KundliAnswer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function ask(value = question) {
    const nextQuestion = value.trim();
    if (nextQuestion.length < 3 || busy) return;
    setQuestion(nextQuestion);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/stateless/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart, question: nextQuestion }),
      });
      const data = (await response.json()) as { answer?: KundliAnswer; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error ?? "Question failed.");
      setAnswer(data.answer);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gemini is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card id="ask" className="mt-6 overflow-hidden border-primary/20">
      <div className="border-b border-line bg-primary-soft/55 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-primary text-white">
            <BrainCircuit className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">Ask Your Kundli AI</h2>
              <Badge tone="positive"><ShieldCheck className="size-3" /> Chart-grounded</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Gemini receives this calculated chart for each question. Questions and answers are not saved.
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={busy}
              onClick={() => void ask(suggestion)}
              className="min-h-9 rounded-full border border-line bg-soft px-3 text-xs font-semibold text-muted transition hover:border-primary/35 hover:text-foreground disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-end gap-2 rounded-[12px] border border-line bg-soft p-2 focus-within:border-primary">
          <textarea
            rows={2}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void ask();
              }
            }}
            placeholder="Ask about a house, planet, dasha, transit or life area…"
            className="min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />
          <Button size="icon" disabled={busy || question.trim().length < 3} onClick={() => void ask()} aria-label="Ask Gemini">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </div>
        {error && <div className="mt-4 rounded-[9px] bg-danger-soft p-4 text-sm text-danger">{error}</div>}
        {answer && (
          <div className="mt-5 rounded-[10px] border border-line bg-surface p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary"><Sparkles className="size-3" /> {answer.interpretationLabel}</Badge>
              <Badge tone="neutral">{answer.confidence} confidence</Badge>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{answer.answer}</p>
            {answer.evidence.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs font-bold tracking-[.1em] text-muted uppercase">Evidence used</p>
                <ul className="mt-2 space-y-2 text-xs leading-5 text-muted">
                  {answer.evidence.map((item, index) => (
                    <li key={`${item.reference}-${index}`}>
                      <b>{item.reference}:</b> {item.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

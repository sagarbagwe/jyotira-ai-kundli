"use client";

import {
  ArrowUp,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { KundliAnswer } from "@/lib/ai/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { titleCase } from "@/lib/utils";

const SUGGESTIONS = [
  "How is my career traditionally indicated?",
  "Explain my current Mahadasha and Antardasha.",
  "What does my 7th house indicate?",
  "Compare my current dasha with upcoming Jupiter and Saturn transits.",
];

export function AskKundli({ reportId }: { reportId: string }) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<KundliAnswer | null>(null);
  const [error, setError] = useState("");

  async function ask(nextQuestion = question) {
    if (nextQuestion.trim().length < 3) return;
    setBusy(true);
    setError("");
    setQuestion(nextQuestion);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, question: nextQuestion }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Question failed.");
      setAnswer(data.answer);
    } catch (askError) {
      setError(
        askError instanceof Error
          ? askError.message
          : "AI interpretation is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card id="ask" className="overflow-hidden border-primary/20">
      <div className="border-b border-line bg-primary-soft/55 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-primary text-white">
            <BrainCircuit className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">Ask Your Kundli AI</h2>
              <Badge tone="positive">
                <ShieldCheck className="size-3" />
                Chart-grounded
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Answers use only this calculated chart. Traditional
              interpretations are labeled and uncertain timing is never stated
              as certainty.
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
              onClick={() => ask(suggestion)}
              className="min-h-9 rounded-full border border-line bg-soft px-3 text-xs font-semibold text-muted transition hover:border-primary/35 hover:text-foreground disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-end gap-2 rounded-[12px] border border-line bg-soft p-2 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
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
            className="min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted/70"
          />
          <Button
            size="icon"
            disabled={busy || question.trim().length < 3}
            onClick={() => ask()}
            aria-label="Ask question"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-[9px] bg-danger-soft p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {answer && (
          <div className="mt-6 rounded-[12px] border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                <Sparkles className="size-3" />
                {answer.interpretationLabel}
              </Badge>
              <Badge
                tone={
                  answer.confidence === "high"
                    ? "positive"
                    : answer.confidence === "medium"
                      ? "gold"
                      : "attention"
                }
              >
                {titleCase(answer.confidence)} confidence
              </Badge>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7">
              {answer.answer}
            </p>
            <div className="mt-5">
              <p className="text-xs font-bold tracking-[.12em] text-muted uppercase">
                Evidence used
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {answer.evidence.map((evidence, index) => (
                  <div
                    key={`${evidence.type}-${index}`}
                    className="rounded-[9px] border border-line bg-soft p-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-positive" />
                      <span className="text-xs font-semibold">
                        {titleCase(evidence.type)} · {evidence.reference}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted">
                      {evidence.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              {answer.caveats.map((caveat) => (
                <p key={caveat} className="text-xs leading-5 text-muted">
                  • {caveat}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
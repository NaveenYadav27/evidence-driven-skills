import { useMemo, useState } from "react";
import { ClipboardCheck, Check, X, RotateCcw, Trophy } from "lucide-react";
import { getAssessment, type MCQ } from "@/data/assessments";
import { useProgress } from "@/lib/progress/engine";

export function AssessmentQuiz({ moduleId }: { moduleId: string }) {
  const questions = getAssessment(moduleId);
  const assessmentId = `assessment-${moduleId}`;
  const stored = useProgress((s) => s.assessments[assessmentId]);
  const initAssessment = useProgress((s) => s.initAssessment);
  const setAnswer = useProgress((s) => s.setAnswer);
  const submitAssessment = useProgress((s) => s.submitAssessment);

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const src = stored?.answers ?? {};
    const out: Record<string, number> = {};
    for (const k in src) if (typeof src[k] === "number") out[k] = src[k] as number;
    return out;
  });
  const [submitted, setSubmitted] = useState(stored?.status === "passed" || stored?.status === "submitted" || stored?.status === "failed");

  if (!questions.length) {
    return (
      <div className="panel p-8 text-center text-muted-foreground">
        <ClipboardCheck className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Assessment for this module is being authored.</p>
      </div>
    );
  }

  const score = useMemo(() => {
    let ok = 0;
    for (const q of questions) if (answers[q.id] === q.answer) ok++;
    return Math.round((ok / questions.length) * 100);
  }, [answers, questions]);

  const answered = Object.keys(answers).length;

  const handleSelect = (q: MCQ, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    if (!stored) initAssessment(assessmentId, { moduleId, passThreshold: 70 });
    setAnswer(assessmentId, q.id, idx);
  };

  const onSubmit = () => {
    if (!stored) initAssessment(assessmentId, { moduleId, passThreshold: 70 });
    submitAssessment(assessmentId, score);
    setSubmitted(true);
  };

  const onRetry = () => {
    setAnswers({});
    setSubmitted(false);
    initAssessment(assessmentId, { moduleId, passThreshold: 70 });
  };

  const passed = submitted && score >= 70;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="panel panel-accent p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-[var(--cyan)]" />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Module Assessment · pass ≥ 70%</div>
            <div className="text-sm">
              {submitted ? (
                <span className={passed ? "text-[var(--cyan)] font-semibold" : "text-red-400 font-semibold"}>
                  {passed ? "Passed" : "Not passed"} — {score}%
                </span>
              ) : (
                <span>{answered} / {questions.length} answered</span>
              )}
            </div>
          </div>
        </div>
        {submitted ? (
          <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:border-[var(--cyan)]/50">
            <RotateCcw className="h-4 w-4" /> Retake
          </button>
        ) : (
          <button onClick={onSubmit} disabled={answered < questions.length}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            Submit {answered}/{questions.length}
          </button>
        )}
      </div>

      {questions.map((q, i) => {
        const selected = answers[q.id];
        return (
          <div key={q.id} className="panel p-5">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-mono text-xs text-muted-foreground mt-1">Q{i + 1}</span>
              <h4 className="font-semibold">{q.q}</h4>
            </div>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const chosen = selected === idx;
                const correct = submitted && idx === q.answer;
                const wrong = submitted && chosen && idx !== q.answer;
                return (
                  <button key={idx} onClick={() => handleSelect(q, idx)} disabled={submitted}
                    className={`w-full text-left rounded-md border px-3 py-2 text-sm flex items-center gap-2 transition ${
                      correct ? "border-[var(--cyan)]/60 bg-[var(--cyan)]/10" :
                      wrong ? "border-red-500/60 bg-red-500/10" :
                      chosen ? "border-primary bg-primary/10" :
                      "border-border hover:border-border/80"
                    }`}>
                    <span className="font-mono text-xs opacity-60">{String.fromCharCode(65 + idx)}.</span>
                    <span className="flex-1">{opt}</span>
                    {correct && <Check className="h-4 w-4 text-[var(--cyan)]" />}
                    {wrong && <X className="h-4 w-4 text-red-400" />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 text-xs text-muted-foreground border-l-2 border-[var(--cyan)]/40 pl-3">
                <span className="text-foreground font-semibold">Explanation: </span>{q.explain}
              </p>
            )}
          </div>
        );
      })}

      {submitted && passed && (
        <div className="panel panel-accent p-5 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-[var(--cyan)]" />
          <div>
            <div className="font-semibold">Assessment cleared</div>
            <p className="text-sm text-muted-foreground">Result is stored in your progress. Mastery tab shows the updated score.</p>
          </div>
        </div>
      )}
    </div>
  );
}

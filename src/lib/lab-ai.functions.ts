// AI-powered lab enhancements: analyst, report generator, finding grader.
// Calls Lovable AI Gateway via the AI SDK from the server only.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

function mapAiError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (/429/.test(msg)) throw new Error("AI rate limit reached — please wait a moment and retry.");
  if (/402/.test(msg)) throw new Error("AI credits exhausted for this workspace.");
  throw new Error(msg || "AI request failed");
}

/* ───────────────── Analyst: summarize transcript ───────────────── */

const AnalyzeInput = z.object({
  labId: z.string().min(1),
  labTitle: z.string().min(1),
  scenario: z.string().default(""),
  target: z.string().optional(),
  objectives: z.array(z.object({ label: z.string(), satisfied: z.boolean() })).default([]),
  transcript: z.string().min(1),
});

export const analyzeLabOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data }) => {
    const model = getModel();
    const system = `You are ShadowXLab's senior red-team analyst.
You receive raw output from a cybersecurity training lab (recon, web, crypto tools).
Produce a SHORT, scannable analysis in markdown:

## Key findings
- bullets with the concrete facts (registrar, IPs, headers, SAN entries, etc.)

## Risks / signals
- security-relevant observations (missing HSTS, exposed paths, weak posture, anomalies)

## Suggested next moves
- 2-4 concrete commands the learner should run next, formatted as \`tool args\`

Rules: cite values exactly as they appear in the output. No invented data.
Stay under ~250 words. Use neutral, instructive tone.`;

    const prompt = `Lab: ${data.labTitle}
Target: ${data.target ?? "(none)"}
Scenario: ${data.scenario}

Objectives (✓ done):
${data.objectives.map((o) => `${o.satisfied ? "✓" : "·"} ${o.label}`).join("\n") || "(none)"}

Transcript (most recent commands):
${data.transcript}`;

    try {
      const { text } = await generateText({ model, system, prompt });
      return { ok: true as const, markdown: text.trim() };
    } catch (e) {
      mapAiError(e);
    }
  });

/* ───────────────── Report: full recon brief ───────────────── */

const ReportInput = z.object({
  labId: z.string().min(1),
  labTitle: z.string().min(1),
  target: z.string().optional(),
  transcript: z.string().min(1),
});

export const generateLabReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReportInput.parse(d))
  .handler(async ({ data }) => {
    const model = getModel();
    const system = `You are a CEH instructor writing a polished recon report.
Output STRICT markdown with these sections, in order:

# Recon Report — <target>
**Lab:** <lab title>  ·  **Date:** <today, ISO>

## 1. Executive Summary
2-4 sentences.

## 2. Asset Inventory
Table of hostnames, IPs, ASN, nameservers, certs, etc. discovered.

## 3. Technology Footprint
Server, headers, cookies, CDN, frameworks, TLS issuer (only what evidence supports).

## 4. Exposure & Risks
Bullet list of weak postures or interesting paths. Severity tag in parens.

## 5. Recommendations
Concrete, prioritized actions for a defender.

## 6. Evidence Index
Quote 2-5 short evidence snippets (filename-less code blocks) from the raw output.

Only use values found in the transcript. If a section has no evidence, write "_No data captured._".`;

    const prompt = `Target: ${data.target ?? "(none)"}
Lab: ${data.labTitle}
Today: ${new Date().toISOString().slice(0, 10)}

Transcript:
${data.transcript}`;

    try {
      const { text } = await generateText({ model, system, prompt });
      return { ok: true as const, markdown: text.trim() };
    } catch (e) {
      mapAiError(e);
    }
  });

/* ───────────────── Grader: free-text answer judgment ───────────────── */

const GradeInput = z.object({
  labId: z.string().min(1),
  labTitle: z.string().min(1),
  target: z.string().optional(),
  question: z.string().min(1),
  expectedKey: z.string().optional(),
  studentAnswer: z.string().min(1).max(2000),
  transcript: z.string().min(1),
});

export const gradeLabFinding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GradeInput.parse(d))
  .handler(async ({ data }) => {
    const model = getModel();
    const system = `You are a strict CEH lab grader.
Judge whether the student's answer is correct GIVEN ONLY the evidence in the transcript
(plus widely-known cyber-security facts where unambiguous).

Reply with a single fenced JSON block, no prose outside it:

\`\`\`json
{"pass": boolean, "confidence": 0..1, "reasoning": "<=2 sentences", "evidence": "<short quote or note>"}
\`\`\`

Be conservative: if the transcript does not contain supporting evidence, set pass=false
and explain what command the student should run.`;

    const prompt = `Lab: ${data.labTitle}
Target: ${data.target ?? "(none)"}
Question / objective: ${data.question}${data.expectedKey ? ` (key: ${data.expectedKey})` : ""}
Student answer: ${data.studentAnswer}

Transcript:
${data.transcript}`;

    try {
      const { text } = await generateText({ model, system, prompt });
      const match = text.match(/\{[\s\S]*\}/);
      let parsed: { pass: boolean; confidence: number; reasoning: string; evidence?: string } = {
        pass: false,
        confidence: 0,
        reasoning: "Grader could not parse a response.",
      };
      if (match) {
        try {
          const j = JSON.parse(match[0]);
          parsed = {
            pass: !!j.pass,
            confidence: Math.max(0, Math.min(1, Number(j.confidence) || 0)),
            reasoning: String(j.reasoning ?? "").slice(0, 600),
            evidence: j.evidence ? String(j.evidence).slice(0, 400) : undefined,
          };
        } catch {
          /* fallthrough */
        }
      }
      return { ok: true as const, ...parsed, raw: text };
    } catch (e) {
      mapAiError(e);
    }
  });

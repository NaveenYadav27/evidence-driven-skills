import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { simulateOutput } from "@/lib/gfs-command-registry";

export interface SimTerminalHandle {
  run: (cmd: string) => void;
}

interface Line { kind: "in" | "out" | "sys" | "err"; text: string }

export const SimTerminal = forwardRef<SimTerminalHandle, {
  onExecuted?: (cmd: string, success: boolean) => void;
  hint?: string;
}>(function SimTerminal({ onExecuted, hint }, ref) {
  const [lines, setLines] = useState<Line[]>([
    { kind: "sys", text: "ShadowXLab :: Range Simulator (Windows + Kali toolchain)\nUse Copy → Run on any command card, or type a command below." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);

  const exec = useCallback((raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setLines((prev) => [...prev, { kind: "in", text: `$ ${cmd}` }]);
    const { output, matched } = simulateOutput(cmd);
    if (matched) {
      setLines((prev) => [...prev, { kind: "out", text: output }]);
      onExecuted?.(matched.cmd, true);
    } else {
      setLines((prev) => [...prev, { kind: "err", text: `command not registered in this module: ${cmd.split(/\s+/)[0]}` }]);
      onExecuted?.(cmd, false);
    }
  }, [onExecuted]);

  useImperativeHandle(ref, () => ({ run: exec }), [exec]);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary/70" />
          <span className="h-2 w-2 rounded-full bg-[var(--warn)]/70" />
          <span className="h-2 w-2 rounded-full bg-[var(--success)]/70" />
          <span className="ml-2 text-[11px] font-mono text-muted-foreground">analyst@gfs-range:~$</span>
        </div>
        <span className="chip chip-live"><span className="dot-live" /> simulated</span>
      </div>
      <div ref={scrollRef} className="h-[240px] overflow-auto p-3 font-mono text-[12px] leading-relaxed">
        {lines.map((l, i) => (
          <pre key={i} className={
            l.kind === "in" ? "text-[var(--cyan)] whitespace-pre-wrap" :
            l.kind === "err" ? "text-primary whitespace-pre-wrap" :
            l.kind === "sys" ? "text-muted-foreground whitespace-pre-wrap" :
            "text-foreground whitespace-pre-wrap"
          }>{l.text}</pre>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); exec(input); setInput(""); requestAnimationFrame(() => inputRef.current?.focus()); }}
            className="flex items-center gap-2 px-3 py-2 border-t border-border bg-background/40">
        <span className="font-mono text-[var(--cyan)]">$</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
               placeholder={hint ?? "type or click Run on a command card"}
               className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-muted-foreground/60"
               autoComplete="off" spellCheck={false} />
      </form>
    </div>
  );
});

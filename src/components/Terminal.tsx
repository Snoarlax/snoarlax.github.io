import { useState, useEffect, useRef, useCallback } from "react";
import { BOOT_MESSAGES, processCommand, SNORLAX_ASCII } from "@/lib/terminal-commands";

const Terminal = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [showBoot, setShowBoot] = useState(true);
  const [history, setHistory] = useState<Array<{ type: "input" | "output"; text: string }>>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Boot sequence
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_MESSAGES.length) {
        setBootLines((prev) => [...prev, BOOT_MESSAGES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBootComplete(true);
          setShowBoot(false);
        }, 600);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [bootLines, history]);

  // Focus input
  useEffect(() => {
    if (bootComplete) inputRef.current?.focus();
  }, [bootComplete]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = currentInput.trim();
      if (!trimmed) return;

      const output = processCommand(trimmed);
      setHistory((prev) => [
        ...prev,
        { type: "input", text: trimmed },
        { type: "output", text: output },
      ]);
      setCommandHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);
      setCurrentInput("");

      if (trimmed.toLowerCase() === "clear") {
        setHistory([]);
        setBootLines([]);
      }
    },
    [currentInput]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="lab-background min-h-screen flex flex-col items-center justify-start pt-[4vh] cursor-text" onClick={focusInput}>
      <div className="crt-frame crt-scanlines crt-vignette crt-flicker w-2/3 min-w-[480px] relative">
          <div className="relative">
            {/* Snorlax watermark - outside scroll container */}
            <div className="snorlax-watermark" aria-hidden="true">
{SNORLAX_ASCII}
            </div>
          <div
            ref={scrollRef}
            className="crt-screen relative p-6 md:p-10 h-[62vh] overflow-y-auto scrollbar-hide"
          >
        {/* Boot sequence */}
        {showBoot && bootLines.map((line, i) => (
          <div key={`boot-${i}`} className="terminal-glow text-foreground text-sm leading-relaxed">
            {line}
          </div>
        ))}

        {bootComplete && (
          <>
            <div className="terminal-glow text-foreground text-sm mt-4 mb-2">
              ═══════════════════════════════════════════════════
            </div>
            <div className="terminal-glow text-foreground text-sm mb-1">
              ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL
            </div>
            <div className="terminal-glow text-muted-foreground text-sm mb-4">
              Type "help" for available commands.
            </div>

            {/* Command history */}
            {history.map((entry, i) => (
              <div key={`hist-${i}`} className="text-sm leading-relaxed">
                {entry.type === "input" ? (
                  <div className="terminal-glow text-foreground">
                    <span className="text-accent">&gt; </span>
                    {entry.text}
                  </div>
                ) : (
                  <pre className="terminal-glow text-foreground whitespace-pre-wrap mb-2 font-[inherit]">
                    {entry.text}
                  </pre>
                )}
              </div>
            ))}

            {/* Input line */}
            <form onSubmit={handleSubmit} className="flex items-center text-sm">
              <span className="terminal-glow text-accent">&gt;&nbsp;</span>
              <span className="cursor-blink terminal-glow text-foreground" style={{ order: 1 }}>█</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none terminal-glow text-foreground font-[inherit] text-sm w-0 min-w-0"
                style={{ width: currentInput.length + 'ch' }}
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </>
        )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;

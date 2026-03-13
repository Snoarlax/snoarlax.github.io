import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { BOOT_MESSAGES, processCommand, SNORLAX_ASCII } from "@/lib/terminal-commands";

const PLACEHOLDER_IMG = "/placeholder.svg";

const TerminalOutput = ({ text }: { text: string }) => {
  return (
    <div className="terminal-glow text-foreground whitespace-pre-wrap mb-2 font-[inherit] terminal-markdown">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-accent">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-accent">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-accent">{children}</h3>,
          strong: ({ children }) => <strong className="text-accent font-bold">{children}</strong>,
          em: ({ children }) => <em className="text-muted-foreground italic">{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            return isBlock ? (
              <pre className="bg-muted/30 border border-border p-3 rounded my-2 overflow-x-auto text-xs">
                <code>{children}</code>
              </pre>
            ) : (
              <code className="bg-muted/30 px-1 rounded text-accent">{children}</code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-2">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-primary">
              {children}
            </a>
          ),
          hr: () => <hr className="border-border my-3" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/50 pl-3 my-2 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          img: ({ src, alt, title }) => (
            <span className="block my-3 flex flex-col items-center">
              <img
                src={src || PLACEHOLDER_IMG}
                alt={alt || ""}
                className="max-w-[50%] sm:max-w-[40%] h-auto border-2 border-accent/30 rounded"
                style={{ filter: 'sepia(1) hue-rotate(70deg) saturate(2) brightness(0.7)' }}
              />
              {title && (
                <span className="block text-muted-foreground text-xs mt-1 italic text-center">{title}</span>
              )}
            </span>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

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
      const isBlogPost = trimmed.toLowerCase().startsWith("blog ") && trimmed.trim().split(/\s+/).length > 1;
      
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

      // Scroll to top of blog post after render
      if (isBlogPost) {
        setTimeout(() => {
          if (scrollRef.current) {
            // Find the last input line element and scroll to it
            const allInputLines = scrollRef.current.querySelectorAll('[data-blog-start]');
            const lastStart = allInputLines[allInputLines.length - 1];
            if (lastStart) {
              lastStart.scrollIntoView({ block: 'start' });
            }
          }
        }, 50);
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
    <div className="lab-background min-h-screen flex flex-col items-center justify-start pt-[2vh] sm:pt-[4vh] cursor-text px-2 sm:px-0" onClick={focusInput}>
      <div className="crt-frame crt-scanlines crt-vignette crt-flicker w-[95%] sm:w-2/3 min-w-0 sm:min-w-[480px] relative">
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
                  <div
                    className="terminal-glow text-foreground"
                    {...(entry.text.toLowerCase().startsWith("blog ") ? { 'data-blog-start': 'true' } : {})}
                  >
                    <span className="text-accent">&gt; </span>
                    {entry.text}
                  </div>
                ) : (
                  <TerminalOutput text={entry.text} />
                )}
              </div>
            ))}

            {/* Input line */}
            <form onSubmit={handleSubmit} className="flex items-center text-sm">
              <span className="terminal-glow text-accent">&gt;&nbsp;</span>
              <div className="relative flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none outline-none terminal-glow text-foreground font-[inherit] text-sm w-full caret-transparent"
                  autoComplete="off"
                  spellCheck={false}
                />
                <span
                  className="cursor-blink terminal-glow text-foreground absolute top-0 pointer-events-none"
                  style={{ left: currentInput.length + 'ch' }}
                >█</span>
              </div>
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

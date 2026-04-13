import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { processCommand, SNORLAX_ASCII } from "@/lib/terminal-commands";

const MENU_SECTIONS = [
  {
    label: "PERSONAL INFO",
    items: [
      { label: "About Me", command: "whoami" },
      { label: "System Status", command: "status" },
    ],
  },
  {
    label: "RESEARCH",
    items: [
      { label: "Blog Posts", command: "blog" },
      { label: "Projects", command: "project" },
      { label: "Conference Talks", command: "conference" },
    ],
  },
  {
    label: "CONTACT",
    items: [
      { label: "Email", command: "email" },
      { label: "GitHub", command: "github" },
      { label: "PGP Key", command: "pgp" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Neofetch", command: "neofetch" },
    ],
  },
];

// Flatten for keyboard nav
const ALL_ITEMS = MENU_SECTIONS.flatMap((s) => s.items);

const TerminalMarkdown = ({ text }: { text: string }) => (
  <div className="terminal-glow text-foreground whitespace-pre-wrap font-[inherit] terminal-markdown">
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
              src={src || "/placeholder.svg"}
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

interface RecruiterTerminalProps {
  onBack: () => void;
}

const RecruiterTerminal = ({ onBack }: RecruiterTerminalProps) => {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blogSubItems, setBlogSubItems] = useState<Array<{ id: number; label: string }> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const runCommand = useCallback((cmd: string) => {
    const result = processCommand(cmd);
    setOutput(result);
    setActiveCommand(cmd);

    // If it's a blog list, parse IDs for sub-navigation
    if (cmd === "blog") {
      const matches = [...result.matchAll(/\[(\d+)\]\s+[\d-]+\s+-\s+(.+)/g)];
      if (matches.length > 0) {
        setBlogSubItems(matches.map((m) => ({ id: parseInt(m[1]), label: m[2].trim() })));
      }
    } else {
      setBlogSubItems(null);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [output]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeCommand) {
          setActiveCommand(null);
          setOutput("");
          setBlogSubItems(null);
        } else {
          onBack();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeCommand, onBack]);

  return (
    <div className="lab-background min-h-screen flex flex-col items-center justify-center px-2 sm:px-0">
      <div className="crt-frame crt-scanlines crt-vignette crt-flicker w-[95%] sm:w-[85%] lg:w-[80%] min-w-0 sm:min-w-[480px] max-w-[1400px] relative">
        <div className="relative">
          <div className="snorlax-watermark" aria-hidden="true">
            {SNORLAX_ASCII}
          </div>
          <div
            ref={scrollRef}
            className="crt-screen relative p-6 md:p-10 h-[75vh] overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="terminal-glow text-foreground text-sm mb-1">
              ═══════════════════════════════════════════════════
            </div>
            <div className="terminal-glow text-foreground text-sm mb-1">
              ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL — GUIDED MODE
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-muted-foreground text-xs">
                Select an option below. Press [ESC] to go back.
              </div>
              <button
                onClick={onBack}
                className="text-muted-foreground text-xs hover:text-accent transition-colors terminal-glow"
              >
                [← BACK]
              </button>
            </div>

            {/* Content area */}
            {!activeCommand ? (
              // Menu view
              <div className="space-y-6">
                {MENU_SECTIONS.map((section) => (
                  <div key={section.label}>
                    <div className="terminal-glow text-accent text-xs font-bold mb-2">
                      ── {section.label} ──
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item.command}
                          onClick={() => runCommand(item.command)}
                          className="text-left p-3 border border-border rounded hover:border-accent hover:bg-accent/5 transition-all duration-150 group"
                        >
                          <span className="terminal-glow text-foreground text-sm group-hover:text-accent transition-colors">
                            <span className="text-accent">{">"}</span> {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Output view
              <div>
                <button
                  onClick={() => { setActiveCommand(null); setOutput(""); setBlogSubItems(null); }}
                  className="text-muted-foreground text-xs hover:text-accent transition-colors terminal-glow mb-4 inline-block"
                >
                  {"←"} Back to menu
                </button>

                <TerminalMarkdown text={output} />

                {/* Blog sub-items */}
                {blogSubItems && (
                  <div className="mt-4 space-y-2">
                    <div className="terminal-glow text-accent text-xs font-bold">
                      ── SELECT A POST ──
                    </div>
                    {blogSubItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => runCommand(`blog ${item.id}`)}
                        className="block w-full text-left p-2 border border-border rounded hover:border-accent hover:bg-accent/5 transition-all duration-150 group"
                      >
                        <span className="terminal-glow text-foreground text-sm group-hover:text-accent transition-colors">
                          <span className="text-accent">{">"}</span> [{item.id}] {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterTerminal;

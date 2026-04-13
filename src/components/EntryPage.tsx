import { useState, useEffect } from "react";
import { SNORLAX_ASCII } from "@/lib/terminal-commands";

interface EntryPageProps {
  onSelect: (role: "hacker" | "recruiter") => void;
}

const EntryPage = ({ onSelect }: EntryPageProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const options = [
    { key: "hacker", label: "HACKER", desc: "Full terminal experience — type commands manually" },
    { key: "recruiter", label: "RECRUITER", desc: "Guided interface — browse with clicks" },
  ] as const;

  useEffect(() => {
    const t1 = setTimeout(() => setBootDone(true), 1200);
    const t2 = setTimeout(() => setShowOptions(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!showOptions) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i === 0 ? 1 : 0));
      } else if (e.key === "Enter") {
        onSelect(options[selectedIndex].key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showOptions, selectedIndex, onSelect]);

  return (
    <div className="lab-background min-h-screen flex flex-col items-center justify-center px-2 sm:px-0">
      <div className="crt-frame crt-scanlines crt-vignette crt-flicker w-[95%] sm:w-[85%] lg:w-[80%] min-w-0 sm:min-w-[480px] max-w-[1400px] relative">
        <div className="relative">
          <div className="snorlax-watermark" aria-hidden="true">
            {SNORLAX_ASCII}
          </div>
          <div className="crt-screen relative p-6 md:p-10 min-h-[50vh] flex flex-col items-center justify-center">
            {/* Boot text */}
            <div className="terminal-glow text-foreground text-sm text-center mb-2">
              ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL
            </div>
            <div className="terminal-glow text-foreground text-sm text-center mb-6">
              ═══════════════════════════════════════════════════
            </div>

            {bootDone && (
              <div className="terminal-glow text-foreground text-sm text-center mb-8 animate-fade-in">
                IDENTIFY YOURSELF:
              </div>
            )}

            {showOptions && (
              <div className="flex flex-col gap-4 w-full max-w-md animate-fade-in">
                {options.map((opt, i) => (
                  <button
                    key={opt.key}
                    onClick={() => onSelect(opt.key)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`text-left p-4 border-2 rounded transition-all duration-150 ${
                      selectedIndex === i
                        ? "border-accent bg-accent/10 shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="terminal-glow text-accent font-bold text-base mb-1">
                      {selectedIndex === i ? "> " : "  "}{opt.label}
                    </div>
                    <div className="text-muted-foreground text-xs ml-4">
                      {opt.desc}
                    </div>
                  </button>
                ))}

                <div className="text-muted-foreground text-xs text-center mt-4 terminal-glow">
                  [↑↓] Navigate &nbsp; [ENTER] Select &nbsp; or click
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;

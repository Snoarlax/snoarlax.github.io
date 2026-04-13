import { useState } from "react";
import EntryPage from "./components/EntryPage";
import Terminal from "./components/Terminal";
import RecruiterTerminal from "./components/RecruiterTerminal";

const App = () => {
  const [role, setRole] = useState<"hacker" | "recruiter" | null>(null);

  if (!role) return <EntryPage onSelect={setRole} />;
  if (role === "hacker") return <Terminal />;
  return <RecruiterTerminal onBack={() => setRole(null)} />;
};

export default App;

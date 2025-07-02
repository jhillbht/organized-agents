
import { 
  Bot, 
  Code, 
  GitBranch, 
  Shield, 
  TestTube, 
  FileText, 
  Zap, 
  Search, 
  Database, 
  Settings,
  BookOpen,
  Bug
} from 'lucide-react';

// Icon mapping for agent types
const ICON_MAP = {
  bot: Bot,
  code: Code,
  git: GitBranch,
  shield: Shield,
  test: TestTube,
  docs: FileText,
  zap: Zap,
  search: Search,
  database: Database,
  settings: Settings,
  book: BookOpen,
  bug: Bug,
} as const;

export const AGENT_ICONS = ICON_MAP;
export type AgentIconName = keyof typeof AGENT_ICONS;

interface CCAgentsProps {
  onBack?: () => void;
}

export default function CCAgents({ onBack }: CCAgentsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center">
        <Bot className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-4">CC Agents</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Organized AI Desktop App - Coming Soon!
        </p>
        <div className="bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚧 Under Development</h2>
          <p className="text-sm text-muted-foreground">
            This enhanced Claudia platform with claude-code-router integration and agent coordination is currently being built.
          </p>
          <div className="mt-4 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Development environment ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Tauri 2 + React + Rust setup complete</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">🔄</span>
              <span className="text-sm">HOA agents coordinating implementation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📋</span>
              <span className="text-sm">claude-code-router integration planned</span>
            </div>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              ← Back to Welcome
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// For backward compatibility - named export
export { CCAgents };

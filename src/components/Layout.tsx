import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, LogOut, FolderOpen, MessageSquare, Settings, Sparkles } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
  currentView: 'projects' | 'prompts' | 'playground' | 'providers';
  onViewChange: (view: 'projects' | 'prompts' | 'playground' | 'providers') => void;
};

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">LLM Studio</h1>
              <p className="text-xs text-slate-500">AI Development</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => onViewChange('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'projects'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="font-medium">Projects</span>
          </button>

          <button
            onClick={() => onViewChange('prompts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'prompts'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Prompts</span>
          </button>

          <button
            onClick={() => onViewChange('playground')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'playground'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Playground</span>
          </button>

          <button
            onClick={() => onViewChange('providers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'providers'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Providers</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

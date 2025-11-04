import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Projects } from './components/Projects';
import { Prompts } from './components/Prompts';
import { Playground } from './components/Playground';
import { Providers } from './components/Providers';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'projects' | 'prompts' | 'playground' | 'providers'>('projects');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'projects' && <Projects />}
      {currentView === 'prompts' && <Prompts />}
      {currentView === 'playground' && <Playground />}
      {currentView === 'providers' && <Providers />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

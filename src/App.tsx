import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ProjectWorkspace from './components/workspace/ProjectWorkspace';
import ApiKeyModal from './components/common/ApiKeyModal';

export default function App() {
  const { currentView, darkMode, apiKey, setShowApiKeyModal } = useStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!apiKey) {
      const timer = setTimeout(() => setShowApiKeyModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'dashboard' ? <Dashboard /> : <ProjectWorkspace />}
      </main>
      <ApiKeyModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #111)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}

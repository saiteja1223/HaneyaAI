import { Moon, Sun, Key, Brain } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Header() {
  const { darkMode, toggleDarkMode, setShowApiKeyModal, apiKey, currentView, setCurrentView } = useStore();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <Brain className="w-7 h-7 text-emerald-600" />
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Haneya <span className="text-emerald-600">AI</span>
          </span>
        </div>
        {currentView === 'workspace' && (
          <button
            onClick={() => setCurrentView('dashboard')}
            className="ml-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            &larr; Dashboard
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowApiKeyModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            apiKey
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          {apiKey ? 'API Key Set' : 'Set API Key'}
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  );
}

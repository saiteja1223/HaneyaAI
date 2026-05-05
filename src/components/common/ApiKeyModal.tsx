import { useState,useEffect } from 'react';
import { X, Shield, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ApiKeyModal() {
  const { showApiKeyModal, setShowApiKeyModal, setApiKey, apiKey } = useStore();
  const [input, setInput] = useState(apiKey);
  const [error, setError] = useState('');
  useEffect(() => {
    setApiKey("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")
  
     }, []);
  // if (!showApiKeyModal) return null;
  if (true) return null;

  // const handleSave = () => {
  //   // const trimmed = input.trim();
  //   // if (!trimmed.startsWith('sk-')) {
  //   //   setError('API key must start with "sk-"');
  //   //   return;
  //   // }
  //   // if (trimmed.length < 20) {
  //   //   setError('API key appears too short');
  //   //   return;
  //   // }
  //   // setError('');
  //   setApiKey("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");
  // };

  return (
    <>
   {apiKey && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">OpenAI API Key</h2>
          <button
            onClick={() => setShowApiKeyModal(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your API key is used only in your browser session. It is never sent to any server other than OpenAI.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              placeholder="sk-..."
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
            />
            {error && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
          </div>

          <button
          
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>} </>
  );
}

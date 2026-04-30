import { useStore } from '../../store/useStore';

const STAGE_LABELS: Record<string, string> = {
  idle: '',
  analyzing: 'Analyzing requirement...',
  'generating-fs': 'Generating Functional Specification...',
  'generating-ts': 'Generating Technical Specification...',
  finalizing: 'Finalizing output...',
  understanding: 'Understanding specifications...',
  designing: 'Designing logic...',
  writing: 'Writing ABAP code...',
  optimizing: 'Optimizing code...',
  complete: 'Complete',
  error: 'Error occurred',
};

export default function ProgressBar() {
  const { generationStage, generationProgress, isGenerating } = useStore();

  if (!isGenerating && generationStage === 'idle') return null;

  const label = STAGE_LABELS[generationStage] || '';
  const isError = generationStage === 'error';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${isError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isGenerating && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          )}
          {label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{generationProgress}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isError
              ? 'bg-red-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
          style={{ width: `${generationProgress}%` }}
        />
      </div>
    </div>
  );
}

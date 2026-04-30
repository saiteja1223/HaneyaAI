import { useState } from 'react';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
import type { ProjectVersion } from '../../types';

export default function VersionHistory({ versions }: { versions: ProjectVersion[] }) {
  const [expanded, setExpanded] = useState(false);

  if (versions.length === 0) return null;

  const typeLabel = (t: string) => (t === 'fs' ? 'FS' : t === 'ts' ? 'TS' : 'ABAP');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
          <Clock className="w-3.5 h-3.5" />
          Version History ({versions.length})
        </span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
          {versions.slice().reverse().map((v) => (
            <div key={v.id} className="px-4 py-2 text-xs">
              <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium mr-2">
                {typeLabel(v.type)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(v.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Plus, FolderOpen, Trash2, Brain, FileText, Code2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Project } from '../../types';

export default function Dashboard() {
  const { projects, createProject, deleteProject, setActiveProjectId, setCurrentView, setShowApiKeyModal, apiKey } = useStore();
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    const name = newProjectName.trim() || `Project ${projects.length + 1}`;
    createProject(name);
    setNewProjectName('');
    setShowCreate(false);
  };

  const openProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentView('workspace');
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <Brain className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Haneya AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            AI-powered SAP development assistant. From requirement to ABAP code in minutes.
          </p>
        </div>

        {/* Create */}
        <div className="mb-8">
          {showCreate ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">New Project</h3>
              <div className="flex gap-3">
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Project name..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewProjectName(''); }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!apiKey) {
                  setShowApiKeyModal(true);
                  return;
                }
                setShowCreate(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Create New Project</span>
            </button>
          )}
        </div>

        {/* Project List */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Your Projects
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice().reverse().map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={openProject} onDelete={deleteProject} />
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && !showCreate && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen, onDelete }: { project: Project; onOpen: (id: string) => void; onDelete: (id: string) => void }) {
  const hasFs = !!project.functionalSpec;
  const hasTs = !!project.technicalSpec;
  const hasCode = !!project.abapCode;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <h3
          className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          onClick={() => onOpen(project.id)}
        >
          {project.name}
        </h3>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <StatusIcon done={hasFs} label="FS" />
        <StatusIcon done={hasTs} label="TS" />
        <StatusIcon done={hasCode} label="ABAP" />
        {project.approved && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        {new Date(project.updatedAt).toLocaleDateString()}
      </p>

      <button
        onClick={() => onOpen(project.id)}
        className="w-full py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
      >
        Open Project
      </button>
    </div>
  );
}

function StatusIcon({ done, label }: { done: boolean; label: string }) {
  return done ? (
    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
      {label === 'FS' && <FileText className="w-3.5 h-3.5" />}
      {label === 'TS' && <FileText className="w-3.5 h-3.5" />}
      {label === 'ABAP' && <Code2 className="w-3.5 h-3.5" />}
      {label}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
      {label === 'FS' && <FileText className="w-3.5 h-3.5" />}
      {label === 'TS' && <FileText className="w-3.5 h-3.5" />}
      {label === 'ABAP' && <Code2 className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

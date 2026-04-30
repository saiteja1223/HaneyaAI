import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Project, AppView, OutputTab, GenerationStage } from '../types';

interface AppState {
  // View
  currentView: AppView;
  activeProjectId: string | null;
  activeTab: OutputTab;

  // API Key
  apiKey: string;
  showApiKeyModal: boolean;

  // Dark mode
  darkMode: boolean;

  // Generation
  isGenerating: boolean;
  generationStage: GenerationStage;
  generationProgress: number;

  // Projects
  projects: Project[];

  // Actions
  setCurrentView: (view: AppView) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveTab: (tab: OutputTab) => void;
  setApiKey: (key: string) => void;
  setShowApiKeyModal: (show: boolean) => void;
  toggleDarkMode: () => void;
  setGenerationState: (stage: GenerationStage, progress: number) => void;
  setIsGenerating: (v: boolean) => void;

  // Project CRUD
  createProject: (name: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  addVersion: (projectId: string, type: 'fs' | 'ts' | 'abap', content: string) => void;
}

const STORAGE_KEY = 'haneya-projects';
const DARK_MODE_KEY = 'haneya-dark-mode';

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function loadDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (raw !== null) return JSON.parse(raw);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export const useStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  activeProjectId: null,
  activeTab: 'fs',
  apiKey: sessionStorage.getItem('haneya-api-key') || '',
  showApiKeyModal: false,
  darkMode: loadDarkMode(),
  isGenerating: false,
  generationStage: 'idle',
  generationProgress: 0,
  projects: loadProjects(),

  setCurrentView: (view) => set({ currentView: view }),
  setActiveProjectId: (id) => set({ activeProjectId: id, activeTab: 'fs' }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setApiKey: (key) => {
    sessionStorage.setItem('haneya-api-key', key);
    set({ apiKey: key, showApiKeyModal: false });
  },

  setShowApiKeyModal: (show) => set({ showApiKeyModal: show }),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
    set({ darkMode: next });
  },

  setGenerationState: (stage, progress) =>
    set({ generationStage: stage, generationProgress: progress }),
  setIsGenerating: (v) => set({ isGenerating: v }),

  createProject: (name) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const project: Project = {
      id,
      name,
      requirement: '',
      functionalSpec: '',
      technicalSpec: '',
      approved: false,
      abapCode: '',
      versions: [],
      createdAt: now,
      updatedAt: now,
    };
    const projects = [...get().projects, project];
    saveProjects(projects);
    set({ projects, activeProjectId: id, currentView: 'workspace' });
    return id;
  },

  updateProject: (id, updates) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    saveProjects(projects);
    set({ projects });
  },

  deleteProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id);
    saveProjects(projects);
    set({
      projects,
      activeProjectId: get().activeProjectId === id ? null : get().activeProjectId,
      currentView: get().activeProjectId === id ? 'dashboard' : get().currentView,
    });
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  addVersion: (projectId, type, content) => {
    const projects = get().projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        versions: [
          ...p.versions,
          { id: uuidv4(), type, content, timestamp: new Date().toISOString() },
        ],
        updatedAt: new Date().toISOString(),
      };
    });
    saveProjects(projects);
    set({ projects });
  },
}));

export interface Project {
  id: string;
  name: string;
  requirement: string;
  functionalSpec: string;
  technicalSpec: string;
  approved: boolean;
  abapCode: string;
  versions: ProjectVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  type: 'fs' | 'ts' | 'abap';
  content: string;
  timestamp: string;
}

export type GenerationStage =
  | 'idle'
  | 'analyzing'
  | 'generating-fs'
  | 'generating-ts'
  | 'finalizing'
  | 'understanding'
  | 'designing'
  | 'writing'
  | 'optimizing'
  | 'complete'
  | 'error';

export type OutputTab = 'fs' | 'ts' | 'abap';

export type AppView = 'dashboard' | 'workspace';

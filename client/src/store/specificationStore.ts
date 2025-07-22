import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { validationService } from '@/services/validationService';
import type {
  SpecificationProject,
  SpecificationPhase,
  RequirementDocument,
  DesignDocument,
  TaskDocument,
  ValidationResult,
  ProjectStatus,
  SpecificationDocument,
} from '@/types/specifications';

// Project creation data
export interface CreateProjectData {
  name: string;
  description: string;
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  methodology: 'waterfall' | 'agile' | 'lean' | 'hybrid';
  templateId?: string;
}

// Project update data
export interface ProjectUpdates {
  name?: string;
  description?: string;
  domain?: string;
  status?: ProjectStatus;
  currentPhase?: SpecificationPhase;
}

// Document update data
export interface DocumentUpdate {
  content: string;
  metadata?: Record<string, any>;
}

// Phase validation result
export interface PhaseValidationResult {
  phase: SpecificationPhase;
  isValid: boolean;
  isComplete: boolean;
  validationResults: ValidationResult[];
  completionPercentage: number;
  requiredFields: string[];
  missingFields: string[];
}

// Loading states for different operations
export interface SpecificationLoadingState {
  projects: boolean;
  currentProject: boolean;
  documents: boolean;
  validation: boolean;
  saving: boolean;
  phaseTransition: boolean;
}

// Error states for different operations
export interface SpecificationErrorState {
  projects: string | null;
  currentProject: string | null;
  documents: string | null;
  validation: string | null;
  saving: string | null;
  phaseTransition: string | null;
}

// Auto-save configuration
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds
  debounceDelay: number; // milliseconds
}

// Specification project store state and actions
interface SpecificationStore {
  // State
  projects: SpecificationProject[];
  currentProject: SpecificationProject | null;
  currentPhase: SpecificationPhase;
  documents: {
    requirements: RequirementDocument | null;
    design: DesignDocument | null;
    tasks: TaskDocument | null;
  };

  // Validation and completion tracking
  phaseValidation: Record<SpecificationPhase, PhaseValidationResult | null>;
  unsavedChanges: boolean;
  lastSaved: Date | null;

  // Configuration
  autoSave: AutoSaveConfig;

  // Loading and error states
  loading: SpecificationLoadingState;
  errors: SpecificationErrorState;

  // Project management actions
  createProject: (
    projectData: CreateProjectData
  ) => Promise<SpecificationProject>;
  updateProject: (projectId: string, updates: ProjectUpdates) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<void>;
  setCurrentProject: (project: SpecificationProject | null) => void;

  // Phase management actions
  setCurrentPhase: (phase: SpecificationPhase) => void;
  validatePhase: (phase: SpecificationPhase) => Promise<PhaseValidationResult>;
  canTransitionToPhase: (targetPhase: SpecificationPhase) => boolean;
  transitionToPhase: (targetPhase: SpecificationPhase) => Promise<void>;
  validatePhaseCompletion: (phase: SpecificationPhase) => Promise<boolean>;

  // Document management actions
  updateRequirements: (
    content: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  updateDesign: (
    content: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  updateTasks: (
    content: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  saveDocument: (type: 'requirements' | 'design' | 'tasks') => Promise<void>;
  saveAllDocuments: () => Promise<void>;

  // Auto-save management
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  configureAutoSave: (config: Partial<AutoSaveConfig>) => void;
  markUnsaved: () => void;
  markSaved: () => void;

  // Validation actions
  validateDocument: (
    type: 'requirements' | 'design' | 'tasks'
  ) => Promise<ValidationResult[]>;
  validateAllDocuments: () => Promise<Record<string, ValidationResult[]>>;
  clearValidationResults: (phase?: SpecificationPhase) => void;

  // Project persistence
  exportProject: (projectId: string) => Promise<string>;
  importProject: (projectData: string) => Promise<SpecificationProject>;

  // Error handling actions
  clearError: (key: keyof SpecificationErrorState) => void;
  clearAllErrors: () => void;

  // Internal actions
  setLoading: (key: keyof SpecificationLoadingState, loading: boolean) => void;
  setError: (key: keyof SpecificationErrorState, error: string | null) => void;
  updatePhaseValidation: (
    phase: SpecificationPhase,
    validation: PhaseValidationResult
  ) => void;
}

// Initial states
const initialLoadingState: SpecificationLoadingState = {
  projects: false,
  currentProject: false,
  documents: false,
  validation: false,
  saving: false,
  phaseTransition: false,
};

const initialErrorState: SpecificationErrorState = {
  projects: null,
  currentProject: null,
  documents: null,
  validation: null,
  saving: null,
  phaseTransition: null,
};

const initialAutoSaveConfig: AutoSaveConfig = {
  enabled: true,
  interval: 30000, // 30 seconds
  debounceDelay: 2000, // 2 seconds
};

const initialPhaseValidation: Record<
  SpecificationPhase,
  PhaseValidationResult | null
> = {
  requirements: null,
  design: null,
  tasks: null,
  implementation: null,
  review: null,
  completed: null,
};

// Auto-save timer reference
let autoSaveTimer: number | null = null;
let debounceTimer: number | null = null;

// Create the specification store with persistence
export const useSpecificationStore = create<SpecificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      currentProject: null,
      currentPhase: 'requirements',
      documents: {
        requirements: null,
        design: null,
        tasks: null,
      },

      phaseValidation: initialPhaseValidation,
      unsavedChanges: false,
      lastSaved: null,
      autoSave: initialAutoSaveConfig,
      loading: initialLoadingState,
      errors: initialErrorState,

      // Project management actions
      createProject: async (projectData: CreateProjectData) => {
        const { setLoading, setError } = get();
        setLoading('projects', true);
        setError('projects', null);

        try {
          // TODO: Replace with actual API call
          const newProject: SpecificationProject = {
            id: `project-${Date.now()}`,
            name: projectData.name,
            description: projectData.description,
            domain: projectData.domain,
            complexity: projectData.complexity,
            methodology: projectData.methodology,
            status: 'planning',
            currentPhase: 'requirements',
            documents: [],
            team: [],
            settings: {
              visibility: 'private',
              collaboration: {
                realTimeEditing: true,
                commentingEnabled: true,
                reviewWorkflow: false,
                approvalRequired: false,
                maxCollaborators: 10,
              },
              validation: {
                autoValidation: true,
                validationRules: [],
                customRules: [],
                strictMode: false,
              },
              templates: {
                defaultTemplates: [],
                customTemplates: [],
                templateValidation: true,
              },
              notifications: {
                emailNotifications: true,
                inAppNotifications: true,
                webhooks: [],
              },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            ...state,
            projects: [...state.projects, newProject],
            currentProject: newProject,
            currentPhase: 'requirements',
          }));

          return newProject;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create project';
          setError('projects', errorMessage);
          throw error;
        } finally {
          setLoading('projects', false);
        }
      },

      updateProject: async (projectId: string, updates: ProjectUpdates) => {
        const { setLoading, setError } = get();
        setLoading('currentProject', true);
        setError('currentProject', null);

        try {
          // TODO: Replace with actual API call
          set(state => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? { ...project, ...updates, updatedAt: new Date() }
                : project
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? { ...state.currentProject, ...updates, updatedAt: new Date() }
                : state.currentProject,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update project';
          setError('currentProject', errorMessage);
          throw error;
        } finally {
          setLoading('currentProject', false);
        }
      },

      deleteProject: async (projectId: string) => {
        const { setLoading, setError } = get();
        setLoading('projects', true);
        setError('projects', null);

        try {
          // TODO: Replace with actual API call
          set(state => ({
            projects: state.projects.filter(
              project => project.id !== projectId
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? null
                : state.currentProject,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete project';
          setError('projects', errorMessage);
          throw error;
        } finally {
          setLoading('projects', false);
        }
      },

      fetchProjects: async () => {
        const { setLoading, setError } = get();
        setLoading('projects', true);
        setError('projects', null);

        try {
          // TODO: Replace with actual API call
          // For now, return existing projects from state
          const projects = get().projects;
          set({ projects });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch projects';
          setError('projects', errorMessage);
        } finally {
          setLoading('projects', false);
        }
      },

      fetchProjectById: async (projectId: string) => {
        const { setLoading, setError } = get();
        setLoading('currentProject', true);
        setError('currentProject', null);

        try {
          // TODO: Replace with actual API call
          const project = get().projects.find(p => p.id === projectId);
          if (project) {
            set({ currentProject: project });
          } else {
            throw new Error('Project not found');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch project';
          setError('currentProject', errorMessage);
        } finally {
          setLoading('currentProject', false);
        }
      },

      setCurrentProject: (project: SpecificationProject | null) => {
        set({
          currentProject: project,
          currentPhase: project?.currentPhase || 'requirements',
          documents: {
            requirements: null,
            design: null,
            tasks: null,
          },
          phaseValidation: initialPhaseValidation,
          unsavedChanges: false,
        });
      },

      // Phase management actions
      setCurrentPhase: (phase: SpecificationPhase) => {
        const { currentProject } = get();
        if (currentProject) {
          set({ currentPhase: phase });
          // Update project's current phase
          get().updateProject(currentProject.id, { currentPhase: phase });
        }
      },

      validatePhase: async (phase: SpecificationPhase) => {
        const { setLoading, setError, updatePhaseValidation, documents } =
          get();
        setLoading('validation', true);
        setError('validation', null);

        try {
          const validation = await validationService.validatePhase(
            phase,
            documents
          );
          updatePhaseValidation(phase, validation);
          return validation;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Validation failed';
          setError('validation', errorMessage);
          throw error;
        } finally {
          setLoading('validation', false);
        }
      },

      canTransitionToPhase: (targetPhase: SpecificationPhase) => {
        const { currentPhase, phaseValidation } = get();

        // Define phase order
        const phaseOrder: SpecificationPhase[] = [
          'requirements',
          'design',
          'tasks',
          'implementation',
          'review',
          'completed',
        ];

        const currentIndex = phaseOrder.indexOf(currentPhase);
        const targetIndex = phaseOrder.indexOf(targetPhase);

        // Can always go to previous phases
        if (targetIndex <= currentIndex) {
          return true;
        }

        // Can only advance if previous phases are complete
        for (let i = 0; i < targetIndex; i++) {
          const phase = phaseOrder[i];
          const validation = phaseValidation[phase];
          if (!validation || !validation.isComplete) {
            return false;
          }
        }

        return true;
      },

      transitionToPhase: async (targetPhase: SpecificationPhase) => {
        const { setLoading, setError, canTransitionToPhase, setCurrentPhase } =
          get();

        if (!canTransitionToPhase(targetPhase)) {
          throw new Error(
            `Cannot transition to ${targetPhase}. Previous phases must be completed.`
          );
        }

        setLoading('phaseTransition', true);
        setError('phaseTransition', null);

        try {
          setCurrentPhase(targetPhase);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Phase transition failed';
          setError('phaseTransition', errorMessage);
          throw error;
        } finally {
          setLoading('phaseTransition', false);
        }
      },

      validatePhaseCompletion: async (phase: SpecificationPhase) => {
        const validation = await get().validatePhase(phase);
        return validation.isComplete;
      },

      // Document management actions
      updateRequirements: async (
        content: string,
        metadata?: Record<string, any>
      ) => {
        const { currentProject, markUnsaved } = get();
        if (!currentProject) return;

        // TODO: Replace with actual document update logic
        set(state => ({
          documents: {
            ...state.documents,
            requirements: {
              id: `req-${currentProject.id}`,
              projectId: currentProject.id,
              type: 'requirements',
              title: 'Requirements Document',
              content,
              version: 1,
              status: 'draft',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'current-user',
              lastModifiedBy: 'current-user',
              metadata: {
                wordCount: content.split(' ').length,
                estimatedReadTime: Math.ceil(content.split(' ').length / 200),
                completionPercentage: content.length > 100 ? 80 : 20,
                validationResults: [],
                tags: [],
                collaborators: [],
                ...metadata,
              },
            } as RequirementDocument,
          },
        }));

        markUnsaved();
      },

      updateDesign: async (content: string, metadata?: Record<string, any>) => {
        const { currentProject, markUnsaved } = get();
        if (!currentProject) return;

        // TODO: Replace with actual document update logic
        set(state => ({
          documents: {
            ...state.documents,
            design: {
              id: `design-${currentProject.id}`,
              projectId: currentProject.id,
              type: 'design',
              title: 'Design Document',
              content,
              version: 1,
              status: 'draft',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'current-user',
              lastModifiedBy: 'current-user',
              metadata: {
                wordCount: content.split(' ').length,
                estimatedReadTime: Math.ceil(content.split(' ').length / 200),
                completionPercentage: content.length > 100 ? 80 : 20,
                validationResults: [],
                tags: [],
                collaborators: [],
                ...metadata,
              },
            } as DesignDocument,
          },
        }));

        markUnsaved();
      },

      updateTasks: async (content: string, metadata?: Record<string, any>) => {
        const { currentProject, markUnsaved } = get();
        if (!currentProject) return;

        // TODO: Replace with actual document update logic
        set(state => ({
          documents: {
            ...state.documents,
            tasks: {
              id: `tasks-${currentProject.id}`,
              projectId: currentProject.id,
              type: 'tasks',
              title: 'Task Document',
              content,
              version: 1,
              status: 'draft',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'current-user',
              lastModifiedBy: 'current-user',
              metadata: {
                wordCount: content.split(' ').length,
                estimatedReadTime: Math.ceil(content.split(' ').length / 200),
                completionPercentage: content.length > 100 ? 80 : 20,
                validationResults: [],
                tags: [],
                collaborators: [],
                ...metadata,
              },
            } as TaskDocument,
          },
        }));

        markUnsaved();
      },

      saveDocument: async (type: 'requirements' | 'design' | 'tasks') => {
        const { setLoading, setError, documents, markSaved } = get();
        const document = documents[type];

        if (!document) return;

        setLoading('saving', true);
        setError('saving', null);

        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
          markSaved();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to save document';
          setError('saving', errorMessage);
          throw error;
        } finally {
          setLoading('saving', false);
        }
      },

      saveAllDocuments: async () => {
        const { saveDocument, documents } = get();
        const savePromises: Promise<void>[] = [];

        if (documents.requirements)
          savePromises.push(saveDocument('requirements'));
        if (documents.design) savePromises.push(saveDocument('design'));
        if (documents.tasks) savePromises.push(saveDocument('tasks'));

        await Promise.all(savePromises);
      },

      // Auto-save management
      enableAutoSave: () => {
        const { autoSave, saveAllDocuments, unsavedChanges } = get();

        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
        }

        autoSaveTimer = setInterval(() => {
          if (unsavedChanges) {
            saveAllDocuments().catch(console.error);
          }
        }, autoSave.interval);

        set(state => ({
          autoSave: { ...state.autoSave, enabled: true },
        }));
      },

      disableAutoSave: () => {
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
          autoSaveTimer = null;
        }

        set(state => ({
          autoSave: { ...state.autoSave, enabled: false },
        }));
      },

      configureAutoSave: (config: Partial<AutoSaveConfig>) => {
        set(state => ({
          autoSave: { ...state.autoSave, ...config },
        }));

        // Restart auto-save with new configuration
        if (get().autoSave.enabled) {
          get().disableAutoSave();
          get().enableAutoSave();
        }
      },

      markUnsaved: () => {
        set({ unsavedChanges: true });

        // Debounced auto-save trigger
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const { autoSave } = get();
        if (autoSave.enabled) {
          debounceTimer = setTimeout(() => {
            get().saveAllDocuments().catch(console.error);
          }, autoSave.debounceDelay);
        }
      },

      markSaved: () => {
        set({
          unsavedChanges: false,
          lastSaved: new Date(),
        });
      },

      // Validation actions
      validateDocument: async (type: 'requirements' | 'design' | 'tasks') => {
        const { setLoading, setError, documents } = get();
        const document = documents[type];

        if (!document) return [];

        setLoading('validation', true);
        setError('validation', null);

        try {
          let validationResults: ValidationResult[] = [];

          switch (type) {
            case 'requirements':
              if (document) {
                validationResults =
                  await validationService.validateRequirements(
                    document as RequirementDocument
                  );
              }
              break;
            case 'design':
              if (document) {
                validationResults = await validationService.validateDesign(
                  document as DesignDocument
                );
              }
              break;
            case 'tasks':
              if (document) {
                validationResults = await validationService.validateTasks(
                  document as TaskDocument
                );
              }
              break;
          }

          return validationResults;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Document validation failed';
          setError('validation', errorMessage);
          return [];
        } finally {
          setLoading('validation', false);
        }
      },

      validateAllDocuments: async () => {
        const { validateDocument, documents } = get();
        const results: Record<string, ValidationResult[]> = {};

        if (documents.requirements) {
          results.requirements = await validateDocument('requirements');
        }
        if (documents.design) {
          results.design = await validateDocument('design');
        }
        if (documents.tasks) {
          results.tasks = await validateDocument('tasks');
        }

        return results;
      },

      clearValidationResults: (phase?: SpecificationPhase) => {
        if (phase) {
          set(state => ({
            phaseValidation: {
              ...state.phaseValidation,
              [phase]: null,
            },
          }));
        } else {
          set({ phaseValidation: initialPhaseValidation });
        }
      },

      // Project persistence
      exportProject: async (projectId: string) => {
        const { projects, documents } = get();
        const project = projects.find(p => p.id === projectId);

        if (!project) {
          throw new Error('Project not found');
        }

        const exportData = {
          project,
          documents,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        };

        return JSON.stringify(exportData, null, 2);
      },

      importProject: async (projectData: string) => {
        try {
          const data = JSON.parse(projectData);
          const project: SpecificationProject = {
            ...data.project,
            id: `imported-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            projects: [...state.projects, project],
          }));

          return project;
        } catch (error) {
          throw new Error('Invalid project data format');
        }
      },

      // Error handling actions
      clearError: (key: keyof SpecificationErrorState) => {
        set(state => ({
          errors: { ...state.errors, [key]: null },
        }));
      },

      clearAllErrors: () => {
        set({ errors: initialErrorState });
      },

      // Internal actions
      setLoading: (key: keyof SpecificationLoadingState, loading: boolean) => {
        set(state => ({
          loading: { ...state.loading, [key]: loading },
        }));
      },

      setError: (key: keyof SpecificationErrorState, error: string | null) => {
        set(state => ({
          errors: { ...state.errors, [key]: error },
        }));
      },

      updatePhaseValidation: (
        phase: SpecificationPhase,
        validation: PhaseValidationResult
      ) => {
        set(state => ({
          phaseValidation: {
            ...state.phaseValidation,
            [phase]: validation,
          },
        }));
      },
    }),
    {
      name: 'specification-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist essential project data and settings
      partialize: state => ({
        projects: state.projects,
        currentProject: state.currentProject,
        currentPhase: state.currentPhase,
        autoSave: state.autoSave,
        documents: state.documents,
      }),
    }
  )
);

// Cleanup function for timers
export const cleanupSpecificationStore = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};

// Initialize auto-save on store creation
if (typeof window !== 'undefined') {
  const store = useSpecificationStore.getState();
  if (store.autoSave.enabled) {
    store.enableAutoSave();
  }
}

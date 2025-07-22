import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSpecificationStore } from '@/store/specificationStore';
import type {
  SpecificationProject,
  SpecificationPhase,
  RequirementDocument,
  DesignDocument,
  TaskDocument,
  ValidationResult,
  PhaseValidationResult,
} from '@/types/specifications';

// Context value interface
interface SpecificationContextValue {
  // Current state
  currentProject: SpecificationProject | null;
  currentPhase: SpecificationPhase;
  documents: {
    requirements: RequirementDocument | null;
    design: DesignDocument | null;
    tasks: TaskDocument | null;
  };

  // Validation and status
  phaseValidation: Record<SpecificationPhase, PhaseValidationResult | null>;
  unsavedChanges: boolean;
  lastSaved: Date | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isValidating: boolean;

  // Error states
  error: string | null;

  // Project actions
  createProject: (projectData: any) => Promise<SpecificationProject>;
  setCurrentProject: (project: SpecificationProject | null) => void;
  updateProject: (projectId: string, updates: any) => Promise<void>;

  // Phase actions
  setCurrentPhase: (phase: SpecificationPhase) => void;
  canTransitionToPhase: (targetPhase: SpecificationPhase) => boolean;
  transitionToPhase: (targetPhase: SpecificationPhase) => Promise<void>;
  validatePhase: (phase: SpecificationPhase) => Promise<PhaseValidationResult>;

  // Document actions
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

  // Validation actions
  validateDocument: (
    type: 'requirements' | 'design' | 'tasks'
  ) => Promise<ValidationResult[]>;
  validateAllDocuments: () => Promise<Record<string, ValidationResult[]>>;

  // Auto-save actions
  enableAutoSave: () => void;
  disableAutoSave: () => void;

  // Utility actions
  clearError: () => void;
}

// Create the context
const SpecificationContext = createContext<SpecificationContextValue | null>(
  null
);

// Context provider props
interface SpecificationProviderProps {
  children: ReactNode;
  projectId?: string; // Optional project ID to auto-load
}

// Context provider component
export const SpecificationProvider: React.FC<SpecificationProviderProps> = ({
  children,
  projectId,
}) => {
  const store = useSpecificationStore();

  // Auto-load project if projectId is provided
  useEffect(() => {
    if (
      projectId &&
      (!store.currentProject || store.currentProject.id !== projectId)
    ) {
      store.fetchProjectById(projectId).catch(console.error);
    }
  }, [projectId, store]);

  // Enable auto-save by default
  useEffect(() => {
    if (store.autoSave.enabled) {
      store.enableAutoSave();
    }

    // Cleanup on unmount
    return () => {
      store.disableAutoSave();
    };
  }, [store]);

  // Compute derived state
  const isLoading =
    store.loading.projects ||
    store.loading.currentProject ||
    store.loading.documents;
  const isSaving = store.loading.saving;
  const isValidating = store.loading.validation;
  const error =
    store.errors.projects ||
    store.errors.currentProject ||
    store.errors.documents ||
    store.errors.saving;

  // Context value
  const contextValue: SpecificationContextValue = {
    // Current state
    currentProject: store.currentProject,
    currentPhase: store.currentPhase,
    documents: store.documents,

    // Validation and status
    phaseValidation: store.phaseValidation,
    unsavedChanges: store.unsavedChanges,
    lastSaved: store.lastSaved,

    // Loading states
    isLoading,
    isSaving,
    isValidating,

    // Error states
    error,

    // Project actions
    createProject: store.createProject,
    setCurrentProject: store.setCurrentProject,
    updateProject: store.updateProject,

    // Phase actions
    setCurrentPhase: store.setCurrentPhase,
    canTransitionToPhase: store.canTransitionToPhase,
    transitionToPhase: store.transitionToPhase,
    validatePhase: store.validatePhase,

    // Document actions
    updateRequirements: store.updateRequirements,
    updateDesign: store.updateDesign,
    updateTasks: store.updateTasks,
    saveDocument: store.saveDocument,
    saveAllDocuments: store.saveAllDocuments,

    // Validation actions
    validateDocument: store.validateDocument,
    validateAllDocuments: store.validateAllDocuments,

    // Auto-save actions
    enableAutoSave: store.enableAutoSave,
    disableAutoSave: store.disableAutoSave,

    // Utility actions
    clearError: () => store.clearAllErrors(),
  };

  return (
    <SpecificationContext.Provider value={contextValue}>
      {children}
    </SpecificationContext.Provider>
  );
};

// Hook to use the specification context
export const useSpecification = (): SpecificationContextValue => {
  const context = useContext(SpecificationContext);

  if (!context) {
    throw new Error(
      'useSpecification must be used within a SpecificationProvider'
    );
  }

  return context;
};

// Hook for project management
export const useSpecificationProject = () => {
  const {
    currentProject,
    createProject,
    setCurrentProject,
    updateProject,
    isLoading,
    error,
    clearError,
  } = useSpecification();

  return {
    project: currentProject,
    createProject,
    setCurrentProject,
    updateProject,
    isLoading,
    error,
    clearError,
  };
};

// Hook for phase management
export const useSpecificationPhase = () => {
  const {
    currentPhase,
    phaseValidation,
    setCurrentPhase,
    canTransitionToPhase,
    transitionToPhase,
    validatePhase,
    isValidating,
  } = useSpecification();

  return {
    currentPhase,
    phaseValidation,
    setCurrentPhase,
    canTransitionToPhase,
    transitionToPhase,
    validatePhase,
    isValidating,
  };
};

// Hook for document management
export const useSpecificationDocuments = () => {
  const {
    documents,
    updateRequirements,
    updateDesign,
    updateTasks,
    saveDocument,
    saveAllDocuments,
    validateDocument,
    validateAllDocuments,
    unsavedChanges,
    lastSaved,
    isSaving,
    isValidating,
  } = useSpecification();

  return {
    documents,
    updateRequirements,
    updateDesign,
    updateTasks,
    saveDocument,
    saveAllDocuments,
    validateDocument,
    validateAllDocuments,
    unsavedChanges,
    lastSaved,
    isSaving,
    isValidating,
  };
};

// Hook for auto-save management
export const useSpecificationAutoSave = () => {
  const {
    enableAutoSave,
    disableAutoSave,
    unsavedChanges,
    lastSaved,
    isSaving,
  } = useSpecification();

  const store = useSpecificationStore();

  return {
    autoSaveEnabled: store.autoSave.enabled,
    autoSaveConfig: store.autoSave,
    enableAutoSave,
    disableAutoSave,
    configureAutoSave: store.configureAutoSave,
    unsavedChanges,
    lastSaved,
    isSaving,
  };
};

// Hook for validation management
export const useSpecificationValidation = () => {
  const {
    phaseValidation,
    validatePhase,
    validateDocument,
    validateAllDocuments,
    isValidating,
  } = useSpecification();

  const store = useSpecificationStore();

  return {
    phaseValidation,
    validatePhase,
    validateDocument,
    validateAllDocuments,
    clearValidationResults: store.clearValidationResults,
    isValidating,
  };
};

// Hook for error handling
export const useSpecificationError = () => {
  const { error, clearError } = useSpecification();
  const store = useSpecificationStore();

  return {
    error,
    errors: store.errors,
    clearError,
    clearAllErrors: store.clearAllErrors,
    clearSpecificError: store.clearError,
  };
};

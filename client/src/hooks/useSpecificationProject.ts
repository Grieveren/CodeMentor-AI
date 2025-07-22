import { useCallback, useEffect, useState } from 'react';
import { useSpecificationStore } from '@/store/specificationStore';
import type { 
  SpecificationProject,
  SpecificationPhase,
  ProjectStatus
} from '@/types/specifications';
import type { CreateProjectData, ProjectUpdates } from '@/store/specificationStore';

// Hook for managing specification projects
export const useSpecificationProject = (projectId?: string) => {
  const store = useSpecificationStore();
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Auto-load project if projectId is provided
  useEffect(() => {
    if (projectId && (!store.currentProject || store.currentProject.id !== projectId)) {
      store.fetchProjectById(projectId).catch((error) => {
        setLocalError(error.message);
      });
    }
  }, [projectId, store.currentProject?.id]);
  
  // Clear local error when store error changes
  useEffect(() => {
    if (store.errors.currentProject) {
      setLocalError(store.errors.currentProject);
    }
  }, [store.errors.currentProject]);
  
  // Create a new project
  const createProject = useCallback(async (projectData: CreateProjectData): Promise<SpecificationProject> => {
    setLocalError(null);
    try {
      return await store.createProject(projectData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setLocalError(errorMessage);
      throw error;
    }
  }, [store.createProject]);
  
  // Update current project
  const updateProject = useCallback(async (updates: ProjectUpdates): Promise<void> => {
    if (!store.currentProject) {
      throw new Error('No current project to update');
    }
    
    setLocalError(null);
    try {
      await store.updateProject(store.currentProject.id, updates);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      setLocalError(errorMessage);
      throw error;
    }
  }, [store.currentProject, store.updateProject]);
  
  // Delete current project
  const deleteProject = useCallback(async (): Promise<void> => {
    if (!store.currentProject) {
      throw new Error('No current project to delete');
    }
    
    setLocalError(null);
    try {
      await store.deleteProject(store.currentProject.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setLocalError(errorMessage);
      throw error;
    }
  }, [store.currentProject, store.deleteProject]);
  
  // Set current project
  const setCurrentProject = useCallback((project: SpecificationProject | null) => {
    setLocalError(null);
    store.setCurrentProject(project);
  }, [store.setCurrentProject]);
  
  // Update project status
  const updateProjectStatus = useCallback(async (status: ProjectStatus): Promise<void> => {
    await updateProject({ status });
  }, [updateProject]);
  
  // Update project phase
  const updateProjectPhase = useCallback(async (phase: SpecificationPhase): Promise<void> => {
    await updateProject({ currentPhase: phase });
  }, [updateProject]);
  
  // Clear error
  const clearError = useCallback(() => {
    setLocalError(null);
    store.clearError('currentProject');
  }, [store.clearError]);
  
  // Get project completion percentage
  const getProjectCompletion = useCallback((): number => {
    if (!store.currentProject) return 0;
    
    const { phaseValidation } = store;
    const phases: SpecificationPhase[] = ['requirements', 'design', 'tasks'];
    
    let completedPhases = 0;
    phases.forEach((phase) => {
      const validation = phaseValidation[phase];
      if (validation && validation.isComplete) {
        completedPhases++;
      }
    });
    
    return Math.round((completedPhases / phases.length) * 100);
  }, [store.currentProject, store.phaseValidation]);
  
  // Check if project can be completed
  const canCompleteProject = useCallback((): boolean => {
    const { phaseValidation } = store;
    const requiredPhases: SpecificationPhase[] = ['requirements', 'design', 'tasks'];
    
    return requiredPhases.every((phase) => {
      const validation = phaseValidation[phase];
      return validation && validation.isComplete;
    });
  }, [store.phaseValidation]);
  
  return {
    // Current state
    project: store.currentProject,
    projects: store.projects,
    currentPhase: store.currentPhase,
    
    // Loading and error states
    isLoading: store.loading.currentProject || store.loading.projects,
    error: localError || store.errors.currentProject || store.errors.projects,
    
    // Actions
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    updateProjectStatus,
    updateProjectPhase,
    fetchProjects: store.fetchProjects,
    
    // Utility functions
    getProjectCompletion,
    canCompleteProject,
    clearError,
  };
};

// Hook for managing project list
export const useSpecificationProjects = () => {
  const store = useSpecificationStore();
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Fetch projects on mount
  useEffect(() => {
    if (store.projects.length === 0) {
      store.fetchProjects().catch((error) => {
        setLocalError(error.message);
      });
    }
  }, []);
  
  // Clear local error when store error changes
  useEffect(() => {
    if (store.errors.projects) {
      setLocalError(store.errors.projects);
    }
  }, [store.errors.projects]);
  
  // Create a new project
  const createProject = useCallback(async (projectData: CreateProjectData): Promise<SpecificationProject> => {
    setLocalError(null);
    try {
      return await store.createProject(projectData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setLocalError(errorMessage);
      throw error;
    }
  }, [store.createProject]);
  
  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    setLocalError(null);
    try {
      await store.deleteProject(projectId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setLocalError(errorMessage);
      throw error;
    }
  }, [store.deleteProject]);
  
  // Refresh projects list
  const refreshProjects = useCallback(async (): Promise<void> => {
    setLocalError(null);
    try {
      await store.fetchProjects();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh projects';
      setLocalError(errorMessage);
      throw error;
    }
  }, [store.fetchProjects]);
  
  // Clear error
  const clearError = useCallback(() => {
    setLocalError(null);
    store.clearError('projects');
  }, [store.clearError]);
  
  // Filter projects by status
  const getProjectsByStatus = useCallback((status: ProjectStatus): SpecificationProject[] => {
    return store.projects.filter((project) => project.status === status);
  }, [store.projects]);
  
  // Filter projects by phase
  const getProjectsByPhase = useCallback((phase: SpecificationPhase): SpecificationProject[] => {
    return store.projects.filter((project) => project.currentPhase === phase);
  }, [store.projects]);
  
  // Get recent projects
  const getRecentProjects = useCallback((limit: number = 5): SpecificationProject[] => {
    return [...store.projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [store.projects]);
  
  return {
    // Current state
    projects: store.projects,
    
    // Loading and error states
    isLoading: store.loading.projects,
    error: localError || store.errors.projects,
    
    // Actions
    createProject,
    deleteProject,
    refreshProjects,
    
    // Utility functions
    getProjectsByStatus,
    getProjectsByPhase,
    getRecentProjects,
    clearError,
  };
};
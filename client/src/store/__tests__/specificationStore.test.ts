import { renderHook, act } from '@testing-library/react';
import { useSpecificationStore, cleanupSpecificationStore } from '../specificationStore';
import type { CreateProjectData } from '../specificationStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock timers
jest.useFakeTimers();

describe('useSpecificationStore', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset store state completely
    useSpecificationStore.setState((state) => ({
      ...state,
      projects: [],
      currentProject: null,
      currentPhase: 'requirements',
      documents: {
        requirements: null,
        design: null,
        tasks: null,
      },
      phaseValidation: {
        requirements: null,
        design: null,
        tasks: null,
        implementation: null,
        review: null,
        completed: null,
      },
      unsavedChanges: false,
      lastSaved: null,
      autoSave: {
        enabled: true,
        interval: 30000,
        debounceDelay: 2000,
      },
      loading: {
        projects: false,
        currentProject: false,
        documents: false,
        validation: false,
        saving: false,
        phaseTransition: false,
      },
      errors: {
        projects: null,
        currentProject: null,
        documents: null,
        validation: null,
        saving: null,
        phaseTransition: null,
      },
    }));
  });

  afterEach(() => {
    cleanupSpecificationStore();
    jest.clearAllTimers();
  });

  describe('Project Management', () => {
    it('should create a new project', async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
      };

      await act(async () => {
        const project = await result.current.createProject(projectData);
        
        expect(project).toMatchObject({
          name: 'Test Project',
          description: 'A test project',
          domain: 'web',
          complexity: 'simple',
          methodology: 'agile',
          status: 'planning',
          currentPhase: 'requirements',
        });
        
        expect(result.current.projects).toHaveLength(1);
        expect(result.current.currentProject).toEqual(project);
      });
    });

    it('should update a project', async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      // First create a project
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
      };

      let project;
      await act(async () => {
        project = await result.current.createProject(projectData);
      });

      // Then update it
      await act(async () => {
        await result.current.updateProject(project.id, {
          name: 'Updated Project',
          status: 'active',
        });
      });

      expect(result.current.currentProject?.name).toBe('Updated Project');
      expect(result.current.currentProject?.status).toBe('active');
    });

    it('should delete a project', async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      // First create a project
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
      };

      let project;
      await act(async () => {
        project = await result.current.createProject(projectData);
      });

      expect(result.current.projects).toHaveLength(1);

      // Then delete it
      await act(async () => {
        await result.current.deleteProject(project.id);
      });

      expect(result.current.projects).toHaveLength(0);
      expect(result.current.currentProject).toBeNull();
    });

    it('should set current project', () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple' as const,
        methodology: 'agile' as const,
        status: 'planning' as const,
        currentPhase: 'requirements' as const,
        documents: [],
        team: [],
        settings: {
          visibility: 'private' as const,
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

      act(() => {
        result.current.setCurrentProject(mockProject);
      });

      expect(result.current.currentProject).toEqual(mockProject);
      expect(result.current.currentPhase).toBe('requirements');
    });
  });

  describe('Phase Management', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
      };

      await act(async () => {
        await result.current.createProject(projectData);
      });
    });

    it('should set current phase', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.setCurrentPhase('design');
      });

      expect(result.current.currentPhase).toBe('design');
    });

    it('should validate phase completion', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      await act(async () => {
        const validation = await result.current.validatePhase('requirements');
        
        expect(validation).toMatchObject({
          phase: 'requirements',
          isValid: true,
          isComplete: true,
          validationResults: [],
          completionPercentage: 100,
          requiredFields: [],
          missingFields: [],
        });
      });
    });

    it('should check if can transition to phase', () => {
      const { result } = renderHook(() => useSpecificationStore());

      // Should be able to transition to same or previous phase
      expect(result.current.canTransitionToPhase('requirements')).toBe(true);
      
      // Should not be able to transition to future phase without completion
      expect(result.current.canTransitionToPhase('design')).toBe(false);
    });

    it('should transition to phase when allowed', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      // Mock phase validation to allow transition
      act(() => {
        result.current.updatePhaseValidation('requirements', {
          phase: 'requirements',
          isValid: true,
          isComplete: true,
          validationResults: [],
          completionPercentage: 100,
          requiredFields: [],
          missingFields: [],
        });
      });

      await act(async () => {
        await result.current.transitionToPhase('design');
      });

      expect(result.current.currentPhase).toBe('design');
    });
  });

  describe('Document Management', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
      };

      await act(async () => {
        await result.current.createProject(projectData);
      });
    });

    it('should update requirements document', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      await act(async () => {
        await result.current.updateRequirements('# Requirements\n\nTest requirements content');
      });

      expect(result.current.documents.requirements).toBeTruthy();
      expect(result.current.documents.requirements?.content).toBe('# Requirements\n\nTest requirements content');
      expect(result.current.unsavedChanges).toBe(true);
    });

    it('should update design document', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      await act(async () => {
        await result.current.updateDesign('# Design\n\nTest design content');
      });

      expect(result.current.documents.design).toBeTruthy();
      expect(result.current.documents.design?.content).toBe('# Design\n\nTest design content');
      expect(result.current.unsavedChanges).toBe(true);
    });

    it('should update tasks document', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      await act(async () => {
        await result.current.updateTasks('# Tasks\n\nTest tasks content');
      });

      expect(result.current.documents.tasks).toBeTruthy();
      expect(result.current.documents.tasks?.content).toBe('# Tasks\n\nTest tasks content');
      expect(result.current.unsavedChanges).toBe(true);
    });

    it('should save document', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      // First update a document
      await act(async () => {
        await result.current.updateRequirements('# Requirements\n\nTest content');
      });

      expect(result.current.unsavedChanges).toBe(true);

      // Then save it
      await act(async () => {
        await result.current.saveDocument('requirements');
      });

      expect(result.current.unsavedChanges).toBe(false);
      expect(result.current.lastSaved).toBeTruthy();
    });

    it('should validate document', async () => {
      const { result } = renderHook(() => useSpecificationStore());

      // First update a document
      await act(async () => {
        await result.current.updateRequirements('# Requirements\n\nTest content');
      });

      // Then validate it
      await act(async () => {
        const validationResults = await result.current.validateDocument('requirements');
        expect(Array.isArray(validationResults)).toBe(true);
      });
    });
  });

  describe('Auto-save Management', () => {
    it('should enable auto-save', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.enableAutoSave();
      });

      expect(result.current.autoSave.enabled).toBe(true);
    });

    it('should disable auto-save', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.disableAutoSave();
      });

      expect(result.current.autoSave.enabled).toBe(false);
    });

    it('should configure auto-save', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.configureAutoSave({
          interval: 60000,
          debounceDelay: 5000,
        });
      });

      expect(result.current.autoSave.interval).toBe(60000);
      expect(result.current.autoSave.debounceDelay).toBe(5000);
    });

    it('should mark document as unsaved', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.markUnsaved();
      });

      expect(result.current.unsavedChanges).toBe(true);
    });

    it('should mark document as saved', () => {
      const { result } = renderHook(() => useSpecificationStore());

      // First mark as unsaved
      act(() => {
        result.current.markUnsaved();
      });

      expect(result.current.unsavedChanges).toBe(true);

      // Then mark as saved
      act(() => {
        result.current.markSaved();
      });

      expect(result.current.unsavedChanges).toBe(false);
      expect(result.current.lastSaved).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.setError('projects', 'Test error');
      });

      expect(result.current.errors.projects).toBe('Test error');

      act(() => {
        result.current.clearError('projects');
      });

      expect(result.current.errors.projects).toBeNull();
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.setError('projects', 'Test error 1');
        result.current.setError('currentProject', 'Test error 2');
      });

      expect(result.current.errors.projects).toBe('Test error 1');
      expect(result.current.errors.currentProject).toBe('Test error 2');

      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.errors.projects).toBeNull();
      expect(result.current.errors.currentProject).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('should set and manage loading states', () => {
      const { result } = renderHook(() => useSpecificationStore());

      act(() => {
        result.current.setLoading('projects', true);
      });

      expect(result.current.loading.projects).toBe(true);

      act(() => {
        result.current.setLoading('projects', false);
      });

      expect(result.current.loading.projects).toBe(false);
    });
  });

  describe('Project Export/Import', () => {
    it('should export project', async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      // First create a project
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
      };

      let project;
      await act(async () => {
        project = await result.current.createProject(projectData);
      });

      // Then export it
      await act(async () => {
        const exportData = await result.current.exportProject(project.id);
        
        expect(typeof exportData).toBe('string');
        
        const parsed = JSON.parse(exportData);
        expect(parsed.project).toBeTruthy();
        expect(parsed.documents).toBeTruthy();
        expect(parsed.exportedAt).toBeTruthy();
        expect(parsed.version).toBe('1.0');
      });
    });

    it('should import project', async () => {
      const { result } = renderHook(() => useSpecificationStore());
      
      const mockExportData = {
        project: {
          id: 'original-id',
          name: 'Imported Project',
          description: 'An imported project',
          domain: 'web',
          complexity: 'simple',
          methodology: 'agile',
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        documents: {},
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      await act(async () => {
        const importedProject = await result.current.importProject(JSON.stringify(mockExportData));
        
        expect(importedProject.name).toBe('Imported Project');
        expect(importedProject.id).not.toBe('original-id'); // Should get new ID
        expect(result.current.projects).toContainEqual(importedProject);
      });
    });
  });
});
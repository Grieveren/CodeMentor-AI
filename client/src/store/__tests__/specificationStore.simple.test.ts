import { useSpecificationStore } from '../specificationStore';
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

describe('SpecificationStore Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should have initial state', () => {
    const store = useSpecificationStore.getState();
    
    expect(store.projects).toEqual([]);
    expect(store.currentProject).toBeNull();
    expect(store.currentPhase).toBe('requirements');
    expect(store.documents.requirements).toBeNull();
    expect(store.documents.design).toBeNull();
    expect(store.documents.tasks).toBeNull();
  });

  it('should create a project', async () => {
    const store = useSpecificationStore.getState();
    
    const projectData: CreateProjectData = {
      name: 'Test Project',
      description: 'A test project',
      domain: 'web',
      complexity: 'simple',
      methodology: 'agile',
    };

    const project = await store.createProject(projectData);
    
    expect(project).toBeDefined();
    expect(project.name).toBe('Test Project');
    expect(project.description).toBe('A test project');
    
    const updatedStore = useSpecificationStore.getState();
    expect(updatedStore.projects).toHaveLength(1);
    expect(updatedStore.currentProject).toEqual(project);
  });

  it('should update requirements document', async () => {
    const store = useSpecificationStore.getState();
    
    // First create a project
    const projectData: CreateProjectData = {
      name: 'Test Project',
      description: 'A test project',
      domain: 'web',
      complexity: 'simple',
      methodology: 'agile',
    };

    await store.createProject(projectData);
    
    // Then update requirements
    await store.updateRequirements('# Requirements\n\nTest content');
    
    const updatedStore = useSpecificationStore.getState();
    expect(updatedStore.documents.requirements).toBeTruthy();
    expect(updatedStore.documents.requirements?.content).toBe('# Requirements\n\nTest content');
    expect(updatedStore.unsavedChanges).toBe(true);
  });

  it('should manage phase transitions', () => {
    const store = useSpecificationStore.getState();
    
    // Initially should be in requirements phase
    expect(store.currentPhase).toBe('requirements');
    
    // Should be able to check phase transition capability
    expect(store.canTransitionToPhase('requirements')).toBe(true);
    expect(store.canTransitionToPhase('design')).toBe(false); // No completed requirements
  });

  it('should handle auto-save configuration', () => {
    const store = useSpecificationStore.getState();
    
    expect(store.autoSave.enabled).toBe(true);
    expect(store.autoSave.interval).toBe(30000);
    
    store.configureAutoSave({ interval: 60000 });
    
    const updatedStore = useSpecificationStore.getState();
    expect(updatedStore.autoSave.interval).toBe(60000);
  });
});
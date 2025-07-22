import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhaseManager } from '../PhaseManager';
import { SpecificationProvider } from '@/contexts/SpecificationContext';
import { useSpecificationStore } from '@/store/specificationStore';

// Mock the store
jest.mock('@/store/specificationStore');
const mockUseSpecificationStore = useSpecificationStore as jest.MockedFunction<typeof useSpecificationStore>;

// Mock validation service
jest.mock('@/services/validationService', () => ({
  validationService: {
    validatePhase: jest.fn(),
  },
}));

// Test wrapper with context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SpecificationProvider>
    {children}
  </SpecificationProvider>
);

describe('PhaseManager', () => {
  const mockStore = {
    currentPhase: 'requirements' as const,
    phaseValidation: {
      requirements: {
        phase: 'requirements' as const,
        isValid: true,
        isComplete: true,
        validationResults: [],
        completionPercentage: 100,
        requiredFields: ['user stories', 'acceptance criteria'],
        missingFields: [],
      },
      design: null,
      tasks: null,
      implementation: null,
      review: null,
      completed: null,
    },
    setCurrentPhase: jest.fn(),
    canTransitionToPhase: jest.fn(),
    transitionToPhase: jest.fn(),
    validatePhase: jest.fn(),
    loading: {
      validation: false,
      projects: false,
      currentProject: false,
      documents: false,
      saving: false,
      phaseTransition: false,
    },
    clearValidationResults: jest.fn(),
    // Add other required store properties
    projects: [],
    currentProject: null,
    documents: {
      requirements: null,
      design: null,
      tasks: null,
    },
    unsavedChanges: false,
    lastSaved: null,
    autoSave: {
      enabled: true,
      interval: 30000,
      debounceDelay: 2000,
    },
    errors: {
      projects: null,
      currentProject: null,
      documents: null,
      validation: null,
      saving: null,
      phaseTransition: null,
    },
    // Add missing methods
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    fetchProjects: jest.fn(),
    fetchProjectById: jest.fn(),
    setCurrentProject: jest.fn(),
    updateRequirements: jest.fn(),
    updateDesign: jest.fn(),
    updateTasks: jest.fn(),
    saveDocument: jest.fn(),
    saveAllDocuments: jest.fn(),
    enableAutoSave: jest.fn(),
    disableAutoSave: jest.fn(),
    configureAutoSave: jest.fn(),
    markUnsaved: jest.fn(),
    markSaved: jest.fn(),
    validateDocument: jest.fn(),
    validateAllDocuments: jest.fn(),
    exportProject: jest.fn(),
    importProject: jest.fn(),
    clearError: jest.fn(),
    clearAllErrors: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    updatePhaseValidation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSpecificationStore.mockReturnValue(mockStore as any);
  });

  it('should render phase navigation', () => {
    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    // Should show all phases
    expect(screen.getAllByText('Requirements')).toHaveLength(2); // Navigation + current phase
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Implementation')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should highlight current phase', () => {
    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    const requirementsButton = screen.getByText('Requirements').closest('button');
    expect(requirementsButton).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700');
  });

  it('should show completion status for completed phases', () => {
    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    // Should show completion percentage for current phase
    expect(screen.getByText('100% complete')).toBeInTheDocument();
  });

  it('should show current phase information', () => {
    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    // Should show current phase details
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.getByText('Define project scope and user needs')).toBeInTheDocument();
    expect(screen.getByText('Required Elements:')).toBeInTheDocument();
    expect(screen.getByText('user stories')).toBeInTheDocument();
    expect(screen.getByText('acceptance criteria')).toBeInTheDocument();
  });

  it('should allow phase validation', async () => {
    const user = userEvent.setup();
    const mockValidatePhase = jest.fn().mockResolvedValue({
      phase: 'requirements',
      isValid: true,
      isComplete: true,
      validationResults: [],
      completionPercentage: 100,
      requiredFields: [],
      missingFields: [],
    });

    mockUseSpecificationStore.mockReturnValue({
      ...mockStore,
      validatePhase: mockValidatePhase,
    } as any);

    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    const validateButton = screen.getByText('Validate Phase');
    await user.click(validateButton);

    expect(mockValidatePhase).toHaveBeenCalledWith('requirements');
  });

  it('should show validation results', async () => {
    const user = userEvent.setup();
    const mockValidatePhase = jest.fn().mockResolvedValue({
      phase: 'requirements',
      isValid: false,
      isComplete: false,
      validationResults: [
        {
          id: 'test-error',
          type: 'completeness',
          severity: 'error',
          message: 'Test error message',
          rule: 'test-rule',
        },
        {
          id: 'test-warning',
          type: 'format',
          severity: 'warning',
          message: 'Test warning message',
          suggestion: 'Test suggestion',
          rule: 'test-rule',
        },
      ],
      completionPercentage: 50,
      requiredFields: [],
      missingFields: [],
    });

    mockUseSpecificationStore.mockReturnValue({
      ...mockStore,
      validatePhase: mockValidatePhase,
    } as any);

    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    const validateButton = screen.getByText('Validate Phase');
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText('Validation Results:')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Test warning message')).toBeInTheDocument();
      expect(screen.getByText('Suggestion: Test suggestion')).toBeInTheDocument();
    });
  });

  it('should handle phase transitions', async () => {
    const user = userEvent.setup();
    const mockCanTransitionToPhase = jest.fn().mockReturnValue(true);
    const mockTransitionToPhase = jest.fn().mockResolvedValue(undefined);

    mockUseSpecificationStore.mockReturnValue({
      ...mockStore,
      canTransitionToPhase: mockCanTransitionToPhase,
      transitionToPhase: mockTransitionToPhase,
    } as any);

    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    const designButton = screen.getByText('Design').closest('button');
    await user.click(designButton!);

    expect(mockCanTransitionToPhase).toHaveBeenCalledWith('design');
    expect(mockTransitionToPhase).toHaveBeenCalledWith('design');
  });

  it('should show transition modal when transition is not allowed', async () => {
    const user = userEvent.setup();
    const mockCanTransitionToPhase = jest.fn().mockReturnValue(false);

    mockUseSpecificationStore.mockReturnValue({
      ...mockStore,
      canTransitionToPhase: mockCanTransitionToPhase,
      phaseValidation: {
        ...mockStore.phaseValidation,
        requirements: {
          ...mockStore.phaseValidation.requirements!,
          isComplete: false,
        },
      },
    } as any);

    render(
      <TestWrapper>
        <PhaseManager allowPhaseSkipping={false} />
      </TestWrapper>
    );

    const tasksButton = screen.getByText('Tasks').closest('button');
    await user.click(tasksButton!);

    await waitFor(() => {
      expect(screen.getByText('Phase Transition Not Allowed')).toBeInTheDocument();
      expect(screen.getByText(/You cannot transition to/)).toBeInTheDocument();
    });
  });

  it('should show loading state during validation', () => {
    mockUseSpecificationStore.mockReturnValue({
      ...mockStore,
      loading: {
        ...mockStore.loading,
        validation: true,
      },
    } as any);

    render(
      <TestWrapper>
        <PhaseManager />
      </TestWrapper>
    );

    expect(screen.getByText('Validating...')).toBeInTheDocument();
  });

  it('should disable validation when showValidation is false', () => {
    render(
      <TestWrapper>
        <PhaseManager showValidation={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Validate Phase')).not.toBeInTheDocument();
  });

  it('should allow phase skipping when allowPhaseSkipping is true', async () => {
    const user = userEvent.setup();
    const mockCanTransitionToPhase = jest.fn().mockReturnValue(false);
    const mockTransitionToPhase = jest.fn().mockResolvedValue(undefined);

    mockUseSpecificationStore.mockReturnValue({
      ...mockStore,
      canTransitionToPhase: mockCanTransitionToPhase,
      transitionToPhase: mockTransitionToPhase,
    } as any);

    render(
      <TestWrapper>
        <PhaseManager allowPhaseSkipping={true} />
      </TestWrapper>
    );

    const tasksButton = screen.getByText('Tasks').closest('button');
    await user.click(tasksButton!);

    // Should transition directly without showing modal
    expect(mockTransitionToPhase).toHaveBeenCalledWith('tasks');
    expect(screen.queryByText('Phase Transition Not Allowed')).not.toBeInTheDocument();
  });
});
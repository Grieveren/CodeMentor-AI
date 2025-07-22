import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCreationForm } from '../ProjectCreationForm';

// Mock the hooks and services
jest.mock('@/hooks/useSpecificationProject');
jest.mock('@/services/templatesService');
jest.mock('@/utils/config', () => ({
  config: {
    api: {
      baseUrl: 'http://localhost:3001',
      wsBaseUrl: 'ws://localhost:3001',
      timeout: 10000,
    },
  },
}));

import { useSpecificationProject } from '@/hooks/useSpecificationProject';
import { templatesService } from '@/services/templatesService';

const mockUseSpecificationProject = useSpecificationProject as jest.MockedFunction<typeof useSpecificationProject>;
const mockTemplatesService = templatesService as jest.Mocked<typeof templatesService>;

// Mock templates data
const mockTemplates = [
  {
    id: 'web-app-basic',
    name: 'Basic Web Application',
    description: 'Template for a simple web application',
    category: 'web_application',
    type: 'requirements' as const,
    content: '# Requirements Template',
    variables: [],
    examples: [],
    metadata: {
      version: '1.0',
      author: 'CodeMentor AI',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 150,
      rating: 4.5,
      tags: ['web', 'authentication'],
      prerequisites: ['HTML', 'CSS'],
    },
  },
];

describe('ProjectCreationForm', () => {
  const mockCreateProject = jest.fn();
  const mockClearError = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseSpecificationProject.mockReturnValue({
      createProject: mockCreateProject,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      project: null,
      projects: [],
      currentPhase: 'requirements',
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      setCurrentProject: jest.fn(),
      updateProjectStatus: jest.fn(),
      updateProjectPhase: jest.fn(),
      fetchProjects: jest.fn(),
      getProjectCompletion: jest.fn(),
      canCompleteProject: jest.fn(),
    });

    mockTemplatesService.getTemplates.mockResolvedValue(mockTemplates);
  });

  it('should render the form when open', () => {
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Specification Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ProjectCreationForm
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create New Specification Project')).not.toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create project/i });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
      expect(screen.getByText('Project description is required')).toBeInTheDocument();
      expect(screen.getByText('Domain is required')).toBeInTheDocument();
    });

    // Should not call createProject
    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  it('should validate field lengths', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill with invalid lengths
    await user.type(screen.getByLabelText('Project Name'), 'AB'); // Too short
    await user.type(screen.getByLabelText('Description'), 'Short'); // Too short

    const submitButton = screen.getByRole('button', { name: /create project/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Project name must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('should load and display templates when domain is selected', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Select a domain
    const domainSelect = screen.getByLabelText('Domain');
    await user.selectOptions(domainSelect, 'web');

    // Wait for templates to load
    await waitFor(() => {
      expect(mockTemplatesService.getTemplates).toHaveBeenCalled();
      expect(screen.getByText('Template Selection (Optional)')).toBeInTheDocument();
      expect(screen.getByText('Basic Web Application')).toBeInTheDocument();
    });
  });

  it('should allow template selection', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Select domain to show templates
    const domainSelect = screen.getByLabelText('Domain');
    await user.selectOptions(domainSelect, 'web');

    // Wait for templates to load and click on a template
    await waitFor(() => {
      expect(screen.getByText('Basic Web Application')).toBeInTheDocument();
    });

    const templateCard = screen.getByText('Basic Web Application').closest('div');
    await user.click(templateCard!);

    // Should show template selected message
    await waitFor(() => {
      expect(screen.getByText(/Template "Basic Web Application" selected/)).toBeInTheDocument();
    });
  });

  it('should show template preview', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Select domain to show templates
    const domainSelect = screen.getByLabelText('Domain');
    await user.selectOptions(domainSelect, 'web');

    // Wait for templates to load and click preview button
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    const previewButton = screen.getByText('Preview');
    await user.click(previewButton);

    // Should show preview modal
    await waitFor(() => {
      expect(screen.getByText('Template Preview: Basic Web Application')).toBeInTheDocument();
      expect(screen.getByText('Prerequisites')).toBeInTheDocument();
    });
  });

  it('should create project with valid data', async () => {
    const user = userEvent.setup();
    const mockProject = { id: 'project-123', name: 'Test Project' };
    mockCreateProject.mockResolvedValue(mockProject as any);
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill in valid form data
    await user.type(screen.getByLabelText('Project Name'), 'Test Project');
    await user.type(screen.getByLabelText('Description'), 'This is a test project description');
    await user.selectOptions(screen.getByLabelText('Domain'), 'web');

    // Select complexity and methodology (they have default values but let's be explicit)
    const complexityRadio = screen.getByRole('radio', { name: /simple/i });
    await user.click(complexityRadio);

    const methodologyRadio = screen.getByRole('radio', { name: /agile/i });
    await user.click(methodologyRadio);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create project/i });
    await user.click(submitButton);

    // Should call createProject with correct data
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'This is a test project description',
        domain: 'web',
        complexity: 'simple',
        methodology: 'agile',
        templateId: undefined,
      });
    });

    // Should call success callback and close modal
    expect(mockOnSuccess).toHaveBeenCalledWith('project-123');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle creation errors', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to create project';
    mockUseSpecificationProject.mockReturnValue({
      createProject: mockCreateProject,
      isLoading: false,
      error: errorMessage,
      clearError: mockClearError,
      project: null,
      projects: [],
      currentPhase: 'requirements',
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      setCurrentProject: jest.fn(),
      updateProjectStatus: jest.fn(),
      updateProjectPhase: jest.fn(),
      fetchProjects: jest.fn(),
      getProjectCompletion: jest.fn(),
      canCompleteProject: jest.fn(),
    });
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Should display error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show loading state during creation', () => {
    mockUseSpecificationProject.mockReturnValue({
      createProject: mockCreateProject,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      project: null,
      projects: [],
      currentPhase: 'requirements',
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      setCurrentProject: jest.fn(),
      updateProjectStatus: jest.fn(),
      updateProjectPhase: jest.fn(),
      fetchProjects: jest.fn(),
      getProjectCompletion: jest.fn(),
      canCompleteProject: jest.fn(),
    });
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Should show loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    
    // Submit button should be disabled
    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDisabled();
  });

  it('should close modal and reset form on cancel', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCreationForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill some data
    await user.type(screen.getByLabelText('Project Name'), 'Test');

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should call onClose and clearError
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockClearError).toHaveBeenCalled();
  });
});
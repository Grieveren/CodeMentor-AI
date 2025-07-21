import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequirementsEditor } from '../RequirementsEditor';

// Mock Monaco Editor before using it in jest.mock
jest.mock('@monaco-editor/react', () => {
  const React = require('react');

  const MockEditor = (props: any) => {
    React.useEffect(() => {
      if (props.onMount) {
        const mockEditor = {
          updateOptions: jest.fn(),
          getModel: () => ({ setValue: jest.fn() }),
        };
        props.onMount(mockEditor);
      }
    }, [props.onMount]);

    return React.createElement('textarea', {
      'data-testid': 'monaco-editor',
      value: props.value,
      onChange: (e: any) => props.onChange?.(e.target.value),
      style: { width: '100%', height: '400px' },
    });
  };

  return {
    __esModule: true,
    default: MockEditor,
  };
});

describe('RequirementsEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnValidate = jest.fn();
  const mockOnAIReview = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default template when no document provided', () => {
    render(
      <RequirementsEditor
        document={null}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
      />
    );

    expect(screen.getByText('Requirements Editor')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Validate EARS')).toBeInTheDocument();
  });

  it('renders with existing document content', () => {
    const mockDocument = {
      id: '1',
      projectId: 'project-1',
      content: '# Test Requirements\n\nTest content',
      userStories: [],
      acceptanceCriteria: [],
      isComplete: false,
      validationResults: [],
      lastModified: new Date().toISOString(),
    };

    render(
      <RequirementsEditor
        document={mockDocument}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
      />
    );

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue('# Test Requirements\n\nTest content');
  });

  it('shows complete badge when document is complete', () => {
    const mockDocument = {
      id: '1',
      projectId: 'project-1',
      content: 'Test content',
      userStories: [],
      acceptanceCriteria: [],
      isComplete: true,
      validationResults: [],
      lastModified: new Date().toISOString(),
    };

    render(
      <RequirementsEditor
        document={mockDocument}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
      />
    );

    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <RequirementsEditor
        document={null}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
      />
    );

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.stringContaining('# Requirements Document')
      );
    });
  });

  it('calls onValidate when validate button is clicked', async () => {
    const mockValidationResults = [
      {
        type: 'warning',
        message: 'Consider using EARS format',
        line: 5,
      },
    ];

    mockOnValidate.mockResolvedValue(mockValidationResults);

    render(
      <RequirementsEditor
        document={null}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
      />
    );

    const validateButton = screen.getByText('Validate EARS');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockOnValidate).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('1 warning')).toBeInTheDocument();
      expect(
        screen.getByText('Consider using EARS format')
      ).toBeInTheDocument();
    });
  });

  it('shows AI Review button when onAIReview is provided', () => {
    render(
      <RequirementsEditor
        document={null}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
        onAIReview={mockOnAIReview}
      />
    );

    expect(screen.getByText('AI Review')).toBeInTheDocument();
  });

  it('shows templates panel when templates button is clicked', () => {
    render(
      <RequirementsEditor
        document={null}
        onSave={mockOnSave}
        onValidate={mockOnValidate}
      />
    );

    const templatesButton = screen.getByText('Templates');
    fireEvent.click(templatesButton);

    expect(screen.getByText('Requirements Templates')).toBeInTheDocument();
    expect(screen.getByText('Default Template')).toBeInTheDocument();
  });
});

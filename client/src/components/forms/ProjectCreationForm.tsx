import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useSpecificationProject } from '@/hooks/useSpecificationProject';
import { templatesService } from '@/services/templatesService';
import type { CreateProjectData } from '@/store/specificationStore';
import type { SpecificationTemplate } from '@/types/specifications';

// Form validation schema
const projectCreationSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Project description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  domain: z.string().min(1, 'Domain is required'),
  complexity: z.enum(['simple', 'moderate', 'complex', 'enterprise'], {
    required_error: 'Complexity level is required',
  }),
  methodology: z.enum(['waterfall', 'agile', 'lean', 'hybrid'], {
    required_error: 'Methodology is required',
  }),
  templateId: z.string().optional(),
});

type ProjectCreationFormData = z.infer<typeof projectCreationSchema>;

// Domain options
const domainOptions = [
  { value: 'web', label: 'Web Application' },
  { value: 'mobile', label: 'Mobile Application' },
  { value: 'api', label: 'API Service' },
  { value: 'desktop', label: 'Desktop Application' },
  { value: 'data', label: 'Data Pipeline' },
  { value: 'ml', label: 'Machine Learning' },
  { value: 'other', label: 'Other' },
];

// Complexity options with descriptions
const complexityOptions = [
  {
    value: 'simple' as const,
    label: 'Simple',
    description: 'Basic functionality, single user, minimal integrations',
    color: 'green' as const,
  },
  {
    value: 'moderate' as const,
    label: 'Moderate',
    description: 'Multiple features, user management, some integrations',
    color: 'blue' as const,
  },
  {
    value: 'complex' as const,
    label: 'Complex',
    description: 'Advanced features, multiple user roles, many integrations',
    color: 'yellow' as const,
  },
  {
    value: 'enterprise' as const,
    label: 'Enterprise',
    description: 'Large scale, high availability, complex architecture',
    color: 'red' as const,
  },
];

// Methodology options with descriptions
const methodologyOptions = [
  {
    value: 'waterfall' as const,
    label: 'Waterfall',
    description: 'Sequential phases, detailed upfront planning',
  },
  {
    value: 'agile' as const,
    label: 'Agile',
    description: 'Iterative development, flexible requirements',
  },
  {
    value: 'lean' as const,
    label: 'Lean',
    description: 'Minimize waste, continuous improvement',
  },
  {
    value: 'hybrid' as const,
    label: 'Hybrid',
    description: 'Combination of methodologies as needed',
  },
];

interface ProjectCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createProject, isLoading, error, clearError } =
    useSpecificationProject();
  const [selectedTemplate, setSelectedTemplate] =
    useState<SpecificationTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templates, setTemplates] = useState<SpecificationTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<ProjectCreationFormData>({
    resolver: zodResolver(projectCreationSchema),
    mode: 'onChange',
    defaultValues: {
      complexity: 'simple',
      methodology: 'agile',
    },
  });

  const watchedDomain = watch('domain');

  // Load templates when component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const allTemplates = await templatesService.getTemplates();
        setTemplates(allTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setTemplatesLoading(false);
      }
    };

    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  // Filter templates based on selected domain
  const filteredTemplates = templates.filter(template => {
    if (!watchedDomain) return true;
    return (
      template.category.includes(watchedDomain) ||
      template.metadata.tags.includes(watchedDomain)
    );
  });

  const onSubmit = async (data: ProjectCreationFormData) => {
    clearError();

    try {
      const projectData: CreateProjectData = {
        name: data.name,
        description: data.description,
        domain: data.domain,
        complexity: data.complexity,
        methodology: data.methodology,
        templateId: data.templateId,
      };

      const project = await createProject(projectData);

      // Reset form and close modal
      reset();
      setSelectedTemplate(null);
      onClose();

      // Call success callback with project ID
      if (onSuccess) {
        onSuccess(project.id);
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to create project:', err);
    }
  };

  const handleTemplateSelect = (template: SpecificationTemplate) => {
    setSelectedTemplate(template);
    setValue('templateId', template.id);
  };

  const handleTemplatePreview = (template: SpecificationTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleClose = () => {
    reset();
    setSelectedTemplate(null);
    setShowTemplatePreview(false);
    setTemplates([]);
    clearError();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create New Specification Project"
        size="large"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Project Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Project Information
            </h3>

            <div>
              <Input
                label="Project Name"
                placeholder="Enter project name"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div>
              <Textarea
                label="Description"
                placeholder="Describe your project and its goals"
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

            <div>
              <label
                htmlFor="domain-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Domain
              </label>
              <select
                id="domain-select"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                {...register('domain')}
              >
                <option value="">Select a domain</option>
                {domainOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.domain && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.domain.message}
                </p>
              )}
            </div>
          </div>

          {/* Project Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Project Configuration
            </h3>

            {/* Complexity Selection */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-3">
                  Complexity Level
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {complexityOptions.map(option => (
                    <label
                      key={option.value}
                      className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        className="sr-only"
                        aria-label={option.label}
                        {...register('complexity')}
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-center">
                          <Badge color={option.color} size="sm">
                            {option.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
              {errors.complexity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.complexity.message}
                </p>
              )}
            </div>

            {/* Methodology Selection */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-3">
                  Development Methodology
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {methodologyOptions.map(option => (
                    <label
                      key={option.value}
                      className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        className="sr-only"
                        aria-label={option.label}
                        {...register('methodology')}
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
              {errors.methodology && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.methodology.message}
                </p>
              )}
            </div>
          </div>

          {/* Template Selection */}
          {watchedDomain && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Template Selection (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                Choose a template to get started quickly with pre-defined
                requirements and structure.
              </p>

              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                  <span className="ml-2 text-sm text-gray-600">
                    Loading templates...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {template.name}
                            </h4>
                            <Badge color="gray" size="sm">
                              {template.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {template.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>★ {template.metadata.rating}</span>
                            <span>{template.metadata.usageCount} uses</span>
                            <div className="flex space-x-1">
                              {template.metadata.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} color="gray" size="xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            handleTemplatePreview(template);
                          }}
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTemplate && (
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Template &quot;{selectedTemplate.name}&quot; selected.
                        This will provide a starting structure for your project.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Template Preview Modal */}
      {showTemplatePreview && selectedTemplate && (
        <Modal
          isOpen={showTemplatePreview}
          onClose={() => setShowTemplatePreview(false)}
          title={`Template Preview: ${selectedTemplate.name}`}
          size="large"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="mt-1 text-sm text-gray-600">
                {selectedTemplate.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Prerequisites</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedTemplate.metadata.prerequisites.map(prereq => (
                  <Badge key={prereq} color="gray" size="sm">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">
                Template Content Preview
              </h4>
              <div className="mt-2 rounded-md bg-gray-50 p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedTemplate.content.substring(0, 500)}
                  {selectedTemplate.content.length > 500 && '...'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowTemplatePreview(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleTemplateSelect(selectedTemplate);
                  setShowTemplatePreview(false);
                }}
              >
                Use This Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

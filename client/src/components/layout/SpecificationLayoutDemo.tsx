import React, { useState } from 'react';
import { Button } from '../ui';
import { SpecificationLayout } from './SpecificationLayout';
import {
  SpecificationPhase,
  SpecificationProject,
} from '../../types/specifications';

// Mock project data for demo
const mockProject: SpecificationProject = {
  id: '1',
  name: 'E-commerce Platform',
  description: 'A modern e-commerce platform with React and Node.js',
  domain: 'web_application',
  complexity: 'moderate',
  methodology: 'agile',
  status: 'active',
  currentPhase: 'requirements',
  documents: [
    {
      id: '1',
      projectId: '1',
      type: 'requirements',
      title: 'Requirements Document',
      content: '',
      version: 1,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      lastModifiedBy: 'user1',
      metadata: {
        wordCount: 1250,
        estimatedReadTime: 5,
        completionPercentage: 75,
        validationResults: [],
        tags: ['user-stories', 'acceptance-criteria'],
        collaborators: ['user1'],
      },
    },
    {
      id: '2',
      projectId: '1',
      type: 'design',
      title: 'Design Document',
      content: '',
      version: 1,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      lastModifiedBy: 'user1',
      metadata: {
        wordCount: 800,
        estimatedReadTime: 3,
        completionPercentage: 45,
        validationResults: [],
        tags: ['architecture', 'components'],
        collaborators: ['user1'],
      },
    },
  ],
  team: [
    {
      userId: 'user1',
      role: 'owner',
      permissions: ['read', 'write', 'review', 'approve', 'admin'],
      joinedAt: new Date(),
    },
  ],
  settings: {
    visibility: 'private',
    collaboration: {
      realTimeEditing: true,
      commentingEnabled: true,
      reviewWorkflow: true,
      approvalRequired: false,
      maxCollaborators: 10,
    },
    validation: {
      autoValidation: true,
      validationRules: ['ears-format', 'completeness'],
      customRules: [],
      strictMode: false,
    },
    templates: {
      defaultTemplates: ['web-app-requirements', 'react-design'],
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

export const SpecificationLayoutDemo: React.FC = () => {
  const [currentPhase, setCurrentPhase] =
    useState<SpecificationPhase>('requirements');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlePhaseChange = (phase: SpecificationPhase) => {
    setCurrentPhase(phase);
  };

  const getPhaseContent = () => {
    switch (currentPhase) {
      case 'requirements':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Requirements Phase
              </h2>
              <p className="text-gray-600 mb-4">
                In this phase, you&apos;ll define user stories and acceptance
                criteria using the EARS format.
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    User Story Example
                  </h3>
                  <p className="text-blue-800 text-sm">
                    <strong>As a</strong> customer, <strong>I want</strong> to
                    browse products by category
                    <strong> so that</strong> I can find items I&apos;m
                    interested in more easily.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">
                    EARS Format Acceptance Criteria
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>
                      • WHEN a user clicks on a category THEN the system SHALL
                      display all products in that category
                    </li>
                    <li>
                      • IF no products exist in a category THEN the system SHALL
                      display a &quot;No products found&quot; message
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'design':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Design Phase
              </h2>
              <p className="text-gray-600 mb-4">
                Create architecture diagrams, component specifications, and data
                models.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">
                    Architecture Overview
                  </h3>
                  <p className="text-purple-800 text-sm">
                    Define the high-level system architecture, including
                    frontend, backend, and database components.
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-medium text-indigo-900 mb-2">
                    Component Design
                  </h3>
                  <p className="text-indigo-800 text-sm">
                    Specify individual components, their responsibilities, and
                    interfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tasks Phase
              </h2>
              <p className="text-gray-600 mb-4">
                Break down the design into actionable implementation tasks.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">
                  Task Breakdown Example
                </h3>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• 1. Set up project structure and dependencies</li>
                  <li>• 2. Create product catalog components</li>
                  <li>• 2.1 Implement ProductCard component</li>
                  <li>• 2.2 Create CategoryFilter component</li>
                  <li>• 3. Implement product search functionality</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'implementation':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Implementation Phase
              </h2>
              <p className="text-gray-600 mb-4">
                Execute the tasks and write code according to the
                specifications.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">
                  Implementation Guidelines
                </h3>
                <p className="text-orange-800 text-sm">
                  Follow the task list, implement features incrementally, and
                  ensure each task meets its acceptance criteria before moving
                  to the next.
                </p>
              </div>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Phase
              </h2>
              <p className="text-gray-600 mb-4">
                Review the implementation against the original specifications.
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-medium text-indigo-900 mb-2">
                  Review Checklist
                </h3>
                <ul className="text-indigo-800 text-sm space-y-1">
                  <li>• All requirements have been implemented</li>
                  <li>• Code follows the design specifications</li>
                  <li>• All acceptance criteria are met</li>
                  <li>• Tests cover the implemented functionality</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Project Completed
              </h2>
              <p className="text-gray-600 mb-4">
                Congratulations! Your specification-driven development project
                is complete.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-medium text-emerald-900 mb-2">
                  Project Summary
                </h3>
                <p className="text-emerald-800 text-sm">
                  The project has successfully gone through all phases of
                  specification-based development, from requirements gathering
                  to final implementation and review.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown phase</div>;
    }
  };

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm">
        Save Draft
      </Button>
      <Button size="sm">Continue</Button>
    </div>
  );

  return (
    <SpecificationLayout
      project={mockProject}
      currentPhase={currentPhase}
      onPhaseChange={handlePhaseChange}
      subtitle="Specification-based development workflow demonstration"
      actions={headerActions}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    >
      {getPhaseContent()}
    </SpecificationLayout>
  );
};

import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { cn } from '../../utils/cn';
import {
  SpecificationPhase,
  SpecificationProject,
} from '../../types/specifications';

export interface SpecificationBreadcrumbsProps {
  project?: SpecificationProject | undefined;
  currentPhase: SpecificationPhase;
  onPhaseChange?: ((phase: SpecificationPhase) => void) | undefined; // eslint-disable-line no-unused-vars
  showHome?: boolean | undefined;
  className?: string | undefined;
}

interface PhaseBreadcrumb {
  phase: SpecificationPhase; // eslint-disable-line no-unused-vars
  name: string;
  shortName: string;
  order: number;
}

const phaseBreadcrumbs: PhaseBreadcrumb[] = [
  {
    phase: 'requirements',
    name: 'Requirements',
    shortName: 'Req',
    order: 1,
  },
  {
    phase: 'design',
    name: 'Design',
    shortName: 'Design',
    order: 2,
  },
  {
    phase: 'tasks',
    name: 'Tasks',
    shortName: 'Tasks',
    order: 3,
  },
  {
    phase: 'implementation',
    name: 'Implementation',
    shortName: 'Impl',
    order: 4,
  },
  {
    phase: 'review',
    name: 'Review',
    shortName: 'Review',
    order: 5,
  },
  {
    phase: 'completed',
    name: 'Completed',
    shortName: 'Done',
    order: 6,
  },
];

export const SpecificationBreadcrumbs: React.FC<
  SpecificationBreadcrumbsProps
> = ({ project, currentPhase, onPhaseChange, showHome = true, className }) => {
  // Get phase status
  const getPhaseStatus = (
    phase: SpecificationPhase
  ): 'completed' | 'current' | 'available' | 'locked' => {
    if (!project) return phase === currentPhase ? 'current' : 'locked';

    const phaseOrder =
      phaseBreadcrumbs.find(p => p.phase === phase)?.order || 0;
    const currentPhaseOrder =
      phaseBreadcrumbs.find(p => p.phase === currentPhase)?.order || 0;

    if (phaseOrder < currentPhaseOrder) return 'completed';
    if (phaseOrder === currentPhaseOrder) return 'current';
    if (phaseOrder === currentPhaseOrder + 1) return 'available';
    return 'locked';
  };

  // Get phase completion percentage
  const getPhaseCompletion = (phase: SpecificationPhase): number => {
    if (!project) return 0;

    const document = project.documents.find(doc => doc.type === phase);
    return document?.metadata?.completionPercentage || 0;
  };

  // Check if phase can be accessed
  const canAccessPhase = (phase: SpecificationPhase): boolean => {
    const status = getPhaseStatus(phase);
    return (
      status === 'completed' || status === 'current' || status === 'available'
    );
  };

  // Handle phase click
  const handlePhaseClick = (phase: SpecificationPhase) => {
    if (canAccessPhase(phase) && onPhaseChange) {
      onPhaseChange(phase);
    }
  };

  // Get phases up to current phase
  const getVisiblePhases = (): PhaseBreadcrumb[] => {
    const currentOrder =
      phaseBreadcrumbs.find(p => p.phase === currentPhase)?.order || 1;
    return phaseBreadcrumbs.filter(p => p.order <= Math.max(currentOrder, 1));
  };

  // Render status indicator
  const renderStatusIndicator = (phase: SpecificationPhase) => {
    const status = getPhaseStatus(phase);
    const completion = getPhaseCompletion(phase);

    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'current':
        return (
          <div className="relative">
            <ClockIcon className="h-4 w-4 text-blue-600" />
            {completion > 0 && (
              <div className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 bg-blue-600 rounded-full" />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const visiblePhases = getVisiblePhases();

  return (
    <nav
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="Specification Progress"
    >
      {/* Home breadcrumb */}
      {showHome && (
        <>
          <a
            href="/projects"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Projects</span>
          </a>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </>
      )}

      {/* Project name */}
      {project && (
        <>
          <span className="text-gray-500 truncate max-w-32 sm:max-w-48">
            {project.name}
          </span>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </>
      )}

      {/* Phase breadcrumbs */}
      <div className="flex items-center space-x-1">
        {visiblePhases.map((phaseBreadcrumb, index) => {
          const isLast = index === visiblePhases.length - 1;
          const status = getPhaseStatus(phaseBreadcrumb.phase);
          const completion = getPhaseCompletion(phaseBreadcrumb.phase);
          const canAccess = canAccessPhase(phaseBreadcrumb.phase);
          const isCurrent = phaseBreadcrumb.phase === currentPhase;

          return (
            <div
              key={phaseBreadcrumb.phase}
              className="flex items-center space-x-1"
            >
              {/* Phase breadcrumb */}
              <div className="flex items-center space-x-1">
                {canAccess && onPhaseChange ? (
                  <button
                    onClick={() => handlePhaseClick(phaseBreadcrumb.phase)}
                    className={cn(
                      'flex items-center space-x-1 px-2 py-1 rounded-md transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                      isCurrent
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {renderStatusIndicator(phaseBreadcrumb.phase)}
                    <span className="hidden sm:inline">
                      {phaseBreadcrumb.name}
                    </span>
                    <span className="sm:hidden">
                      {phaseBreadcrumb.shortName}
                    </span>
                    {completion > 0 && status !== 'completed' && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round(completion)}%)
                      </span>
                    )}
                  </button>
                ) : (
                  <div
                    className={cn(
                      'flex items-center space-x-1 px-2 py-1',
                      isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
                    )}
                  >
                    {renderStatusIndicator(phaseBreadcrumb.phase)}
                    <span className="hidden sm:inline">
                      {phaseBreadcrumb.name}
                    </span>
                    <span className="sm:hidden">
                      {phaseBreadcrumb.shortName}
                    </span>
                    {completion > 0 && status !== 'completed' && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round(completion)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Separator */}
              {!isLast && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress indicator */}
      {project && (
        <div className="hidden md:flex items-center ml-4 space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((visiblePhases.filter(p => getPhaseStatus(p.phase) === 'completed').length / phaseBreadcrumbs.length) * 100)}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {
              visiblePhases.filter(p => getPhaseStatus(p.phase) === 'completed')
                .length
            }{' '}
            of {phaseBreadcrumbs.length}
          </span>
        </div>
      )}
    </nav>
  );
};

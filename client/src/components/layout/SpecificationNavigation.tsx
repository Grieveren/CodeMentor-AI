import React, { Fragment } from 'react';
import {
  DocumentTextIcon,
  CubeIcon,
  ListBulletIcon,
  CodeBracketIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  DocumentTextIcon as DocumentTextIconSolid,
  CubeIcon as CubeIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  CodeBracketIcon as CodeBracketIconSolid,
  EyeIcon as EyeIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { cn } from '../../utils/cn';
import {
  SpecificationPhase,
  SpecificationProject,
} from '../../types/specifications';

export interface SpecificationNavigationProps {
  currentPhase: SpecificationPhase;
  project?: SpecificationProject | undefined;
  onPhaseChange?: ((phase: SpecificationPhase) => void) | undefined; // eslint-disable-line no-unused-vars
  className?: string | undefined;
  collapsed?: boolean | undefined;
  isMobile?: boolean | undefined;
}

interface PhaseInfo {
  phase: SpecificationPhase;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  solidIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  order: number;
  color: {
    text: string;
    bg: string;
    border: string;
    hover: string;
  };
}

const phaseConfig: PhaseInfo[] = [
  {
    phase: 'requirements',
    name: 'Requirements',
    description: 'Define user stories and acceptance criteria',
    icon: DocumentTextIcon,
    solidIcon: DocumentTextIconSolid,
    order: 1,
    color: {
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100',
    },
  },
  {
    phase: 'design',
    name: 'Design',
    description: 'Create architecture and component specifications',
    icon: CubeIcon,
    solidIcon: CubeIconSolid,
    order: 2,
    color: {
      text: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-100',
    },
  },
  {
    phase: 'tasks',
    name: 'Tasks',
    description: 'Break down implementation into actionable tasks',
    icon: ListBulletIcon,
    solidIcon: ListBulletIconSolid,
    order: 3,
    color: {
      text: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      hover: 'hover:bg-green-100',
    },
  },
  {
    phase: 'implementation',
    name: 'Implementation',
    description: 'Execute tasks and write code',
    icon: CodeBracketIcon,
    solidIcon: CodeBracketIconSolid,
    order: 4,
    color: {
      text: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-100',
    },
  },
  {
    phase: 'review',
    name: 'Review',
    description: 'Review and validate implementation',
    icon: EyeIcon,
    solidIcon: EyeIconSolid,
    order: 5,
    color: {
      text: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      hover: 'hover:bg-indigo-100',
    },
  },
  {
    phase: 'completed',
    name: 'Completed',
    description: 'Project successfully completed',
    icon: CheckCircleIcon,
    solidIcon: CheckCircleIconSolid,
    order: 6,
    color: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hover: 'hover:bg-emerald-100',
    },
  },
];

export const SpecificationNavigation: React.FC<
  SpecificationNavigationProps
> = ({
  currentPhase,
  project,
  onPhaseChange,
  className,
  collapsed = false,
  isMobile = false,
}) => {
  // Get phase completion status
  const getPhaseStatus = (
    phase: SpecificationPhase
  ): 'completed' | 'current' | 'available' | 'locked' => {
    if (!project) return phase === currentPhase ? 'current' : 'locked';

    const phaseOrder = phaseConfig.find(p => p.phase === phase)?.order || 0;
    const currentPhaseOrder =
      phaseConfig.find(p => p.phase === currentPhase)?.order || 0;

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

  // Render status indicator
  const renderStatusIndicator = (phase: SpecificationPhase) => {
    const status = getPhaseStatus(phase);
    const completion = getPhaseCompletion(phase);

    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'current':
        if (completion > 0) {
          return (
            <div className="relative">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-blue-600 rounded-full" />
            </div>
          );
        }
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'available':
        return (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white" />
        );
      case 'locked':
        return <div className="h-5 w-5 rounded-full bg-gray-200" />;
      default:
        return null;
    }
  };

  // Render progress bar
  const renderProgressBar = (phase: SpecificationPhase) => {
    const completion = getPhaseCompletion(phase);
    const status = getPhaseStatus(phase);

    if (status === 'locked' || completion === 0) return null;

    return (
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
        <div
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${completion}%` }}
        />
      </div>
    );
  };

  return (
    <nav className={cn('flex flex-col space-y-2', className)}>
      {/* Phase navigation header */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Specification Workflow
          </h3>
          {project && (
            <p className="text-xs text-gray-500 mt-1">{project.name}</p>
          )}
        </div>
      )}

      {/* Phase navigation items */}
      <div className={cn('space-y-1', collapsed ? 'px-2' : 'px-3')}>
        {phaseConfig.map(phaseInfo => {
          const completion = getPhaseCompletion(phaseInfo.phase);
          const isActive = phaseInfo.phase === currentPhase;
          const canAccess = canAccessPhase(phaseInfo.phase);

          const Icon = isActive ? phaseInfo.solidIcon : phaseInfo.icon;

          return (
            <Fragment key={phaseInfo.phase}>
              <button
                onClick={() => handlePhaseClick(phaseInfo.phase)}
                disabled={!canAccess}
                className={cn(
                  'w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  isActive && [
                    phaseInfo.color.bg,
                    phaseInfo.color.text,
                    phaseInfo.color.border,
                    'border-l-4',
                  ],
                  !isActive &&
                    canAccess && [
                      'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    ],
                  !canAccess && ['text-gray-400 cursor-not-allowed opacity-60'],
                  collapsed && 'justify-center px-2'
                )}
              >
                {/* Phase icon and status */}
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <Icon className="h-5 w-5" />
                    {!collapsed && (
                      <div className="absolute -top-1 -right-1">
                        {renderStatusIndicator(phaseInfo.phase)}
                      </div>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{phaseInfo.name}</span>
                        {completion > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            {Math.round(completion)}%
                          </span>
                        )}
                      </div>
                      {!isMobile && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {phaseInfo.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Progress bar */}
              {!collapsed && renderProgressBar(phaseInfo.phase)}
            </Fragment>
          );
        })}
      </div>

      {/* Phase workflow help */}
      {!collapsed && !isMobile && (
        <div className="px-3 py-2 mt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-3 w-3 text-green-600" />
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-3 w-3 text-blue-600" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-gray-200" />
              <span>Locked</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

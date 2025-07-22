import React, { useState, ReactNode } from 'react';
import { Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { SpecificationNavigation } from './SpecificationNavigation';
import { SpecificationBreadcrumbs } from './SpecificationBreadcrumbs';
import {
  SpecificationPhase,
  SpecificationProject,
} from '../../types/specifications';

export interface SpecificationLayoutProps {
  children: ReactNode;
  project?: SpecificationProject | undefined;
  currentPhase: SpecificationPhase;
  onPhaseChange?: ((phase: SpecificationPhase) => void) | undefined; // eslint-disable-line no-unused-vars
  title?: string | undefined;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  showSidebar?: boolean | undefined;
  sidebarCollapsed?: boolean | undefined;
  onSidebarToggle?: (() => void) | undefined;
  className?: string | undefined;
}

export const SpecificationLayout: React.FC<SpecificationLayoutProps> = ({
  children,
  project,
  currentPhase,
  onPhaseChange,
  title,
  subtitle,
  actions,
  showSidebar = true,
  sidebarCollapsed = false,
  onSidebarToggle,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current phase info for title
  const getCurrentPhaseTitle = (): string => {
    if (title) return title;

    const phaseNames: Record<SpecificationPhase, string> = {
      requirements: 'Requirements',
      design: 'Design',
      tasks: 'Tasks',
      implementation: 'Implementation',
      review: 'Review',
      completed: 'Completed',
    };

    return phaseNames[currentPhase] || 'Specification';
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Mobile menu */}
      <Disclosure
        as="nav"
        className="bg-white shadow-sm border-b border-gray-200 lg:hidden"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <h1 className="text-lg font-bold text-primary-600">
                      {project?.name || 'Specification'}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {actions && (
                    <div className="flex items-center space-x-2">{actions}</div>
                  )}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="lg:hidden">
              <div className="border-t border-gray-200 bg-white px-4 py-4">
                <SpecificationNavigation
                  currentPhase={currentPhase}
                  project={project}
                  onPhaseChange={onPhaseChange}
                  isMobile
                />
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="flex h-screen lg:h-auto">
        {/* Desktop sidebar */}
        {showSidebar && (
          <div
            className={cn(
              'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300',
              sidebarCollapsed ? 'lg:w-16' : 'lg:w-72'
            )}
          >
            {/* Sidebar header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">
                      Specification
                    </h1>
                    <p className="text-xs text-gray-500">Workflow</p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              )}
            </div>

            {/* Specification Navigation */}
            <div className="flex flex-1 flex-col overflow-y-auto py-4">
              <SpecificationNavigation
                currentPhase={currentPhase}
                project={project}
                onPhaseChange={onPhaseChange}
                collapsed={sidebarCollapsed}
              />
            </div>

            {/* Sidebar footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {onSidebarToggle && (
                  <button
                    onClick={onSidebarToggle}
                    className={cn(
                      'p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors',
                      sidebarCollapsed && 'mx-auto'
                    )}
                  >
                    <Bars3Icon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div
          className={cn(
            'flex flex-1 flex-col',
            showSidebar && 'lg:pl-72',
            showSidebar && sidebarCollapsed && 'lg:pl-16'
          )}
        >
          {/* Top header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Page title and subtitle */}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-gray-900 truncate">
                      {getCurrentPhaseTitle()}
                    </h1>
                    {subtitle && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Header actions */}
                {actions && (
                  <div className="hidden lg:flex items-center space-x-4">
                    {actions}
                  </div>
                )}
              </div>

              {/* Specification Breadcrumbs */}
              <div className="pb-4">
                <SpecificationBreadcrumbs
                  project={project}
                  currentPhase={currentPhase}
                  onPhaseChange={onPhaseChange}
                />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

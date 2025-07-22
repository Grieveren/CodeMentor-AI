import React, { useState, ReactNode } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Navigation } from './Navigation';
import { Breadcrumbs } from './Breadcrumbs';

export interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  showSidebar = true,
  sidebarCollapsed = false,
  onSidebarToggle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <Disclosure
        as="nav"
        className="bg-white shadow-sm border-b border-gray-200 lg:hidden"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-primary-600">
                      CodeMentor AI
                    </h1>
                  </div>
                </div>
                <div className="flex items-center lg:hidden">
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
              <div className="border-t border-gray-200 bg-white">
                <Navigation isMobile />
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
              sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
            )}
          >
            {/* Sidebar header */}
            <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
              {!sidebarCollapsed && (
                <h1 className="text-xl font-bold text-primary-600">
                  CodeMentor AI
                </h1>
              )}
              {sidebarCollapsed && (
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              <Navigation collapsed={sidebarCollapsed} />
            </div>

            {/* Sidebar toggle button */}
            {onSidebarToggle && (
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={onSidebarToggle}
                  className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div
          className={cn(
            'flex flex-1 flex-col',
            showSidebar && 'lg:pl-64',
            showSidebar && sidebarCollapsed && 'lg:pl-16'
          )}
        >
          {/* Top header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Page title */}
                  {title && (
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">
                        {title}
                      </h1>
                    </div>
                  )}
                </div>

                {/* Header actions */}
                <div className="flex items-center space-x-4">
                  {/* User menu placeholder */}
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                </div>
              </div>

              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="pb-4">
                  <Breadcrumbs items={breadcrumbs} />
                </div>
              )}
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

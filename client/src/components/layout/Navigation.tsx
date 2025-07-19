import { Fragment } from 'react';
import { 
  HomeIcon,
  BookOpenIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
  badge?: string | number;
  children?: NavigationItem[] | undefined;
  roles?: string[]; // For role-based rendering
}

export interface NavigationProps {
  collapsed?: boolean;
  isMobile?: boolean;
  userRole?: string;
  currentPath?: string;
}

// Default navigation items
const defaultNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    current: false,
  },
  {
    name: 'Lessons',
    href: '/lessons',
    icon: BookOpenIcon,
    current: false,
    children: [
      { name: 'Browse Lessons', href: '/lessons/browse', icon: BookOpenIcon },
      { name: 'My Progress', href: '/lessons/progress', icon: ChartBarIcon },
      { name: 'Tracks', href: '/lessons/tracks', icon: AcademicCapIcon },
    ],
  },
  {
    name: 'Code Editor',
    href: '/editor',
    icon: CodeBracketIcon,
    current: false,
  },
  {
    name: 'AI Chat',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    current: false,
    badge: 'New',
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: ChartBarIcon,
    current: false,
  },
];

const userNavigationItems: NavigationItem[] = [
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    current: false,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    current: false,
  },
];

export const Navigation: React.FC<NavigationProps> = ({
  collapsed = false,
  isMobile = false,
  userRole = 'student',
  currentPath = '/',
}) => {
  // Filter navigation items based on user role
  const getFilteredItems = (items: NavigationItem[]) => {
    return items.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(userRole);
    });
  };

  const mainNavItems = getFilteredItems(defaultNavigationItems);
  const userNavItems = getFilteredItems(userNavigationItems);

  // Check if current path matches item
  const isCurrentPath = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  // Update current state based on path
  const updatedMainNavItems = mainNavItems.map(item => ({
    ...item,
    current: isCurrentPath(item.href),
    children: item.children ? item.children.map(child => ({
      ...child,
      current: isCurrentPath(child.href),
    })) : undefined,
  }));

  const updatedUserNavItems = userNavItems.map(item => ({
    ...item,
    current: isCurrentPath(item.href),
  }));

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const Icon = item.icon;
    const isCurrent = item.current;

    return (
      <a
        key={item.name}
        href={item.href}
        className={cn(
          'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
          isChild && 'ml-6',
          isCurrent
            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          collapsed && !isMobile && 'justify-center px-2',
          isMobile && 'px-4 py-3'
        )}
      >
        <Icon
          className={cn(
            'flex-shrink-0',
            collapsed && !isMobile ? 'h-6 w-6' : 'h-5 w-5',
            isCurrent ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500',
            !collapsed && !isChild && 'mr-3'
          )}
          aria-hidden="true"
        />
        {(!collapsed || isMobile) && (
          <>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                {item.badge}
              </span>
            )}
          </>
        )}
      </a>
    );
  };

  return (
    <nav className={cn('flex flex-col', isMobile ? 'px-4 py-4' : 'px-3 py-4')}>
      {/* Main navigation */}
      <div className="space-y-1">
        {updatedMainNavItems.map((item) => (
          <Fragment key={item.name}>
            {renderNavigationItem(item)}
            {/* Render children if they exist and sidebar is not collapsed */}
            {item.children && (!collapsed || isMobile) && (
              <div className="mt-1 space-y-1">
                {item.children.map((child) => renderNavigationItem(child, true))}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Divider */}
      <div className={cn('my-6 border-t border-gray-200', collapsed && !isMobile && 'mx-2')} />

      {/* User navigation */}
      <div className="space-y-1">
        {updatedUserNavItems.map((item) => renderNavigationItem(item))}
      </div>

      {/* Collapsed tooltip helper */}
      {collapsed && !isMobile && (
        <div className="mt-auto pt-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Hover to expand</p>
          </div>
        </div>
      )}
    </nav>
  );
};
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className,
}) => {
  // Add home item if showHome is true and items don't start with home
  const breadcrumbItems = showHome && items[0]?.label !== 'Home' 
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  // Mark the last item as current if not already marked
  const processedItems = breadcrumbItems.map((item, index) => ({
    ...item,
    current: index === breadcrumbItems.length - 1 ? true : item.current,
  }));

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {processedItems.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon
                className="h-4 w-4 text-gray-400 mx-2"
                aria-hidden="true"
              />
            )}
            
            <div className="flex items-center">
              {/* Home icon for first item if it's home */}
              {index === 0 && item.label === 'Home' && (
                <HomeIcon className="h-4 w-4 text-gray-400 mr-1" aria-hidden="true" />
              )}
              
              {item.href && !item.current ? (
                <a
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'text-sm font-medium',
                    item.current
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
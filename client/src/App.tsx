import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  Badge,
  Spinner,
} from './components/ui';
import { AppLayout } from './components/layout';
import { SpecificationLayoutDemo } from './components/layout/SpecificationLayoutDemo';
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLayoutDemo, setShowLayoutDemo] = useState(false);
  const [showSpecificationDemo, setShowSpecificationDemo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  // Layout demo content
  const layoutDemoContent = (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Layout Components Demo
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          This demonstrates the AppLayout with Navigation and Breadcrumbs
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => setShowLayoutDemo(false)}>
            Back to Components
          </Button>
          <Button
            variant="outline"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowSpecificationDemo(true)}
          >
            View Specification Layout
          </Button>
        </div>
      </div>

      {/* Layout Features Demo */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Layout Features</CardTitle>
            <CardDescription>Responsive layout with navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Responsive sidebar navigation</li>
              <li>✓ Mobile-friendly hamburger menu</li>
              <li>✓ Collapsible sidebar for desktop</li>
              <li>✓ Breadcrumb navigation</li>
              <li>✓ Role-based menu rendering</li>
              <li>✓ Active route highlighting</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Structure</CardTitle>
            <CardDescription>Hierarchical menu organization</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Dashboard</li>
              <li>• Lessons (with sub-items)</li>
              <li>• Code Editor</li>
              <li>• AI Chat</li>
              <li>• Progress</li>
              <li>• Profile & Settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Components showcase content
  const componentsShowcaseContent = (
    <>
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CodeMentor AI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to your AI-powered coding mentor platform!
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" onClick={() => setShowLayoutDemo(true)}>
            View Layout Demo
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setShowSpecificationDemo(true)}
          >
            View Specification Layout
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* UI Components Showcase */}
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Various button styles and states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="error">Error</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
              <Button loading onClick={handleLoadingDemo}>
                {isLoading ? 'Loading...' : 'Click to Load'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Input fields and form elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                />
                <Input
                  label="Username"
                  placeholder="Enter username"
                  leftIcon={<UserIcon className="h-4 w-4" />}
                  helperText="This will be your public display name"
                />
                <Input
                  label="Password"
                  type="password"
                  error="Password must be at least 8 characters"
                  variant="error"
                />
              </div>
              <div className="space-y-4">
                <Textarea
                  label="Message"
                  placeholder="Enter your message here..."
                  rows={4}
                  helperText="Maximum 500 characters"
                />
                <Textarea
                  label="Feedback"
                  placeholder="Your feedback..."
                  rows={3}
                  error="This field is required"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges and Status */}
        <Card>
          <CardHeader>
            <CardTitle>Badges & Status Indicators</CardTitle>
            <CardDescription>
              Various badge styles and loading states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
                <Spinner label="Loading..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Modal Component</CardTitle>
            <CardDescription>Interactive modal dialogs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </CardContent>
        </Card>

        {/* Development Status */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Development Environment Status</CardTitle>
            <CardDescription>
              Frontend development environment configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    React 18 with TypeScript
                  </span>
                  <Badge variant="success">✓ Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Tailwind CSS with custom theme
                  </span>
                  <Badge variant="success">✓ Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Vite build configuration
                  </span>
                  <Badge variant="success">✓ Ready</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    UI Components Library
                  </span>
                  <Badge variant="success">✓ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    TypeScript Interfaces
                  </span>
                  <Badge variant="success">✓ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Responsive Design
                  </span>
                  <Badge variant="success">✓ Complete</Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              All foundational UI components are ready for use throughout the
              application.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        description="This is a demonstration of the modal component with various features."
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This modal demonstrates the component&apos;s capabilities including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Responsive sizing options</li>
            <li>Overlay click handling</li>
            <li>Smooth animations</li>
            <li>Accessible focus management</li>
            <li>Customizable content areas</li>
          </ul>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );

  // Render specification layout demo
  if (showSpecificationDemo) {
    return <SpecificationLayoutDemo />;
  }

  // Render layout demo or components showcase
  if (showLayoutDemo) {
    return (
      <AppLayout
        title="Layout Demo"
        breadcrumbs={[
          { label: 'Components', href: '#' },
          { label: 'Layout Demo' },
        ]}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {layoutDemoContent}
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="container mx-auto px-4 py-16">
        {componentsShowcaseContent}
      </div>
    </div>
  );
}

export default App;

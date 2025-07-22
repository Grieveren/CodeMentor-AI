import { apiClient } from './apiClient';
import type { SpecificationTemplate } from '@/types/specifications';

// Template service for managing specification templates
export class TemplatesService {
  private baseUrl = '/api/templates';

  // Get all templates
  async getTemplates(): Promise<SpecificationTemplate[]> {
    try {
      const response = await apiClient.get<SpecificationTemplate[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Return mock data for now
      return this.getMockTemplates();
    }
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<SpecificationTemplate[]> {
    try {
      const response = await apiClient.get<SpecificationTemplate[]>(
        `${this.baseUrl}?category=${encodeURIComponent(category)}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates by category:', error);
      // Return filtered mock data for now
      return this.getMockTemplates().filter(template => 
        template.category === category || template.metadata.tags.includes(category)
      );
    }
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<SpecificationTemplate | null> {
    try {
      const response = await apiClient.get<SpecificationTemplate>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      // Return mock data for now
      return this.getMockTemplates().find(template => template.id === id) || null;
    }
  }

  // Search templates
  async searchTemplates(query: string): Promise<SpecificationTemplate[]> {
    try {
      const response = await apiClient.get<SpecificationTemplate[]>(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to search templates:', error);
      // Return filtered mock data for now
      const mockTemplates = this.getMockTemplates();
      const lowerQuery = query.toLowerCase();
      return mockTemplates.filter(template =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
  }

  // Get template examples
  async getTemplateExamples(templateId: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${templateId}/examples`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template examples:', error);
      return [];
    }
  }

  // Apply template to project
  async applyTemplate(templateId: string, projectId: string, variables?: Record<string, any>) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${templateId}/apply`, {
        projectId,
        variables,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  }

  // Mock templates data (TODO: Remove when API is implemented)
  private getMockTemplates(): SpecificationTemplate[] {
    return [
      {
        id: 'web-app-basic',
        name: 'Basic Web Application',
        description: 'Template for a simple web application with user authentication and basic CRUD operations',
        category: 'web_application',
        type: 'requirements',
        content: `# Requirements Document

## Introduction
This document outlines the requirements for a basic web application with user authentication and CRUD operations.

## User Authentication Requirements

### Requirement 1
**User Story:** As a new user, I want to register for an account so that I can access the application.

#### Acceptance Criteria
1. WHEN a user visits the registration page THEN the system SHALL display a registration form with email, password, and confirm password fields
2. WHEN a user submits valid registration data THEN the system SHALL create a new user account and send a confirmation email
3. WHEN a user submits invalid data THEN the system SHALL display appropriate error messages

### Requirement 2
**User Story:** As a registered user, I want to log in to my account so that I can access protected features.

#### Acceptance Criteria
1. WHEN a user enters valid credentials THEN the system SHALL authenticate the user and redirect to the dashboard
2. WHEN a user enters invalid credentials THEN the system SHALL display an error message
3. WHEN a user is inactive for 30 minutes THEN the system SHALL automatically log them out

## Data Management Requirements

### Requirement 3
**User Story:** As a user, I want to create, read, update, and delete data records so that I can manage my information.

#### Acceptance Criteria
1. WHEN a user creates a new record THEN the system SHALL validate the data and save it to the database
2. WHEN a user views records THEN the system SHALL display them in a paginated list
3. WHEN a user updates a record THEN the system SHALL save the changes and show a success message
4. WHEN a user deletes a record THEN the system SHALL ask for confirmation and remove it from the database`,
        variables: [
          {
            name: 'appName',
            type: 'string',
            description: 'Name of the application',
            required: true,
            defaultValue: 'My Web App',
          },
          {
            name: 'userRoles',
            type: 'array',
            description: 'User roles in the system',
            required: false,
            defaultValue: ['user', 'admin'],
          },
        ],
        examples: [],
        metadata: {
          version: '1.0',
          author: 'CodeMentor AI',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          usageCount: 150,
          rating: 4.5,
          tags: ['web', 'authentication', 'crud', 'basic'],
          prerequisites: ['HTML', 'CSS', 'JavaScript', 'Database concepts'],
        },
      },
      {
        id: 'api-service',
        name: 'REST API Service',
        description: 'Template for building a RESTful API service with authentication and data persistence',
        category: 'api',
        type: 'requirements',
        content: `# API Service Requirements

## Introduction
This document defines the requirements for a RESTful API service with authentication and data management capabilities.

## Authentication Requirements

### Requirement 1
**User Story:** As an API client, I want to authenticate using JWT tokens so that I can access protected endpoints.

#### Acceptance Criteria
1. WHEN a client sends valid credentials to /auth/login THEN the system SHALL return a JWT token
2. WHEN a client includes a valid JWT token in the Authorization header THEN the system SHALL allow access to protected endpoints
3. WHEN a JWT token expires THEN the system SHALL return a 401 Unauthorized response

## API Endpoint Requirements

### Requirement 2
**User Story:** As an API client, I want to perform CRUD operations on resources so that I can manage data.

#### Acceptance Criteria
1. WHEN a client sends a GET request to /api/resources THEN the system SHALL return a paginated list of resources
2. WHEN a client sends a POST request with valid data THEN the system SHALL create a new resource and return 201 Created
3. WHEN a client sends a PUT request with valid data THEN the system SHALL update the resource and return 200 OK
4. WHEN a client sends a DELETE request THEN the system SHALL remove the resource and return 204 No Content

## Data Validation Requirements

### Requirement 3
**User Story:** As an API service, I want to validate all incoming data so that data integrity is maintained.

#### Acceptance Criteria
1. WHEN invalid data is received THEN the system SHALL return 400 Bad Request with validation errors
2. WHEN required fields are missing THEN the system SHALL return specific error messages
3. WHEN data types are incorrect THEN the system SHALL return type validation errors`,
        variables: [
          {
            name: 'serviceName',
            type: 'string',
            description: 'Name of the API service',
            required: true,
            defaultValue: 'My API Service',
          },
          {
            name: 'resources',
            type: 'array',
            description: 'List of resources to manage',
            required: true,
            defaultValue: ['users', 'posts', 'comments'],
          },
        ],
        examples: [],
        metadata: {
          version: '1.0',
          author: 'CodeMentor AI',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10'),
          usageCount: 89,
          rating: 4.3,
          tags: ['api', 'rest', 'authentication', 'jwt'],
          prerequisites: ['HTTP', 'JSON', 'Database concepts', 'Authentication'],
        },
      },
      {
        id: 'mobile-app',
        name: 'Mobile Application',
        description: 'Template for a cross-platform mobile application with offline capabilities',
        category: 'mobile_app',
        type: 'requirements',
        content: `# Mobile Application Requirements

## Introduction
This document outlines the requirements for a cross-platform mobile application with offline capabilities.

## User Experience Requirements

### Requirement 1
**User Story:** As a mobile user, I want an intuitive onboarding experience so that I can quickly start using the app.

#### Acceptance Criteria
1. WHEN a user opens the app for the first time THEN the system SHALL display an onboarding flow
2. WHEN a user completes onboarding THEN the system SHALL save their preferences
3. WHEN a user skips onboarding THEN the system SHALL provide help tooltips on first use

## Offline Functionality Requirements

### Requirement 2
**User Story:** As a mobile user, I want to use the app offline so that I can access my data without internet connection.

#### Acceptance Criteria
1. WHEN the device is offline THEN the system SHALL allow users to view cached data
2. WHEN the device is offline THEN the system SHALL queue user actions for later sync
3. WHEN the device comes back online THEN the system SHALL automatically sync queued actions

## Push Notification Requirements

### Requirement 3
**User Story:** As a user, I want to receive push notifications so that I stay informed about important updates.

#### Acceptance Criteria
1. WHEN important events occur THEN the system SHALL send push notifications to relevant users
2. WHEN a user taps a notification THEN the system SHALL open the relevant screen in the app
3. WHEN a user disables notifications THEN the system SHALL respect their preference`,
        variables: [
          {
            name: 'appName',
            type: 'string',
            description: 'Name of the mobile application',
            required: true,
            defaultValue: 'My Mobile App',
          },
          {
            name: 'platforms',
            type: 'array',
            description: 'Target platforms',
            required: true,
            defaultValue: ['iOS', 'Android'],
          },
        ],
        examples: [],
        metadata: {
          version: '1.0',
          author: 'CodeMentor AI',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-20'),
          usageCount: 67,
          rating: 4.7,
          tags: ['mobile', 'cross-platform', 'offline', 'notifications'],
          prerequisites: ['Mobile development', 'UI/UX design', 'Push notifications'],
        },
      },
      {
        id: 'microservice',
        name: 'Microservice Architecture',
        description: 'Template for designing a microservice with proper service boundaries and communication patterns',
        category: 'microservice',
        type: 'requirements',
        content: `# Microservice Requirements

## Introduction
This document defines the requirements for a microservice within a distributed system architecture.

## Service Boundary Requirements

### Requirement 1
**User Story:** As a system architect, I want clear service boundaries so that services can be developed and deployed independently.

#### Acceptance Criteria
1. WHEN defining service responsibilities THEN the system SHALL have a single, well-defined business capability
2. WHEN services communicate THEN they SHALL use well-defined APIs
3. WHEN data is needed THEN services SHALL not share databases directly

## Communication Requirements

### Requirement 2
**User Story:** As a service, I want to communicate with other services reliably so that the system functions correctly.

#### Acceptance Criteria
1. WHEN making synchronous calls THEN the system SHALL implement proper timeout and retry logic
2. WHEN publishing events THEN the system SHALL use reliable message queuing
3. WHEN handling failures THEN the system SHALL implement circuit breaker patterns

## Monitoring and Observability Requirements

### Requirement 3
**User Story:** As an operations team, I want comprehensive monitoring so that I can maintain system health.

#### Acceptance Criteria
1. WHEN the service processes requests THEN it SHALL log structured information
2. WHEN errors occur THEN the system SHALL emit metrics and alerts
3. WHEN tracing requests THEN the system SHALL provide distributed tracing information`,
        variables: [
          {
            name: 'serviceName',
            type: 'string',
            description: 'Name of the microservice',
            required: true,
            defaultValue: 'My Service',
          },
          {
            name: 'businessCapability',
            type: 'string',
            description: 'Primary business capability',
            required: true,
            defaultValue: 'User Management',
          },
        ],
        examples: [],
        metadata: {
          version: '1.0',
          author: 'CodeMentor AI',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-25'),
          usageCount: 45,
          rating: 4.6,
          tags: ['microservice', 'distributed', 'architecture', 'scalability'],
          prerequisites: ['Distributed systems', 'API design', 'Message queuing'],
        },
      },
    ];
  }
}

// Export singleton instance
export const templatesService = new TemplatesService();
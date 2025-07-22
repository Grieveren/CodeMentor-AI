import type { 
  SpecificationPhase, 
  ValidationResult, 
  PhaseValidationResult,
  RequirementDocument,
  DesignDocument,
  TaskDocument
} from '@/types/specifications';

// Validation rules for different phases
export class ValidationService {
  
  // Validate requirements document
  async validateRequirements(document: RequirementDocument): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    if (!document.content || document.content.trim().length === 0) {
      results.push({
        id: 'req-empty',
        type: 'completeness',
        severity: 'error',
        message: 'Requirements document cannot be empty',
        rule: 'document-completeness',
      });
      return results;
    }

    // Check for user stories
    const userStoryPattern = /\*\*User Story:\*\*|As a .* I want .* so that/gi;
    const userStoryMatches = document.content.match(userStoryPattern);
    
    if (!userStoryMatches || userStoryMatches.length === 0) {
      results.push({
        id: 'req-no-user-stories',
        type: 'format',
        severity: 'error',
        message: 'Requirements document must contain at least one user story',
        suggestion: 'Add user stories in the format: "As a [role], I want [feature], so that [benefit]"',
        rule: 'user-story-required',
      });
    }

    // Check for EARS format acceptance criteria
    const earsPattern = /WHEN .* THEN .* SHALL|IF .* THEN .* SHALL/gi;
    const earsMatches = document.content.match(earsPattern);
    
    if (!earsMatches || earsMatches.length === 0) {
      results.push({
        id: 'req-no-ears',
        type: 'format',
        severity: 'warning',
        message: 'Consider using EARS format for acceptance criteria',
        suggestion: 'Use format: "WHEN [event] THEN [system] SHALL [response]"',
        rule: 'ears-format-recommended',
      });
    }

    // Check document structure
    const hasIntroduction = /# Introduction|## Introduction/i.test(document.content);
    if (!hasIntroduction) {
      results.push({
        id: 'req-no-intro',
        type: 'completeness',
        severity: 'warning',
        message: 'Requirements document should include an introduction section',
        suggestion: 'Add an introduction section explaining the project overview',
        rule: 'document-structure',
      });
    }

    // Check for numbered requirements
    const requirementPattern = /### Requirement \d+|## Requirement \d+/gi;
    const requirementMatches = document.content.match(requirementPattern);
    
    if (!requirementMatches || requirementMatches.length < 2) {
      results.push({
        id: 'req-insufficient',
        type: 'completeness',
        severity: 'warning',
        message: 'Consider adding more detailed requirements (at least 2 requirements recommended)',
        suggestion: 'Break down functionality into specific, testable requirements',
        rule: 'requirement-quantity',
      });
    }

    // Check word count
    const wordCount = document.content.split(/\s+/).length;
    if (wordCount < 100) {
      results.push({
        id: 'req-too-short',
        type: 'completeness',
        severity: 'warning',
        message: 'Requirements document seems too brief for a complete specification',
        suggestion: 'Consider adding more detail to requirements and acceptance criteria',
        rule: 'document-length',
      });
    }

    return results;
  }

  // Validate design document
  async validateDesign(document: DesignDocument): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    if (!document.content || document.content.trim().length === 0) {
      results.push({
        id: 'design-empty',
        type: 'completeness',
        severity: 'error',
        message: 'Design document cannot be empty',
        rule: 'document-completeness',
      });
      return results;
    }

    // Check for required sections
    const requiredSections = [
      { pattern: /# Overview|## Overview/i, name: 'Overview', id: 'design-no-overview' },
      { pattern: /# Architecture|## Architecture/i, name: 'Architecture', id: 'design-no-architecture' },
      { pattern: /# Components|## Components/i, name: 'Components', id: 'design-no-components' },
      { pattern: /# Data Models?|## Data Models?/i, name: 'Data Models', id: 'design-no-data-models' },
    ];

    requiredSections.forEach(section => {
      if (!section.pattern.test(document.content)) {
        results.push({
          id: section.id,
          type: 'completeness',
          severity: 'warning',
          message: `Design document should include a ${section.name} section`,
          suggestion: `Add a ${section.name} section to describe the system ${section.name.toLowerCase()}`,
          rule: 'design-structure',
        });
      }
    });

    // Check for diagrams
    const diagramPattern = /```mermaid|```plantuml|!\[.*\]\(.*\)/gi;
    const diagramMatches = document.content.match(diagramPattern);
    
    if (!diagramMatches || diagramMatches.length === 0) {
      results.push({
        id: 'design-no-diagrams',
        type: 'quality',
        severity: 'info',
        message: 'Consider adding diagrams to illustrate the system architecture',
        suggestion: 'Use Mermaid diagrams or images to visualize system components and relationships',
        rule: 'visual-documentation',
      });
    }

    // Check for technology choices
    const technologyPattern = /technology|framework|library|database|language/gi;
    const technologyMatches = document.content.match(technologyPattern);
    
    if (!technologyMatches || technologyMatches.length < 3) {
      results.push({
        id: 'design-no-tech',
        type: 'completeness',
        severity: 'warning',
        message: 'Design document should specify technology choices',
        suggestion: 'Include information about frameworks, databases, and other technologies to be used',
        rule: 'technology-specification',
      });
    }

    // Check word count
    const wordCount = document.content.split(/\s+/).length;
    if (wordCount < 200) {
      results.push({
        id: 'design-too-short',
        type: 'completeness',
        severity: 'warning',
        message: 'Design document seems too brief for a complete specification',
        suggestion: 'Consider adding more detail to architecture and component descriptions',
        rule: 'document-length',
      });
    }

    return results;
  }

  // Validate task document
  async validateTasks(document: TaskDocument): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    if (!document.content || document.content.trim().length === 0) {
      results.push({
        id: 'tasks-empty',
        type: 'completeness',
        severity: 'error',
        message: 'Task document cannot be empty',
        rule: 'document-completeness',
      });
      return results;
    }

    // Check for task list format
    const taskPattern = /- \[ \]|- \[x\]/gi;
    const taskMatches = document.content.match(taskPattern);
    
    if (!taskMatches || taskMatches.length === 0) {
      results.push({
        id: 'tasks-no-checklist',
        type: 'format',
        severity: 'error',
        message: 'Task document must contain a checklist format with - [ ] items',
        suggestion: 'Use markdown checklist format: - [ ] Task description',
        rule: 'task-format',
      });
    } else if (taskMatches.length < 3) {
      results.push({
        id: 'tasks-insufficient',
        type: 'completeness',
        severity: 'warning',
        message: 'Consider breaking down work into more specific tasks (at least 3 recommended)',
        suggestion: 'Add more granular tasks for better project tracking',
        rule: 'task-granularity',
      });
    }

    // Check for numbered tasks
    const numberedTaskPattern = /- \[ \] \d+\./gi;
    const numberedMatches = document.content.match(numberedTaskPattern);
    
    if (!numberedMatches || numberedMatches.length === 0) {
      results.push({
        id: 'tasks-no-numbering',
        type: 'format',
        severity: 'info',
        message: 'Consider numbering tasks for better organization',
        suggestion: 'Use format: - [ ] 1. Task description or - [ ] 1.1 Subtask description',
        rule: 'task-numbering',
      });
    }

    // Check for requirement references
    const requirementRefPattern = /_Requirements?:.*\d+/gi;
    const refMatches = document.content.match(requirementRefPattern);
    
    if (!refMatches || refMatches.length === 0) {
      results.push({
        id: 'tasks-no-req-refs',
        type: 'quality',
        severity: 'warning',
        message: 'Tasks should reference specific requirements for traceability',
        suggestion: 'Add requirement references like "_Requirements: 1.1, 2.3_" to tasks',
        rule: 'requirement-traceability',
      });
    }

    // Check for subtasks
    const subtaskPattern = /- \[ \] \d+\.\d+/gi;
    const subtaskMatches = document.content.match(subtaskPattern);
    
    if (taskMatches && taskMatches.length > 5 && (!subtaskMatches || subtaskMatches.length === 0)) {
      results.push({
        id: 'tasks-no-subtasks',
        type: 'quality',
        severity: 'info',
        message: 'Consider breaking large tasks into subtasks for better management',
        suggestion: 'Use hierarchical numbering: 1. Main task, 1.1 Subtask, 1.2 Subtask',
        rule: 'task-hierarchy',
      });
    }

    return results;
  }

  // Validate a specific phase
  async validatePhase(
    phase: SpecificationPhase,
    documents: {
      requirements: RequirementDocument | null;
      design: DesignDocument | null;
      tasks: TaskDocument | null;
    }
  ): Promise<PhaseValidationResult> {
    let validationResults: ValidationResult[] = [];
    let isComplete = false;
    let completionPercentage = 0;

    switch (phase) {
      case 'requirements':
        if (documents.requirements) {
          validationResults = await this.validateRequirements(documents.requirements);
          const errorCount = validationResults.filter(r => r.severity === 'error').length;
          isComplete = errorCount === 0 && documents.requirements.content.length > 100;
          completionPercentage = isComplete ? 100 : Math.max(0, 100 - (errorCount * 25));
        } else {
          validationResults.push({
            id: 'req-missing',
            type: 'completeness',
            severity: 'error',
            message: 'Requirements document is missing',
            rule: 'document-required',
          });
        }
        break;

      case 'design':
        if (documents.design) {
          validationResults = await this.validateDesign(documents.design);
          const errorCount = validationResults.filter(r => r.severity === 'error').length;
          isComplete = errorCount === 0 && documents.design.content.length > 200;
          completionPercentage = isComplete ? 100 : Math.max(0, 100 - (errorCount * 25));
        } else {
          validationResults.push({
            id: 'design-missing',
            type: 'completeness',
            severity: 'error',
            message: 'Design document is missing',
            rule: 'document-required',
          });
        }
        break;

      case 'tasks':
        if (documents.tasks) {
          validationResults = await this.validateTasks(documents.tasks);
          const errorCount = validationResults.filter(r => r.severity === 'error').length;
          isComplete = errorCount === 0 && documents.tasks.content.includes('- [ ]');
          completionPercentage = isComplete ? 100 : Math.max(0, 100 - (errorCount * 25));
        } else {
          validationResults.push({
            id: 'tasks-missing',
            type: 'completeness',
            severity: 'error',
            message: 'Task document is missing',
            rule: 'document-required',
          });
        }
        break;

      case 'implementation':
      case 'review':
      case 'completed':
        // These phases would require additional validation logic
        // For now, mark as incomplete
        isComplete = false;
        completionPercentage = 0;
        validationResults.push({
          id: 'phase-not-implemented',
          type: 'completeness',
          severity: 'info',
          message: `${phase} phase validation not yet implemented`,
          rule: 'phase-validation',
        });
        break;
    }

    return {
      phase,
      isValid: validationResults.filter(r => r.severity === 'error').length === 0,
      isComplete,
      validationResults,
      completionPercentage,
      requiredFields: this.getRequiredFields(phase),
      missingFields: this.getMissingFields(phase, documents),
    };
  }

  // Get required fields for a phase
  private getRequiredFields(phase: SpecificationPhase): string[] {
    switch (phase) {
      case 'requirements':
        return ['user stories', 'acceptance criteria', 'business rules'];
      case 'design':
        return ['architecture overview', 'component specifications', 'data models', 'interfaces'];
      case 'tasks':
        return ['task breakdown', 'dependencies', 'effort estimation', 'requirement traceability'];
      case 'implementation':
        return ['code implementation', 'unit tests', 'integration tests'];
      case 'review':
        return ['code review', 'testing results', 'quality metrics'];
      case 'completed':
        return ['documentation', 'deployment', 'user acceptance'];
      default:
        return [];
    }
  }

  // Get missing fields for a phase
  private getMissingFields(
    phase: SpecificationPhase,
    documents: {
      requirements: RequirementDocument | null;
      design: DesignDocument | null;
      tasks: TaskDocument | null;
    }
  ): string[] {
    const requiredFields = this.getRequiredFields(phase);
    const missingFields: string[] = [];

    switch (phase) {
      case 'requirements':
        if (!documents.requirements) {
          return requiredFields;
        }
        if (!documents.requirements.content.includes('User Story')) {
          missingFields.push('user stories');
        }
        if (!documents.requirements.content.match(/WHEN .* THEN .* SHALL/i)) {
          missingFields.push('acceptance criteria');
        }
        break;

      case 'design':
        if (!documents.design) {
          return requiredFields;
        }
        if (!documents.design.content.match(/# Architecture|## Architecture/i)) {
          missingFields.push('architecture overview');
        }
        if (!documents.design.content.match(/# Components|## Components/i)) {
          missingFields.push('component specifications');
        }
        break;

      case 'tasks':
        if (!documents.tasks) {
          return requiredFields;
        }
        if (!documents.tasks.content.includes('- [ ]')) {
          missingFields.push('task breakdown');
        }
        if (!documents.tasks.content.match(/_Requirements?:/i)) {
          missingFields.push('requirement traceability');
        }
        break;
    }

    return missingFields;
  }
}

// Export singleton instance
export const validationService = new ValidationService();
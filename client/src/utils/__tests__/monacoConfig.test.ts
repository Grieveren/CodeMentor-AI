/**
 * Tests for Monaco Editor configuration for specification documents
 */
import { describe, it, expect } from '@jest/globals';
import {
  specificationTheme,
  specificationLanguageConfig,
  specificationTokenProvider,
  getSpecificationEditorOptions,
  validateSpecificationDocument,
} from '../monacoConfig';

describe('Monaco Configuration for Specifications', () => {
  describe('specificationTheme', () => {
    it('should have correct base theme', () => {
      expect(specificationTheme.base).toBe('vs');
      expect(specificationTheme.inherit).toBe(true);
    });

    it('should include specification-specific token rules', () => {
      const rules = specificationTheme.rules;
      expect(rules).toContainEqual({ token: 'user-story', foreground: '0066cc', fontStyle: 'bold' });
      expect(rules).toContainEqual({ token: 'acceptance-criteria', foreground: '008000' });
      expect(rules).toContainEqual({ token: 'ears-format', foreground: '800080', fontStyle: 'italic' });
    });
  });

  describe('specificationLanguageConfig', () => {
    it('should have correct comment configuration', () => {
      expect(specificationLanguageConfig.comments?.lineComment).toBe('//');
      expect(specificationLanguageConfig.comments?.blockComment).toEqual(['/*', '*/']);
    });

    it('should have auto-closing pairs', () => {
      const pairs = specificationLanguageConfig.autoClosingPairs;
      expect(pairs).toContainEqual({ open: '{', close: '}' });
      expect(pairs).toContainEqual({ open: '"', close: '"' });
    });
  });

  describe('specificationTokenProvider', () => {
    it('should have tokenizer root rules', () => {
      expect(specificationTokenProvider.tokenizer.root).toBeDefined();
      expect(Array.isArray(specificationTokenProvider.tokenizer.root)).toBe(true);
    });
  });

  describe('getSpecificationEditorOptions', () => {
    it('should return correct default options', () => {
      const options = getSpecificationEditorOptions();
      expect(options.language).toBe('specification');
      expect(options.theme).toBe('specification-theme');
      expect(options.readOnly).toBe(false);
      expect(options.wordWrap).toBe('on');
    });

    it('should respect readOnly parameter', () => {
      const readOnlyOptions = getSpecificationEditorOptions(true);
      expect(readOnlyOptions.readOnly).toBe(true);
    });
  });

  describe('validateSpecificationDocument', () => {
    describe('requirements validation', () => {
      it('should validate complete user stories', () => {
        const content = 'As a user, I want to login, so that I can access my account';
        const issues = validateSpecificationDocument(content, 'requirements');
        const userStoryIssues = issues.filter(issue => issue.message.includes('user story'));
        expect(userStoryIssues).toHaveLength(0);
      });

      it('should flag incomplete user stories', () => {
        const content = 'As a user, I want to login';
        const issues = validateSpecificationDocument(content, 'requirements');
        const userStoryIssues = issues.filter(issue => issue.message.includes('user story'));
        expect(userStoryIssues.length).toBeGreaterThan(0);
      });

      it('should validate EARS format requirements', () => {
        const content = 'WHEN user clicks login THEN system SHALL authenticate';
        const issues = validateSpecificationDocument(content, 'requirements');
        const earsIssues = issues.filter(issue => issue.message.includes('EARS'));
        expect(earsIssues).toHaveLength(0);
      });

      it('should flag malformed EARS requirements', () => {
        const content = 'WHEN user clicks login THEN system authenticates';
        const issues = validateSpecificationDocument(content, 'requirements');
        const earsIssues = issues.filter(issue => issue.message.includes('EARS'));
        expect(earsIssues.length).toBeGreaterThan(0);
      });
    });

    describe('design validation', () => {
      it('should check for required sections', () => {
        const content = 'Some design content without required sections';
        const issues = validateSpecificationDocument(content, 'design');
        expect(issues.some(issue => issue.message.includes('architecture'))).toBe(true);
      });

      it('should pass with all required sections', () => {
        const content = `
          # Architecture
          System architecture description
          
          # Components
          Component specifications
          
          # Data Models
          Data model definitions
        `;
        const issues = validateSpecificationDocument(content, 'design');
        const sectionIssues = issues.filter(issue => 
          issue.message.includes('architecture') || 
          issue.message.includes('components') || 
          issue.message.includes('data models')
        );
        expect(sectionIssues).toHaveLength(0);
      });
    });

    describe('tasks validation', () => {
      it('should check for task items', () => {
        const content = 'Some task content without task items';
        const issues = validateSpecificationDocument(content, 'tasks');
        expect(issues.some(issue => issue.message.includes('task items'))).toBe(true);
      });

      it('should suggest requirement references for tasks', () => {
        const content = '- [ ] 1.1 Implement user authentication';
        const issues = validateSpecificationDocument(content, 'tasks');
        expect(issues.some(issue => issue.message.includes('reference related requirements'))).toBe(true);
      });

      it('should pass with proper task format', () => {
        const content = `
          - [ ] 1.1 Implement user authentication
          _Requirements: 1.1_
        `;
        const issues = validateSpecificationDocument(content, 'tasks');
        const taskIssues = issues.filter(issue => issue.message.includes('task items'));
        expect(taskIssues).toHaveLength(0);
      });
    });
  });
});
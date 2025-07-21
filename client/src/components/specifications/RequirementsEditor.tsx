import React, { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { RequirementDocument, ValidationResult, SpecificationTemplate } from '../../types';
import { Button } from '../ui/Button';

import { Badge } from '../ui/Badge';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

interface RequirementsEditorProps {
  document: RequirementDocument | null;
  onSave: (content: string) => void;
  onValidate: (content: string) => Promise<ValidationResult[]>;
  onAIReview?: (content: string) => Promise<void>;
  templates?: SpecificationTemplate[];
  isLoading?: boolean;
  className?: string;
}

const REQUIREMENTS_TEMPLATE = `# Requirements Document

## Introduction

[Provide a clear introduction that summarizes the feature or system being specified]

## Requirements

### Requirement 1

**User Story:** As a [role], I want [feature], so that [benefit]

#### Acceptance Criteria

1. WHEN [event] THEN [system] SHALL [response]
2. IF [precondition] THEN [system] SHALL [response]
3. WHEN [event] AND [condition] THEN [system] SHALL [response]

### Requirement 2

**User Story:** As a [role], I want [feature], so that [benefit]

#### Acceptance Criteria

1. WHEN [event] THEN [system] SHALL [response]
2. WHEN [event] THEN [system] SHALL [response]
`;

const EARS_KEYWORDS = [
  'WHEN', 'IF', 'WHERE', 'WHILE', 'THEN', 'SHALL', 'SHOULD', 'MUST', 'AND', 'OR'
];

export const RequirementsEditor: React.FC<RequirementsEditorProps> = ({
  document,
  onSave,
  onValidate,
  onAIReview,
  templates = [],
  isLoading = false,
  className = ''
}) => {
  const [content, setContent] = useState(document?.content || REQUIREMENTS_TEMPLATE);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (document?.content) {
      setContent(document.content);
      setValidationResults(document.validationResults || []);
    }
  }, [document]);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Configure editor for requirements editing
    editor.updateOptions({
      wordWrap: 'on',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    });

    // Add EARS format auto-completion
    const monaco = (window as any).monaco;
    if (monaco) {
      monaco.languages.registerCompletionItemProvider('markdown', {
        provideCompletionItems: () => {
          const suggestions = EARS_KEYWORDS.map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            documentation: `EARS format keyword: ${keyword}`,
          }));

          // Add user story template
          suggestions.push({
            label: 'user-story',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '**User Story:** As a [role], I want [feature], so that [benefit]',
            documentation: 'User story template',
          });

          // Add acceptance criteria template
          suggestions.push({
            label: 'acceptance-criteria',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '#### Acceptance Criteria',
              '',
              '1. WHEN [event] THEN [system] SHALL [response]',
              '2. IF [precondition] THEN [system] SHALL [response]'
            ].join('\n'),
            documentation: 'Acceptance criteria template with EARS format',
          });

          return { suggestions };
        }
      });
    }
  }, []);

  const handleContentChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  }, []);

  const handleSave = useCallback(async () => {
    onSave(content);
  }, [content, onSave]);

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const results = await onValidate(content);
      setValidationResults(results);
      
      // Add markers to editor
      if (editorRef.current) {
        const monaco = (window as any).monaco;
        if (monaco) {
          const markers = results.map(result => ({
            startLineNumber: result.line || 1,
            startColumn: result.column || 1,
            endLineNumber: result.line || 1,
            endColumn: result.column ? result.column + 10 : 100,
            message: result.message,
            severity: result.type === 'error' ? monaco.MarkerSeverity.Error :
                     result.type === 'warning' ? monaco.MarkerSeverity.Warning :
                     monaco.MarkerSeverity.Info,
          }));
          
          monaco.editor.setModelMarkers(editorRef.current.getModel(), 'requirements', markers);
        }
      }
    } catch (error) {
      // Validation failed - error handled by UI
    } finally {
      setIsValidating(false);
    }
  }, [content, onValidate]);

  const handleAIReview = useCallback(async () => {
    if (onAIReview) {
      await onAIReview(content);
    }
  }, [content, onAIReview]);

  const handleTemplateSelect = useCallback((template: SpecificationTemplate) => {
    setContent(template.content);
    setShowTemplates(false);
  }, []);

  const getValidationSummary = () => {
    const errors = validationResults.filter(r => r.type === 'error').length;
    const warnings = validationResults.filter(r => r.type === 'warning').length;
    const infos = validationResults.filter(r => r.type === 'info').length;
    
    return { errors, warnings, infos };
  };

  const { errors, warnings, infos } = getValidationSummary();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Requirements Editor</h2>
          {document?.isComplete && (
            <Badge variant="success" className="ml-2">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={isLoading}
          >
            <BookOpenIcon className="h-4 w-4 mr-1" />
            Templates
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating || isLoading}
          >
            {isValidating ? 'Validating...' : 'Validate EARS'}
          </Button>
          
          {onAIReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIReview}
              disabled={isLoading}
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              AI Review
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Requirements Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect({ 
                id: 'default', 
                name: 'Default Template', 
                description: 'Basic requirements template',
                type: 'requirements',
                content: REQUIREMENTS_TEMPLATE,
                category: 'general',
                tags: []
              })}
            >
              Default Template
            </Button>
            {templates.filter(t => t.type === 'requirements').map(template => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Validation Results</h3>
            <div className="flex items-center space-x-2">
              {errors > 0 && (
                <Badge variant="error">
                  {errors} error{errors !== 1 ? 's' : ''}
                </Badge>
              )}
              {warnings > 0 && (
                <Badge variant="warning">
                  {warnings} warning{warnings !== 1 ? 's' : ''}
                </Badge>
              )}
              {infos > 0 && (
                <Badge variant="info">
                  {infos} info
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {validationResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 text-sm ${
                  result.type === 'error' ? 'text-red-700' :
                  result.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}
              >
                <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    {result.line && `Line ${result.line}: `}
                  </span>
                  {result.message}
                  {result.suggestion && (
                    <div className="text-xs mt-1 text-gray-600">
                      Suggestion: {result.suggestion}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          options={{
            wordWrap: 'on',
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            theme: 'vs',
            automaticLayout: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading editor...</div>
            </div>
          }
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div>
          EARS Format: Use WHEN, IF, WHERE, WHILE conditions with SHALL responses
        </div>
        <div>
          {content.split('\n').length} lines, {content.length} characters
        </div>
      </div>
    </div>
  );
};
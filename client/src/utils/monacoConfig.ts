/**
 * Monaco Editor configuration for specification documents
 */
import { editor, languages, MarkerSeverity, Range } from 'monaco-editor';

// Monaco Editor theme for specification documents
export const specificationTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Requirements document styling
    { token: 'user-story', foreground: '0066cc', fontStyle: 'bold' },
    { token: 'acceptance-criteria', foreground: '008000' },
    { token: 'ears-format', foreground: '800080', fontStyle: 'italic' },

    // Design document styling
    { token: 'architecture-section', foreground: 'cc6600', fontStyle: 'bold' },
    { token: 'component-spec', foreground: '006600' },
    { token: 'data-model', foreground: '660066' },

    // Task document styling
    { token: 'task-item', foreground: '000080' },
    { token: 'task-dependency', foreground: '808000', fontStyle: 'italic' },
    {
      token: 'requirement-reference',
      foreground: '800000',
      fontStyle: 'underline',
    },

    // Common elements
    { token: 'section-header', foreground: '000000', fontStyle: 'bold' },
    { token: 'validation-error', foreground: 'ff0000', fontStyle: 'bold' },
    { token: 'validation-warning', foreground: 'ff8000' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#f5f5f5',
    'editor.selectionBackground': '#add6ff',
    'editorLineNumber.foreground': '#999999',
    'editorGutter.background': '#f8f8f8',
  },
};

// Language configuration for specification documents
export const specificationLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' },
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*#\\s*(Requirements|Design|Tasks|Implementation)'),
      end: new RegExp('^\\s*#\\s*(Requirements|Design|Tasks|Implementation)'),
    },
  },
};

// Tokenization rules for specification documents
export const specificationTokenProvider: languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Section headers
      [/^#\s+(Requirements|Design|Tasks|Implementation).*$/, 'section-header'],
      [/^##\s+.*$/, 'section-header'],
      [/^###\s+.*$/, 'section-header'],

      // User stories
      [/\*\*User Story:\*\*/, 'user-story'],
      [/As a .*, I want .*, so that .*/, 'user-story'],

      // Acceptance criteria
      [/\*\*Acceptance Criteria\*\*/, 'acceptance-criteria'],
      [
        /^\d+\.\s+(WHEN|IF|WHILE|WHERE|AS LONG AS).*THEN.*SHALL.*/,
        'ears-format',
      ],
      [/^\d+\.\s+GIVEN.*WHEN.*THEN.*/, 'acceptance-criteria'],

      // Architecture sections
      [/\*\*Architecture\*\*/, 'architecture-section'],
      [/\*\*Components\*\*/, 'architecture-section'],
      [/\*\*Data Models\*\*/, 'architecture-section'],

      // Component specifications
      [/^-\s+\*\*Component:\*\*/, 'component-spec'],
      [/^-\s+\*\*Interface:\*\*/, 'component-spec'],

      // Data models
      [/^-\s+\*\*Model:\*\*/, 'data-model'],
      [/^-\s+\*\*Field:\*\*/, 'data-model'],

      // Task items
      [/^-\s+\[\s*\]\s+\d+(\.\d+)*\s+/, 'task-item'],
      [/^-\s+\[x\]\s+\d+(\.\d+)*\s+/, 'task-item'],

      // Task dependencies
      [/Dependencies:\s*.*/, 'task-dependency'],
      [/Depends on:\s*.*/, 'task-dependency'],

      // Requirement references
      [/_Requirements?:\s*[\d.,\s]+_/, 'requirement-reference'],
      [/_Req\s*[\d.,\s]+_/, 'requirement-reference'],

      // Validation markers
      [/\[ERROR\].*/, 'validation-error'],
      [/\[WARNING\].*/, 'validation-warning'],
      [/\[INFO\].*/, 'validation-info'],

      // Standard markdown
      [/\*\*.*?\*\*/, 'strong'],
      [/\*.*?\*/, 'emphasis'],
      [/`.*?`/, 'code'],
      [/```[\s\S]*?```/, 'code-block'],
    ],
  },
};

// Completion provider for specification documents
export const specificationCompletionProvider: languages.CompletionItemProvider =
  {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: languages.CompletionItem[] = [
        // User story templates
        {
          label: 'user-story',
          kind: languages.CompletionItemKind.Snippet,
          insertText: [
            '**User Story:** As a ${1:role}, I want ${2:feature}, so that ${3:benefit}',
            '',
            '#### Acceptance Criteria',
            '',
            '1. WHEN ${4:event} THEN ${5:system} SHALL ${6:response}',
            '2. ${7:additional criteria}',
          ].join('\n'),
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation:
            'Insert a user story template with acceptance criteria',
          range,
        },

        // EARS format templates
        {
          label: 'ears-when',
          kind: languages.CompletionItemKind.Snippet,
          insertText: 'WHEN ${1:event} THEN ${2:system} SHALL ${3:response}',
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'EARS format: Event-driven requirement',
          range,
        },

        {
          label: 'ears-if',
          kind: languages.CompletionItemKind.Snippet,
          insertText: 'IF ${1:condition} THEN ${2:system} SHALL ${3:response}',
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'EARS format: Conditional requirement',
          range,
        },

        // Component specification template
        {
          label: 'component-spec',
          kind: languages.CompletionItemKind.Snippet,
          insertText: [
            '**Component:** ${1:ComponentName}',
            '- **Purpose:** ${2:component purpose}',
            '- **Interfaces:** ${3:interfaces}',
            '- **Dependencies:** ${4:dependencies}',
            '- **Responsibilities:**',
            '  - ${5:responsibility 1}',
            '  - ${6:responsibility 2}',
          ].join('\n'),
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a component specification template',
          range,
        },

        // Data model template
        {
          label: 'data-model',
          kind: languages.CompletionItemKind.Snippet,
          insertText: [
            '**Model:** ${1:ModelName}',
            '- **Fields:**',
            '  - ${2:fieldName}: ${3:type} (${4:required/optional}) - ${5:description}',
            '- **Relationships:**',
            '  - ${6:relationshipType} with ${7:RelatedModel}',
            '- **Constraints:**',
            '  - ${8:constraint description}',
          ].join('\n'),
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a data model specification template',
          range,
        },

        // Task template
        {
          label: 'task-item',
          kind: languages.CompletionItemKind.Snippet,
          insertText: [
            '- [ ] ${1:task number} ${2:task description}',
            '  - ${3:task details}',
            '  - _Requirements: ${4:requirement references}_',
          ].join('\n'),
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a task item template',
          range,
        },
      ];

      return { suggestions };
    },
  };

// Hover provider for specification documents
export const specificationHoverProvider: languages.HoverProvider = {
  provideHover: (model, position) => {
    const word = model.getWordAtPosition(position);
    if (!word) return null;

    const line = model.getLineContent(position.lineNumber);

    // Provide hover information for EARS keywords
    if (
      line.includes('WHEN') &&
      line.includes('THEN') &&
      line.includes('SHALL')
    ) {
      return {
        range: new Range(
          position.lineNumber,
          1,
          position.lineNumber,
          line.length + 1
        ),
        contents: [
          { value: '**EARS Format Requirement**' },
          {
            value:
              'Event-driven requirement using Easy Approach to Requirements Syntax (EARS)',
          },
          { value: 'Format: WHEN [event] THEN [system] SHALL [response]' },
        ],
      };
    }

    if (
      line.includes('IF') &&
      line.includes('THEN') &&
      line.includes('SHALL')
    ) {
      return {
        range: new Range(
          position.lineNumber,
          1,
          position.lineNumber,
          line.length + 1
        ),
        contents: [
          { value: '**EARS Format Requirement**' },
          {
            value:
              'Conditional requirement using Easy Approach to Requirements Syntax (EARS)',
          },
          { value: 'Format: IF [condition] THEN [system] SHALL [response]' },
        ],
      };
    }

    // Provide hover for user story format
    if (
      line.includes('As a') &&
      line.includes('I want') &&
      line.includes('so that')
    ) {
      return {
        range: new Range(
          position.lineNumber,
          1,
          position.lineNumber,
          line.length + 1
        ),
        contents: [
          { value: '**User Story**' },
          {
            value:
              'Standard user story format for capturing requirements from user perspective',
          },
          { value: 'Format: As a [role], I want [feature], so that [benefit]' },
        ],
      };
    }

    return null;
  },
};

// Diagnostic provider for specification validation
export const specificationDiagnosticsProvider = (
  model: editor.ITextModel
): editor.IMarkerData[] => {
  const markers: editor.IMarkerData[] = [];
  const content = model.getValue();
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;

    // Check for incomplete user stories
    if (
      line.includes('As a') &&
      (!line.includes('I want') || !line.includes('so that'))
    ) {
      markers.push({
        severity: MarkerSeverity.Warning,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message:
          'Incomplete user story format. Expected: As a [role], I want [feature], so that [benefit]',
        code: 'incomplete-user-story',
      });
    }

    // Check for malformed EARS requirements
    if (
      (line.includes('WHEN') || line.includes('IF')) &&
      !line.includes('SHALL')
    ) {
      markers.push({
        severity: MarkerSeverity.Error,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'EARS format requirement missing SHALL keyword',
        code: 'malformed-ears',
      });
    }

    // Check for task items without requirement references
    if (
      line.match(/^-\s+\[\s*\]\s+\d+/) &&
      !line.includes('_Requirements:') &&
      !content.includes(`_Requirements: ${line.match(/\d+(\.\d+)*/)?.[0]}_`)
    ) {
      markers.push({
        severity: MarkerSeverity.Info,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'Task should reference related requirements for traceability',
        code: 'missing-requirement-reference',
      });
    }
  });

  return markers;
};

// Initialize Monaco Editor for specification documents
export const initializeSpecificationEditor = () => {
  // Register the specification language
  languages.register({ id: 'specification' });

  // Set language configuration
  languages.setLanguageConfiguration(
    'specification',
    specificationLanguageConfig
  );

  // Set tokenization provider
  languages.setMonarchTokensProvider(
    'specification',
    specificationTokenProvider
  );

  // Register completion provider
  languages.registerCompletionItemProvider(
    'specification',
    specificationCompletionProvider
  );

  // Register hover provider
  languages.registerHoverProvider('specification', specificationHoverProvider);

  // Define and set theme
  editor.defineTheme('specification-theme', specificationTheme);

  // Specification editor language and theme initialized
};

// Default editor options for specification documents
export const getSpecificationEditorOptions = (
  readOnly = false
): editor.IStandaloneEditorConstructionOptions => ({
  language: 'specification',
  theme: 'specification-theme',
  readOnly,
  wordWrap: 'on',
  lineNumbers: 'on',
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  renderWhitespace: 'selection',
  rulers: [80, 120],
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'always',
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  suggest: {
    showKeywords: true,
    showSnippets: true,
    showFunctions: false,
    showConstructors: false,
    showFields: false,
    showVariables: false,
    showClasses: false,
    showStructs: false,
    showInterfaces: false,
    showModules: false,
    showProperties: false,
    showEvents: false,
    showOperators: false,
    showUnits: false,
    showValues: false,
    showConstants: false,
    showEnums: false,
    showEnumMembers: false,
    showColors: false,
    showFiles: false,
    showReferences: false,
    showFolders: false,
    showTypeParameters: false,
    showIssues: false,
    showUsers: false,
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
  parameterHints: { enabled: false },
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: 'on',
  accessibilitySupport: 'auto',
  autoIndent: 'full',
  contextmenu: true,
  copyWithSyntaxHighlighting: true,
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'on',
  cursorStyle: 'line',
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  dragAndDrop: true,
  emptySelectionClipboard: true,
  extraEditorClassName: 'specification-editor',
  fastScrollSensitivity: 5,
  find: {
    cursorMoveOnType: true,
    seedSearchStringFromSelection: 'always',
    autoFindInSelection: 'never',
  },
  fixedOverflowWidgets: false,
  hover: { enabled: true, delay: 300 },
  lightbulb: { enabled: false },
  links: true,
  mouseWheelScrollSensitivity: 1,
  mouseWheelZoom: false,
  multiCursorMergeOverlapping: true,
  multiCursorModifier: 'alt',
  overviewRulerBorder: true,
  overviewRulerLanes: 2,
  padding: { top: 10, bottom: 10 },
  renderControlCharacters: false,
  renderFinalNewline: 'on',
  renderLineHighlight: 'line',
  renderLineHighlightOnlyWhenFocus: false,
  renderValidationDecorations: 'editable',
  revealHorizontalRightPadding: 30,
  roundedSelection: true,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    arrowSize: 11,
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    verticalScrollbarSize: 14,
    horizontalScrollbarSize: 12,
    verticalSliderSize: 14,
    horizontalSliderSize: 12,
  },
  selectOnLineNumbers: true,
  selectionClipboard: true,
  selectionHighlight: true,
  showDeprecated: true,
  smoothScrolling: false,
  stopRenderingLineAfter: 10000,
  tabCompletion: 'on',
  useTabStops: true,
  wordSeparators: '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?',
  wordWrapBreakAfterCharacters: '\t})]?|/&.,;¢°′″‰℃、。｡､￠',
  wordWrapBreakBeforeCharacters: '([{\'"〈《「『【〔（［｛｢£¥＄￡￥+＋',
  wrappingIndent: 'indent',
  wrappingStrategy: 'advanced',
});

// Validation function for specification documents
export const validateSpecificationDocument = (
  content: string,
  type: 'requirements' | 'design' | 'tasks'
) => {
  const lines = content.split('\n');
  const issues: {
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }[] = [];

  switch (type) {
    case 'requirements': {
      // Validate requirements document structure
      let hasUserStories = false;
      let hasAcceptanceCriteria = false;

      lines.forEach((line, index) => {
        if (line.includes('User Story:')) hasUserStories = true;
        if (line.includes('Acceptance Criteria')) hasAcceptanceCriteria = true;

        // Check user story format
        if (
          line.includes('As a') &&
          (!line.includes('I want') || !line.includes('so that'))
        ) {
          issues.push({
            line: index + 1,
            message: 'Incomplete user story format',
            severity: 'warning',
          });
        }

        // Check EARS format
        if (
          (line.includes('WHEN') || line.includes('IF')) &&
          !line.includes('SHALL')
        ) {
          issues.push({
            line: index + 1,
            message: 'EARS format requirement missing SHALL keyword',
            severity: 'error',
          });
        }
      });

      if (!hasUserStories) {
        issues.push({
          line: 1,
          message: 'Requirements document should contain user stories',
          severity: 'warning',
        });
      }
      if (!hasAcceptanceCriteria) {
        issues.push({
          line: 1,
          message: 'Requirements document should contain acceptance criteria',
          severity: 'warning',
        });
      }
      break;
    }

    case 'design': {
      // Validate design document structure
      let hasArchitecture = false;
      let hasComponents = false;
      let hasDataModels = false;

      lines.forEach(line => {
        if (line.includes('Architecture')) hasArchitecture = true;
        if (line.includes('Components')) hasComponents = true;
        if (line.includes('Data Model')) hasDataModels = true;
      });

      if (!hasArchitecture) {
        issues.push({
          line: 1,
          message: 'Design document should include architecture section',
          severity: 'warning',
        });
      }
      if (!hasComponents) {
        issues.push({
          line: 1,
          message: 'Design document should include components section',
          severity: 'info',
        });
      }
      if (!hasDataModels) {
        issues.push({
          line: 1,
          message: 'Design document should include data models section',
          severity: 'info',
        });
      }
      break;
    }

    case 'tasks': {
      // Validate task document structure
      let hasTaskItems = false;

      lines.forEach((line, index) => {
        if (line.match(/^\s*-\s+\[\s*\]/)) {
          hasTaskItems = true;

          // Check for requirement references
          const taskNumber = line.match(/\d+(\.\d+)*/)?.[0];
          if (
            taskNumber &&
            !line.includes('_Requirements:') &&
            !content.includes(`_Requirements: ${taskNumber}_`)
          ) {
            issues.push({
              line: index + 1,
              message: 'Task should reference related requirements',
              severity: 'info',
            });
          }
        }
      });

      if (!hasTaskItems) {
        issues.push({
          line: 1,
          message: 'Task document should contain task items',
          severity: 'warning',
        });
      }
      break;
    }
  }

  return issues;
};

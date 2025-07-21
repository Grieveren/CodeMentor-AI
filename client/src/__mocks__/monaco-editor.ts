export const editor = {
  IStandaloneThemeData: {},
  IStandaloneEditorConstructionOptions: {},
  ITextModel: {},
  IMarkerData: {},
  defineTheme: jest.fn(),
  create: jest.fn(),
  createModel: jest.fn(),
};

export const languages = {
  CompletionItemKind: {
    Snippet: 0,
  },
  CompletionItemInsertTextRule: {
    InsertAsSnippet: 0,
  },
  LanguageConfiguration: {},
  IMonarchLanguage: {},
  CompletionItemProvider: {},
  HoverProvider: {},
  CompletionItem: {},
  register: jest.fn(),
  setLanguageConfiguration: jest.fn(),
  setMonarchTokensProvider: jest.fn(),
  registerCompletionItemProvider: jest.fn(),
  registerHoverProvider: jest.fn(),
};

export const MarkerSeverity = {
  Error: 8,
  Warning: 4,
  Info: 2,
  Hint: 1,
};

export const Range = jest.fn(
  (startLineNumber, startColumn, endLineNumber, endColumn) => ({
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn,
  })
);

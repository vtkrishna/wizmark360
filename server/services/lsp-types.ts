/**
 * LSP (Language Server Protocol) Type Definitions
 * 
 * Provides TypeScript types for LSP operations, supporting surgical code editing
 * with 90% token reduction vs full file rewrites (The Replit Killer)
 */

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Location {
  uri: string;
  range: Range;
}

export interface SymbolInformation {
  name: string;
  kind: SymbolKind;
  location: Location;
  containerName?: string;
}

export interface DocumentSymbol {
  name: string;
  detail?: string;
  kind: SymbolKind;
  range: Range;
  selectionRange: Range;
  children?: DocumentSymbol[];
}

export enum SymbolKind {
  File = 1,
  Module = 2,
  Namespace = 3,
  Package = 4,
  Class = 5,
  Method = 6,
  Property = 7,
  Field = 8,
  Constructor = 9,
  Enum = 10,
  Interface = 11,
  Function = 12,
  Variable = 13,
  Constant = 14,
  String = 15,
  Number = 16,
  Boolean = 17,
  Array = 18,
  Object = 19,
  Key = 20,
  Null = 21,
  EnumMember = 22,
  Struct = 23,
  Event = 24,
  Operator = 25,
  TypeParameter = 26
}

export interface TextEdit {
  range: Range;
  newText: string;
}

export interface Hover {
  contents: string | { language: string; value: string };
  range?: Range;
}

export interface CompletionItem {
  label: string;
  kind?: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18
}

export interface Diagnostic {
  range: Range;
  severity: DiagnosticSeverity;
  code?: string | number;
  source?: string;
  message: string;
}

export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4
}

export interface WorkspaceEdit {
  changes: { [uri: string]: TextEdit[] };
}

export interface RenameParams {
  textDocument: { uri: string };
  position: Position;
  newName: string;
}

export interface CodeAction {
  title: string;
  kind?: string;
  diagnostics?: Diagnostic[];
  edit?: WorkspaceEdit;
  command?: Command;
}

export interface Command {
  title: string;
  command: string;
  arguments?: any[];
}

export interface LspLanguage {
  language: string;
  extensions: string[];
  serverCommand: string;
  serverArgs: string[];
}

export interface LspEditOperation {
  type: 'insert_after' | 'replace' | 'delete' | 'refactor';
  fileUri: string;
  symbolName: string;
  code?: string;
  newName?: string;
}

export interface LspEditResult {
  success: boolean;
  message: string;
  edits?: TextEdit[];
  error?: string;
}

export interface CodeComplexity {
  functionName: string;
  complexity: number;
  location: Location;
}

export interface LspAnalysisResult {
  deadCode?: Range[];
  unusedImports?: TextEdit[];
  complexity?: CodeComplexity[];
  diagnostics?: Diagnostic[];
}

export interface LspServiceConfig {
  rootPath: string;
  enabledLanguages: string[];
  timeout?: number;
  maxMemory?: string;
}

export const SUPPORTED_LANGUAGES: LspLanguage[] = [
  {
    language: 'typescript',
    extensions: ['.ts', '.tsx'],
    serverCommand: 'typescript-language-server',
    serverArgs: ['--stdio']
  },
  {
    language: 'javascript',
    extensions: ['.js', '.jsx'],
    serverCommand: 'typescript-language-server',
    serverArgs: ['--stdio']
  },
  {
    language: 'python',
    extensions: ['.py'],
    serverCommand: 'pylsp',
    serverArgs: []
  },
  {
    language: 'go',
    extensions: ['.go'],
    serverCommand: 'gopls',
    serverArgs: []
  },
  {
    language: 'java',
    extensions: ['.java'],
    serverCommand: 'jdtls',
    serverArgs: []
  },
  {
    language: 'rust',
    extensions: ['.rs'],
    serverCommand: 'rust-analyzer',
    serverArgs: []
  }
];

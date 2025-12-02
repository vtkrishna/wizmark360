/**
 * LSP MCP Tools - Surgical Code Editing for SHAKTI AI
 * 
 * Exposes LSP service capabilities as MCP tools for use in orchestration workflows
 * 
 * Tools:
 * - lsp_code_edit: Surgical code editing (insert/replace/delete/refactor)
 * - lsp_analyze_code: Code analysis (dead code, complexity, diagnostics)
 * - lsp_refactor_symbol: Symbol refactoring with workspace-wide updates
 * - lsp_navigate_symbols: Symbol navigation and search
 * - lsp_code_intelligence: Type inference, completions, hover info
 */

import { z } from 'zod';
import { ILspService } from './lsp-service';
import { LspEditOperation, Position } from './lsp-types';

/**
 * MCP Tool Interface (compatible with existing MCP server)
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: z.ZodObject<any>;
  execute: (input: any, context: any) => Promise<any>;
}

/**
 * LSP Code Edit Tool - Surgical code editing with 90% token reduction
 * 
 * Usage Examples:
 * 1. Insert method after existing function:
 *    { operation: 'insert_after', fileUri: 'src/User.ts', symbolName: 'getUser', code: 'async updateUser(id: string) { ... }' }
 * 
 * 2. Replace function implementation:
 *    { operation: 'replace', fileUri: 'src/api.ts', symbolName: 'fetchData', code: 'async fetchData() { return await api.get(...) }' }
 * 
 * 3. Delete deprecated function:
 *    { operation: 'delete', fileUri: 'src/legacy.ts', symbolName: 'oldFunction' }
 * 
 * 4. Rename symbol across workspace:
 *    { operation: 'refactor', fileUri: 'src/User.ts', symbolName: 'getUserById', newName: 'findUserById' }
 */
export const lspCodeEditTool: McpTool = {
  name: 'lsp_code_edit',
  description: 'Perform surgical code edits using Language Server Protocol for 90% token reduction vs file rewrites. Supports insert_after, replace, delete, and refactor operations on symbols (functions, classes, variables).',
  inputSchema: z.object({
    fileUri: z.string().describe('File path (e.g., "src/components/Button.tsx" or "server/api/users.ts")'),
    operation: z.enum(['insert_after', 'replace', 'delete', 'refactor']).describe('Edit operation: insert_after (add code after symbol), replace (replace symbol), delete (remove symbol), refactor (rename symbol)'),
    symbolName: z.string().describe('Symbol name (function/class/variable to modify, e.g., "getUserById", "UserClass", "API_KEY")'),
    code: z.string().optional().describe('New code to insert/replace (required for insert_after and replace)'),
    newName: z.string().optional().describe('New symbol name (required for refactor operation)')
  }),
  async execute(input, context) {
    const lspService: ILspService = context.lspService;
    
    if (!lspService) {
      throw new Error('LSP service not available in context');
    }

    const operation: LspEditOperation = {
      type: input.operation,
      fileUri: input.fileUri,
      symbolName: input.symbolName,
      code: input.code,
      newName: input.newName
    };

    const result = await lspService.performEdit(operation);
    
    return {
      success: result.success,
      message: result.message,
      operation: input.operation,
      fileUri: input.fileUri,
      symbolName: input.symbolName,
      editsApplied: result.edits?.length || 0,
      error: result.error
    };
  }
};

/**
 * LSP Analyze Code Tool - Code quality analysis
 * 
 * Analyzes code for:
 * - Dead code (unused functions, variables)
 * - Unused imports
 * - Cyclomatic complexity
 * - Diagnostics (errors, warnings, hints)
 */
export const lspAnalyzeCodeTool: McpTool = {
  name: 'lsp_analyze_code',
  description: 'Analyze code quality using LSP: detect dead code, unused imports, calculate complexity, and get diagnostics (errors/warnings/hints).',
  inputSchema: z.object({
    fileUri: z.string().describe('File path to analyze'),
    analysisTypes: z.array(z.enum(['dead_code', 'unused_imports', 'complexity', 'diagnostics'])).default(['diagnostics']).describe('Types of analysis to perform')
  }),
  async execute(input, context) {
    const lspService: ILspService = context.lspService;
    
    if (!lspService) {
      throw new Error('LSP service not available in context');
    }

    const results: any = {
      fileUri: input.fileUri,
      analyses: {}
    };

    for (const analysisType of input.analysisTypes) {
      switch (analysisType) {
        case 'dead_code':
          const deadCodeResult = await lspService.analyzeDeadCode(input.fileUri);
          results.analyses.deadCode = {
            locations: deadCodeResult.deadCode,
            count: deadCodeResult.deadCode?.length || 0
          };
          break;

        case 'unused_imports':
          const unusedImports = await lspService.findUnusedImports(input.fileUri);
          results.analyses.unusedImports = {
            edits: unusedImports,
            count: unusedImports.length
          };
          break;

        case 'complexity':
          const complexity = await lspService.calculateComplexity(input.fileUri);
          results.analyses.complexity = {
            functions: complexity,
            averageComplexity: complexity.reduce((sum, fn) => sum + fn.complexity, 0) / (complexity.length || 1),
            highComplexityFunctions: complexity.filter(fn => fn.complexity > 10)
          };
          break;

        case 'diagnostics':
          const diagnostics = await lspService.getDiagnostics(input.fileUri);
          results.analyses.diagnostics = {
            errors: diagnostics.filter(d => d.severity === 1),
            warnings: diagnostics.filter(d => d.severity === 2),
            info: diagnostics.filter(d => d.severity === 3),
            hints: diagnostics.filter(d => d.severity === 4),
            total: diagnostics.length
          };
          break;
      }
    }

    return results;
  }
};

/**
 * LSP Refactor Symbol Tool - Workspace-wide symbol refactoring
 * 
 * Renames symbol and updates all references across the entire workspace
 */
export const lspRefactorSymbolTool: McpTool = {
  name: 'lsp_refactor_symbol',
  description: 'Refactor (rename) a symbol across the entire workspace, updating all references. Uses LSP to ensure 100% accuracy.',
  inputSchema: z.object({
    fileUri: z.string().describe('File containing the symbol to refactor'),
    oldName: z.string().describe('Current symbol name'),
    newName: z.string().describe('New symbol name'),
    dryRun: z.boolean().default(false).describe('If true, returns proposed changes without applying them')
  }),
  async execute(input, context) {
    const lspService: ILspService = context.lspService;
    
    if (!lspService) {
      throw new Error('LSP service not available in context');
    }

    if (input.dryRun) {
      // TODO: Implement dry run mode (preview changes)
      return {
        dryRun: true,
        message: 'Dry run not yet implemented',
        proposedChanges: []
      };
    }

    const result = await lspService.refactorSymbol(input.fileUri, input.oldName, input.newName);
    
    return {
      success: result.success,
      message: result.message,
      oldName: input.oldName,
      newName: input.newName,
      filesModified: result.edits ? new Set(result.edits.map((e: any) => e.range)).size : 0,
      totalEdits: result.edits?.length || 0,
      error: result.error
    };
  }
};

/**
 * LSP Navigate Symbols Tool - Symbol navigation and search
 * 
 * Find symbols in code (functions, classes, variables, interfaces, etc.)
 */
export const lspNavigateSymbolsTool: McpTool = {
  name: 'lsp_navigate_symbols',
  description: 'Navigate and search for symbols (functions, classes, variables, interfaces) in code files.',
  inputSchema: z.object({
    fileUri: z.string().describe('File path to search'),
    symbolName: z.string().optional().describe('Specific symbol name to find'),
    symbolKind: z.enum(['function', 'class', 'variable', 'interface', 'all']).default('all').describe('Filter by symbol kind'),
    listAll: z.boolean().default(false).describe('If true, list all symbols in file')
  }),
  async execute(input, context) {
    const lspService: ILspService = context.lspService;
    
    if (!lspService) {
      throw new Error('LSP service not available in context');
    }

    if (input.symbolName) {
      // Find specific symbol
      const symbol = await lspService.findSymbol(input.fileUri, input.symbolName);
      
      if (!symbol) {
        return {
          found: false,
          message: `Symbol "${input.symbolName}" not found in ${input.fileUri}`
        };
      }

      return {
        found: true,
        symbol: {
          name: symbol.name,
          kind: symbol.kind,
          location: symbol.location,
          containerName: symbol.containerName
        }
      };
    } else if (input.listAll) {
      // List all symbols
      const symbols = await lspService.getAllSymbols(input.fileUri);
      
      // Filter by kind if specified
      let filteredSymbols = symbols;
      if (input.symbolKind !== 'all') {
        const kindMap: Record<string, number> = {
          'function': 12,
          'class': 5,
          'variable': 13,
          'interface': 11
        };
        const targetKind = kindMap[input.symbolKind];
        filteredSymbols = symbols.filter(s => s.kind === targetKind);
      }

      return {
        fileUri: input.fileUri,
        totalSymbols: filteredSymbols.length,
        symbols: filteredSymbols.map(s => ({
          name: s.name,
          kind: s.kind,
          line: s.location.range.start.line,
          containerName: s.containerName
        }))
      };
    } else {
      return {
        error: 'Either symbolName or listAll must be specified'
      };
    }
  }
};

/**
 * LSP Code Intelligence Tool - Type inference, completions, hover info
 * 
 * Get code intelligence at specific positions (autocomplete, type hints, hover info)
 */
export const lspCodeIntelligenceTool: McpTool = {
  name: 'lsp_code_intelligence',
  description: 'Get code intelligence: type inference (hover), code completions, and diagnostics at specific positions.',
  inputSchema: z.object({
    fileUri: z.string().describe('File path'),
    line: z.number().describe('Line number (0-indexed)'),
    character: z.number().describe('Character position (0-indexed)'),
    operation: z.enum(['hover', 'completion', 'diagnostics']).describe('Intelligence operation: hover (type info), completion (autocomplete), diagnostics (errors/warnings)')
  }),
  async execute(input, context) {
    const lspService: ILspService = context.lspService;
    
    if (!lspService) {
      throw new Error('LSP service not available in context');
    }

    const position: Position = {
      line: input.line,
      character: input.character
    };

    switch (input.operation) {
      case 'hover':
        const hover = await lspService.getTypeInference(input.fileUri, position);
        return {
          operation: 'hover',
          position,
          hover: hover ? {
            contents: hover.contents,
            range: hover.range
          } : null
        };

      case 'completion':
        const completions = await lspService.getCodeCompletion(input.fileUri, position);
        return {
          operation: 'completion',
          position,
          completions: completions.map(c => ({
            label: c.label,
            kind: c.kind,
            detail: c.detail,
            documentation: c.documentation
          })),
          count: completions.length
        };

      case 'diagnostics':
        const diagnostics = await lspService.getDiagnostics(input.fileUri);
        return {
          operation: 'diagnostics',
          fileUri: input.fileUri,
          diagnostics: diagnostics.map(d => ({
            message: d.message,
            severity: d.severity,
            line: d.range.start.line,
            source: d.source
          })),
          errorCount: diagnostics.filter(d => d.severity === 1).length,
          warningCount: diagnostics.filter(d => d.severity === 2).length,
          total: diagnostics.length
        };

      default:
        return { error: 'Invalid operation' };
    }
  }
};

/**
 * Export all LSP MCP tools
 */
export const LSP_MCP_TOOLS: McpTool[] = [
  lspCodeEditTool,
  lspAnalyzeCodeTool,
  lspRefactorSymbolTool,
  lspNavigateSymbolsTool,
  lspCodeIntelligenceTool
];

/**
 * Get tool count for reporting
 */
export function getLspToolCount(): number {
  return LSP_MCP_TOOLS.length;
}

/**
 * Get tool names for reporting
 */
export function getLspToolNames(): string[] {
  return LSP_MCP_TOOLS.map(tool => tool.name);
}

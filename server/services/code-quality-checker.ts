/**
 * Code Quality Checker Service
 * Enforces 100% production-ready code standards
 * NO TODO, FIXME, console.log, mock code, or stubs allowed
 */

interface QualityIssue {
  severity: 'critical' | 'error' | 'warning';
  message: string;
  line: number;
  column?: number;
  rule: string;
}

interface QualityReport {
  passed: boolean;
  issues: QualityIssue[];
  complexity: number;
  hasTests: boolean;
  productionReady: boolean;
}

export class CodeQualityChecker {
  private forbiddenPatterns = [
    { pattern: /TODO|FIXME|HACK|XXX|TEMP|WIP/gi, rule: 'no-todo-comments', message: 'Remove TODO/FIXME/HACK comments before production' },
    { pattern: /console\.log|console\.debug/g, rule: 'no-console-log', message: 'Replace console.log with structured logging (logger.info, logger.error)' },
    { pattern: /debugger/gi, rule: 'no-debugger', message: 'Remove debugger statements' },
    { pattern: /:\s*any\b/g, rule: 'no-explicit-any', message: 'Avoid using "any" type. Use specific types or "unknown"' },
    { pattern: /\/\/\s*@ts-ignore|\/\/\s*@ts-nocheck/g, rule: 'no-ts-ignore', message: 'Do not suppress TypeScript errors. Fix the underlying issue' },
    { pattern: /password|secret|api_key|token/i, rule: 'potential-secret', message: 'Possible hardcoded secret detected. Use environment variables' }
  ];

  private mockPatterns = [
    { pattern: /\bmock\w*/gi, rule: 'no-mock-code', message: 'Remove mock code. Implement production version' },
    { pattern: /\bstub\w*/gi, rule: 'no-stub-code', message: 'Remove stub code. Implement production version' },
    { pattern: /\bdummy\w*/gi, rule: 'no-dummy-code', message: 'Remove dummy code. Implement production version' },
    { pattern: /\bfake\w*/gi, rule: 'no-fake-code', message: 'Remove fake code. Implement production version' },
    { pattern: /\bplaceholder\w*/gi, rule: 'no-placeholder-code', message: 'Remove placeholder code. Implement production version' },
    { pattern: /\btemporary\w*/gi, rule: 'no-temporary-code', message: 'Remove temporary code. Implement production version' }
  ];

  async validateCode(code: string, filePath: string): Promise<QualityReport> {
    const issues: QualityIssue[] = [];

    issues.push(...this.checkForbiddenPatterns(code));
    issues.push(...this.checkMockPatterns(code));
    issues.push(...this.checkSecurityIssues(code));

    const complexity = this.calculateComplexity(code);
    if (complexity > 15) {
      issues.push({
        severity: 'warning',
        message: `Cyclomatic complexity (${complexity}) exceeds limit (15). Refactor into smaller functions.`,
        line: 1,
        rule: 'max-complexity',
      });
    }

    const hasTests = await this.checkForTests(filePath);
    if (!hasTests && !filePath.includes('.test.') && !filePath.includes('.spec.')) {
      issues.push({
        severity: 'warning',
        message: 'No tests found for this file. Add unit tests.',
        line: 1,
        rule: 'missing-tests',
      });
    }

    const criticalIssues = issues.filter(i => i.severity === 'error' || i.severity === 'critical');
    const productionReady = criticalIssues.length === 0;

    return {
      passed: criticalIssues.length === 0,
      issues,
      complexity,
      hasTests,
      productionReady,
    };
  }

  private checkForbiddenPatterns(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const { pattern, rule, message } of this.forbiddenPatterns) {
      const matches = Array.from(code.matchAll(pattern));
      for (const match of matches) {
        if (match.index !== undefined) {
          const line = this.getLineNumber(code, match.index);
          issues.push({
            severity: 'error',
            message,
            line,
            rule,
          });
        }
      }
    }

    return issues;
  }

  private checkMockPatterns(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    if (code.includes('.test.') || code.includes('.spec.') || code.includes('test/')) {
      return issues;
    }

    for (const { pattern, rule, message } of this.mockPatterns) {
      const matches = Array.from(code.matchAll(pattern));
      for (const match of matches) {
        if (match.index !== undefined) {
          const line = this.getLineNumber(code, match.index);
          issues.push({
            severity: 'critical',
            message,
            line,
            rule,
          });
        }
      }
    }

    return issues;
  }

  private checkSecurityIssues(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    const secretPattern = /(password|secret|api_key|token)\s*=\s*['"][^'"]+['"]/gi;
    const matches = Array.from(code.matchAll(secretPattern));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const line = this.getLineNumber(code, match.index);
        issues.push({
          severity: 'critical',
          message: 'Hardcoded secret detected. Use environment variables or secret management.',
          line,
          rule: 'hardcoded-secret',
        });
      }
    }

    const evalPattern = /\beval\s*\(/g;
    const evalMatches = Array.from(code.matchAll(evalPattern));
    for (const match of evalMatches) {
      if (match.index !== undefined) {
        const line = this.getLineNumber(code, match.index);
        issues.push({
          severity: 'critical',
          message: 'eval() is dangerous and should not be used in production code.',
          line,
          rule: 'no-eval',
        });
      }
    }

    return issues;
  }

  private calculateComplexity(code: string): number {
    let complexity = 1;

    const complexityPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
    ];

    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private getLineNumber(code: string, index: number): number {
    const lines = code.substring(0, index).split('\n');
    return lines.length;
  }

  private async checkForTests(filePath: string): Promise<boolean> {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      return true;
    }

    const testFilePath = filePath
      .replace(/\.(ts|tsx)$/, '.test.$1')
      .replace('/src/', '/test/');

    try {
      const fs = await import('fs');
      return fs.existsSync(testFilePath);
    } catch {
      return false;
    }
  }

  async validateFile(filePath: string): Promise<QualityReport> {
    try {
      const fs = await import('fs/promises');
      const code = await fs.readFile(filePath, 'utf-8');
      return await this.validateCode(code, filePath);
    } catch (error) {
      return {
        passed: false,
        issues: [{
          severity: 'error',
          message: `Failed to read file: ${error}`,
          line: 0,
          rule: 'file-read-error',
        }],
        complexity: 0,
        hasTests: false,
        productionReady: false,
      };
    }
  }

  async validateDirectory(dirPath: string): Promise<Map<string, QualityReport>> {
    const results = new Map<string, QualityReport>();
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      await this.walkDirectory(dirPath, async (filePath) => {
        if (filePath.match(/\.(ts|tsx)$/)) {
          const report = await this.validateFile(filePath);
          results.set(filePath, report);
        }
      });
    } catch (error) {
      console.error('Error validating directory:', error);
    }

    return results;
  }

  private async walkDirectory(dirPath: string, callback: (filePath: string) => Promise<void>): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.includes('node_modules') && !entry.name.includes('dist') && !entry.name.includes('.git')) {
          await this.walkDirectory(fullPath, callback);
        }
      } else if (entry.isFile()) {
        await callback(fullPath);
      }
    }
  }

  generateReport(results: Map<string, QualityReport>): string {
    let report = '# Code Quality Report\n\n';
    
    const allFiles = Array.from(results.keys());
    const passedFiles = allFiles.filter(f => results.get(f)?.passed);
    const failedFiles = allFiles.filter(f => !results.get(f)?.passed);
    const productionReadyFiles = allFiles.filter(f => results.get(f)?.productionReady);

    report += `## Summary\n\n`;
    report += `- Total Files: ${allFiles.length}\n`;
    report += `- Passed: ${passedFiles.length} ✅\n`;
    report += `- Failed: ${failedFiles.length} ❌\n`;
    report += `- Production Ready: ${productionReadyFiles.length} 🚀\n\n`;

    if (failedFiles.length > 0) {
      report += `## Failed Files\n\n`;
      
      for (const file of failedFiles) {
        const result = results.get(file);
        if (result) {
          report += `### ${file}\n\n`;
          
          for (const issue of result.issues) {
            const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'error' ? '❌' : '⚠️';
            report += `- ${emoji} Line ${issue.line}: ${issue.message} (${issue.rule})\n`;
          }
          
          report += `\n`;
        }
      }
    }

    return report;
  }
}

export const codeQualityChecker = new CodeQualityChecker();

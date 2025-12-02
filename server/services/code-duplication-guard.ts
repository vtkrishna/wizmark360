import { db } from "../db";
import { featureRegistry } from "../../shared/schema";
import * as fs from "fs/promises";
import * as path from "path";

interface DuplicationCheck {
  isDuplicate: boolean;
  existingFiles: string[];
  existingFeatures: string[];
  recommendations: string[];
  severity: 'critical' | 'warning' | 'info';
}

interface FeatureImplementation {
  name: string;
  description: string;
  hasDatabase: boolean;
  databaseTables: string[];
  hasApi: boolean;
  apiEndpoints: string[];
  hasFrontend: boolean;
  frontendComponents: string[];
  files: string[];
  featureType?: 'fullstack' | 'backend-only' | 'infrastructure';
}

export class CodeDuplicationGuard {
  private readonly searchPaths = [
    'server',
    'client/src',
    'shared',
    'wai-sdk',
    'uploads',
    'attached_assets'
  ];

  private async walkDirectory(dir: string, filter: (file: string) => boolean): Promise<string[]> {
    const results: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!entry.name.includes('node_modules') && !entry.name.includes('dist') && !entry.name.includes('.git')) {
            const subResults = await this.walkDirectory(fullPath, filter);
            results.push(...subResults);
          }
        } else if (entry.isFile() && filter(fullPath)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or no permission, skip
    }
    return results;
  }

  private async searchFilesForPattern(pattern: string, searchPath: string, fileExtensions: string[] = ['.ts', '.tsx', '.json']): Promise<string[]> {
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safePattern = escapeRegex(pattern);
    const regex = new RegExp(safePattern, 'i');
    
    const files = await this.walkDirectory(searchPath, (file) => {
      return fileExtensions.some(ext => file.endsWith(ext));
    });

    const matches: string[] = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (regex.test(content)) {
          matches.push(file);
        }
      } catch {
        // Skip unreadable files
      }
    }
    
    return matches;
  }

  private async searchCodebase(pattern: string): Promise<string[]> {
    const results: string[] = [];
    for (const searchPath of this.searchPaths) {
      const matches = await this.searchFilesForPattern(pattern, searchPath);
      results.push(...matches);
    }
    return results;
  }

  async checkBeforeCreating(
    featureName: string,
    searchPatterns: string[]
  ): Promise<DuplicationCheck> {
    const existingFiles: string[] = [];
    const existingFeatures: string[] = [];
    const recommendations: string[] = [];

    for (const pattern of searchPatterns) {
      const files = await this.searchCodebase(pattern);
      existingFiles.push(...files);
    }

    const uniqueFiles = Array.from(new Set(existingFiles));

    const featureExists = await this.checkFeatureRegistry(featureName);
    if (featureExists) {
      existingFeatures.push(featureName);
    }

    const isDuplicate = uniqueFiles.length > 0 || existingFeatures.length > 0;
    
    if (isDuplicate) {
      recommendations.push(`⚠️ DUPLICATE DETECTED: Feature "${featureName}" already exists!`);
      recommendations.push(`📁 Existing files found: ${uniqueFiles.length} file(s)`);
      
      if (uniqueFiles.length > 0) {
        recommendations.push(`\n📋 Existing Files:`);
        uniqueFiles.forEach(file => {
          recommendations.push(`   - ${file}`);
        });
      }

      recommendations.push(`\n✅ RECOMMENDED ACTION: Use existing implementation instead of creating new files`);
      recommendations.push(`🔧 If modification needed: Edit existing files, don't duplicate`);
    }

    return {
      isDuplicate,
      existingFiles: uniqueFiles,
      existingFeatures,
      recommendations,
      severity: isDuplicate ? 'critical' : 'info'
    };
  }

  async validateFeatureComplete(feature: FeatureImplementation): Promise<{
    isComplete: boolean;
    missing: string[];
    warnings: string[];
  }> {
    const missing: string[] = [];
    const warnings: string[] = [];
    const featureType = feature.featureType || 'fullstack';

    if (!feature.hasDatabase && !feature.databaseTables.length) {
      if (featureType === 'fullstack') {
        warnings.push('⚠️ No database tables defined. If this feature needs persistence, add schema.');
      }
    }

    if (featureType === 'fullstack' || featureType === 'backend-only') {
      if (!feature.hasApi && !feature.apiEndpoints.length) {
        missing.push('❌ CRITICAL: No API endpoints. Feature must have API routes.');
      }

      if (feature.hasDatabase && feature.databaseTables.length > 0 && !feature.hasApi) {
        missing.push('❌ CRITICAL: Database tables exist but no API endpoints to access them.');
      }
    }

    if (featureType === 'fullstack') {
      if (!feature.hasFrontend && !feature.frontendComponents.length) {
        missing.push('❌ CRITICAL: No frontend components. Fullstack feature must be accessible to users.');
      }

      if (feature.hasApi && feature.apiEndpoints.length > 0 && !feature.hasFrontend) {
        missing.push('❌ CRITICAL: API endpoints exist but no frontend integration.');
      }
    }

    if (featureType === 'backend-only' && feature.hasFrontend) {
      warnings.push('⚠️ Frontend components defined for backend-only feature. Consider featureType: "fullstack"');
    }

    if (featureType === 'infrastructure' && (feature.hasApi || feature.hasFrontend)) {
      warnings.push('⚠️ Infrastructure feature should not have API/Frontend. Use featureType: "backend-only" or "fullstack"');
    }

    const isComplete = missing.length === 0;

    return {
      isComplete,
      missing,
      warnings
    };
  }

  async checkOrchestrationFiles(): Promise<string[]> {
    const duplicates: string[] = [];
    
    try {
      const orchestrationPath = 'server/orchestration';
      const orchestrationFiles = await this.walkDirectory(orchestrationPath, (file) => file.endsWith('.ts'));
      
      const coreFiles = orchestrationFiles.filter(f => 
        f.includes('orchestration-core') || f.includes('orchestration-integration')
      );

      if (coreFiles.length > 2) {
        duplicates.push(`⚠️ MULTIPLE ORCHESTRATION CORES DETECTED: ${coreFiles.length} files`);
        coreFiles.forEach(file => duplicates.push(`   - ${file}`));
        duplicates.push('🔧 ACTION REQUIRED: Consolidate into single orchestration core');
      }
    } catch {
      // Directory doesn't exist
    }

    return duplicates;
  }

  async checkAgentFiles(): Promise<string[]> {
    const duplicates: string[] = [];
    const allAgentFiles: string[] = [];
    
    try {
      const agentFiles = await this.walkDirectory('server/agents', (file) => file.endsWith('.ts'));
      allAgentFiles.push(...agentFiles);
      
      const serviceAgentFiles = await this.walkDirectory('server/services', (file) => {
        const fileName = path.basename(file);
        return file.endsWith('.ts') && fileName.includes('agent');
      });
      allAgentFiles.push(...serviceAgentFiles);

      if (allAgentFiles.length > 10) {
        duplicates.push(`⚠️ AGENT FILES SCATTERED: ${allAgentFiles.length} agent-related files found`);
        duplicates.push('🔧 RECOMMENDATION: Consolidate into unified agent registry');
      }
    } catch {
      // Directories don't exist
    }

    return duplicates;
  }

  private async checkFeatureRegistry(featureName: string): Promise<boolean> {
    try {
      const registry = await db.query.featureRegistry.findFirst({
        where: (features, { eq }) => eq(features.name, featureName)
      });
      return !!registry;
    } catch {
      return false;
    }
  }

  async registerFeature(feature: FeatureImplementation): Promise<void> {
    const validation = await this.validateFeatureComplete(feature);
    
    if (!validation.isComplete) {
      throw new Error(
        `Cannot register incomplete feature "${feature.name}":\n${validation.missing.join('\n')}`
      );
    }

    try {
      await db.insert(featureRegistry).values({
        name: feature.name,
        description: feature.description,
        featureType: feature.featureType || 'fullstack',
        hasDatabase: feature.hasDatabase,
        databaseTables: feature.databaseTables,
        hasApi: feature.hasApi,
        apiEndpoints: feature.apiEndpoints,
        hasFrontend: feature.hasFrontend,
        frontendComponents: feature.frontendComponents,
        implementationFiles: feature.files,
        status: 'active',
        version: '1.0'
      });
    } catch (error) {
      console.error('Failed to register feature:', error);
    }
  }

  async generateSystemReport(): Promise<string> {
    let report = '# 🛡️ Code Duplication Guard - System Health Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += '## 🔍 Orchestration Layer Check\n\n';
    const orchestrationIssues = await this.checkOrchestrationFiles();
    if (orchestrationIssues.length > 0) {
      report += orchestrationIssues.join('\n') + '\n\n';
    } else {
      report += '✅ No orchestration duplication detected\n\n';
    }

    report += '## 🤖 Agent Registry Check\n\n';
    const agentIssues = await this.checkAgentFiles();
    if (agentIssues.length > 0) {
      report += agentIssues.join('\n') + '\n\n';
    } else {
      report += '✅ Agent files properly organized\n\n';
    }

    report += '## 📋 Feature Registry\n\n';
    try {
      const features = await db.query.featureRegistry.findMany();
      report += `Total registered features: ${features.length}\n`;
      report += `Active features: ${features.filter(f => f.status === 'active').length}\n\n`;
      
      if (features.length > 0) {
        report += '### Registered Features:\n\n';
        features.forEach(feature => {
          const completeness = [];
          if (feature.hasDatabase) completeness.push('📊 DB');
          if (feature.hasApi) completeness.push('🔌 API');
          if (feature.hasFrontend) completeness.push('🎨 UI');
          
          report += `- **${feature.name}** [${completeness.join(' | ')}]\n`;
          report += `  ${feature.description}\n`;
          report += `  Files: ${(feature.implementationFiles || []).length}\n\n`;
        });
      }
    } catch (error) {
      report += '⚠️ Could not access feature registry\n\n';
    }

    return report;
  }
}

export const codeDuplicationGuard = new CodeDuplicationGuard();

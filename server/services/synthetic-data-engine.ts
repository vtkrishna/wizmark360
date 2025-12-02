/**
 * Synthetic Data Generation Engine
 * Generates realistic, context-aware datasets for data-intensive projects
 * Uses WAI SDK orchestration for intelligent data generation
 */

import { wizardsOrchestrationService } from './wizards-orchestration-service';
import { db } from '../db';
import { wizardsArtifacts, type InsertWizardsArtifact } from '@shared/schema';
import type { OrchestrationRequest } from '@shared/wizards-incubator-types';

export interface DataGenerationRequest {
  startupId: number;
  datasetType: 'csv' | 'json' | 'sql' | 'api_mock';
  industry: string;
  schema?: DataSchema;
  recordCount: number;
  includeRelationships?: boolean;
  constraints?: DataConstraints;
}

export interface DataSchema {
  name: string;
  description: string;
  fields: DataField[];
  relationships?: DataRelationship[];
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'address' | 'url' | 'uuid' | 'enum';
  required: boolean;
  unique?: boolean;
  enumValues?: string[];
  format?: string;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    length?: number;
  };
}

export interface DataRelationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  foreignKey: string;
}

export interface DataConstraints {
  consistency: 'strict' | 'relaxed';
  distribution: 'uniform' | 'normal' | 'realistic';
  locale?: string;
  dateRange?: { start: Date; end: Date };
}

export interface GeneratedDataset {
  format: string;
  data: string;
  metadata: {
    recordCount: number;
    schema: DataSchema;
    generationTime: number;
    creditsUsed: number;
  };
}

// Industry-specific data templates
const INDUSTRY_TEMPLATES: Record<string, DataSchema> = {
  'e-commerce': {
    name: 'e-commerce-dataset',
    description: 'E-commerce platform with products, customers, orders',
    fields: [
      { name: 'product_id', type: 'uuid', required: true, unique: true },
      { name: 'product_name', type: 'string', required: true },
      { name: 'category', type: 'enum', required: true, enumValues: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'] },
      { name: 'price', type: 'number', required: true, constraints: { min: 1, max: 10000 } },
      { name: 'stock', type: 'number', required: true, constraints: { min: 0, max: 1000 } },
      { name: 'rating', type: 'number', required: false, constraints: { min: 1, max: 5 } },
      { name: 'created_at', type: 'date', required: true },
    ],
    relationships: [
      { from: 'orders', to: 'products', type: 'many-to-many', foreignKey: 'product_id' },
      { from: 'orders', to: 'customers', type: 'many-to-one', foreignKey: 'customer_id' },
    ],
  },
  'fintech': {
    name: 'fintech-dataset',
    description: 'Financial transactions and user accounts',
    fields: [
      { name: 'transaction_id', type: 'uuid', required: true, unique: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'amount', type: 'number', required: true, constraints: { min: 0.01, max: 1000000 } },
      { name: 'currency', type: 'enum', required: true, enumValues: ['USD', 'EUR', 'GBP', 'JPY'] },
      { name: 'transaction_type', type: 'enum', required: true, enumValues: ['deposit', 'withdrawal', 'transfer', 'payment'] },
      { name: 'status', type: 'enum', required: true, enumValues: ['pending', 'completed', 'failed', 'reversed'] },
      { name: 'timestamp', type: 'date', required: true },
    ],
  },
  'healthcare': {
    name: 'healthcare-dataset',
    description: 'Patient records and appointments',
    fields: [
      { name: 'patient_id', type: 'uuid', required: true, unique: true },
      { name: 'first_name', type: 'string', required: true },
      { name: 'last_name', type: 'string', required: true },
      { name: 'date_of_birth', type: 'date', required: true },
      { name: 'blood_type', type: 'enum', required: false, enumValues: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
      { name: 'diagnosis', type: 'string', required: false },
      { name: 'medication', type: 'string', required: false },
    ],
  },
  'saas': {
    name: 'saas-dataset',
    description: 'SaaS users, subscriptions, and usage metrics',
    fields: [
      { name: 'user_id', type: 'uuid', required: true, unique: true },
      { name: 'email', type: 'email', required: true, unique: true },
      { name: 'company_name', type: 'string', required: false },
      { name: 'plan', type: 'enum', required: true, enumValues: ['free', 'starter', 'professional', 'enterprise'] },
      { name: 'mrr', type: 'number', required: true, constraints: { min: 0, max: 10000 } },
      { name: 'seats', type: 'number', required: true, constraints: { min: 1, max: 1000 } },
      { name: 'signup_date', type: 'date', required: true },
      { name: 'last_active', type: 'date', required: false },
    ],
  },
};

class SyntheticDataEngine {
  /**
   * Generate synthetic dataset using WAI orchestration
   */
  async generateDataset(request: DataGenerationRequest): Promise<GeneratedDataset> {
    const startTime = Date.now();

    // Get industry template or use custom schema
    const schema = request.schema || INDUSTRY_TEMPLATES[request.industry.toLowerCase()];
    if (!schema) {
      throw new Error(`No template found for industry: ${request.industry}. Please provide custom schema.`);
    }

    // Build orchestration request for data generation
    const orchestrationRequest: OrchestrationRequest = {
      workflow: 'synthetic-data-generation',
      task: `Generate ${request.recordCount} realistic ${request.datasetType.toUpperCase()} records for ${request.industry} industry`,
      context: {
        industry: request.industry,
        schema,
        recordCount: request.recordCount,
        format: request.datasetType,
        constraints: request.constraints || { consistency: 'strict', distribution: 'realistic' },
        relationships: request.includeRelationships ? schema.relationships : undefined,
      },
      budget: 'balanced',
      deterministicMode: false,
    };

    // Use WAI orchestration to generate intelligent, context-aware data
    const orchestrationResult = await wizardsOrchestrationService.executeOrchestration(orchestrationRequest);

    // Extract generated data from orchestration outputs
    const generatedData = this.extractGeneratedData(orchestrationResult.outputs, request.datasetType);

    // Store as artifact for startup
    await this.storeDatasetArtifact(request.startupId, schema, generatedData, orchestrationResult);

    const generationTime = Date.now() - startTime;

    return {
      format: request.datasetType,
      data: generatedData,
      metadata: {
        recordCount: request.recordCount,
        schema,
        generationTime,
        creditsUsed: orchestrationResult.creditsUsed || 0,
      },
    };
  }

  /**
   * Extract generated data from orchestration outputs
   */
  private extractGeneratedData(outputs: any, format: string): string {
    if (!outputs) {
      return format === 'json' ? '[]' : '';
    }

    // WAI SDK returns structured data in outputs.generatedData
    const data = outputs.generatedData || outputs.dataset || outputs.records;

    if (!data) {
      throw new Error('No data generated by orchestration');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(Array.isArray(data) ? data : [data], null, 2);
      
      case 'csv':
        return this.convertToCSV(Array.isArray(data) ? data : [data]);
      
      case 'sql':
        return this.convertToSQL(Array.isArray(data) ? data : [data], outputs.tableName || 'generated_data');
      
      case 'api_mock':
        return JSON.stringify({
          endpoints: this.generateMockEndpoints(data),
          data: Array.isArray(data) ? data : [data],
        }, null, 2);
      
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert data to SQL INSERT statements
   */
  private convertToSQL(data: any[], tableName: string): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const columnDefs = headers.map(h => `${h} VARCHAR(255)`).join(', ');
    
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName} (\n  id SERIAL PRIMARY KEY,\n  ${columnDefs}\n);\n\n`;
    
    const insertStatements = data.map(row => {
      const values = headers.map(h => {
        const value = row[h];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        return value;
      }).join(', ');
      return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
    }).join('\n');

    return createTable + insertStatements;
  }

  /**
   * Generate mock API endpoints
   */
  private generateMockEndpoints(data: any): any[] {
    const dataArray = Array.isArray(data) ? data : [data];
    const resourceName = 'items';

    return [
      {
        method: 'GET',
        path: `/${resourceName}`,
        description: 'Get all items',
        response: dataArray,
      },
      {
        method: 'GET',
        path: `/${resourceName}/:id`,
        description: 'Get single item by ID',
        response: dataArray[0] || {},
      },
      {
        method: 'POST',
        path: `/${resourceName}`,
        description: 'Create new item',
        body: dataArray[0] || {},
        response: { ...dataArray[0], id: 'new-uuid' },
      },
      {
        method: 'PUT',
        path: `/${resourceName}/:id`,
        description: 'Update item',
        body: dataArray[0] || {},
        response: dataArray[0] || {},
      },
      {
        method: 'DELETE',
        path: `/${resourceName}/:id`,
        description: 'Delete item',
        response: { success: true },
      },
    ];
  }

  /**
   * Store dataset as artifact
   */
  private async storeDatasetArtifact(
    startupId: number,
    schema: DataSchema,
    data: string,
    orchestrationResult: any
  ): Promise<void> {
    const artifact: InsertWizardsArtifact = {
      startupId,
      studioId: 'data-ml-studio',
      artifactType: 'synthetic-data',
      name: `${schema.name}-dataset`,
      description: `Synthetic ${schema.description}`,
      content: {
        schema,
        data,
        format: 'json',
      },
      fileUrl: null,
      metadata: {
        orchestrationJobId: orchestrationResult.jobId,
        creditsUsed: orchestrationResult.creditsUsed,
        agentsUsed: orchestrationResult.agentsUsed,
        recordCount: data.split('\n').length - 1,
      },
      version: '1.0',
      tags: ['synthetic-data', schema.name, 'ai-generated'],
      qualityScore: orchestrationResult.qualityScore || 90,
    };

    await db.insert(wizardsArtifacts).values(artifact);
  }

  /**
   * Get available industry templates
   */
  getIndustryTemplates(): string[] {
    return Object.keys(INDUSTRY_TEMPLATES);
  }

  /**
   * Get template schema by industry
   */
  getTemplateSchema(industry: string): DataSchema | null {
    return INDUSTRY_TEMPLATES[industry.toLowerCase()] || null;
  }
}

export const syntheticDataEngine = new SyntheticDataEngine();

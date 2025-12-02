/**
 * Integrated Development Tools Service
 * Phase 2: Advanced IDE Features - Built-in Development Tools
 * Provides terminal, database tools, API testing, and performance profiling
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { waiOrchestrator } from './unified-orchestration-client'

export interface TerminalSession {
  id: string;
  projectId: string;
  userId: number;
  process: ChildProcess | null;
  isActive: boolean;
  workingDirectory: string;
  history: TerminalCommand[];
  createdAt: Date;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  exitCode: number | null;
  timestamp: Date;
  duration: number;
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  isConnected: boolean;
  lastQuery?: Date;
}

export interface APITestRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  expectedStatus?: number;
  projectId: string;
}

export interface APITestResponse {
  requestId: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  responseTime: number;
  timestamp: Date;
  success: boolean;
  errors?: string[];
}

export interface PerformanceProfile {
  id: string;
  projectId: string;
  fileName: string;
  metrics: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    ioOperations: number;
  };
  bottlenecks: PerformanceBottleneck[];
  recommendations: string[];
  timestamp: Date;
}

export interface PerformanceBottleneck {
  location: { line: number; function: string };
  type: 'cpu' | 'memory' | 'io' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
}

class IntegratedDevelopmentTools extends EventEmitter {
  private terminalSessions = new Map<string, TerminalSession>();
  private databaseConnections = new Map<string, DatabaseConnection>();
  private apiTestCollections = new Map<string, APITestRequest[]>();
  private performanceProfiles = new Map<string, PerformanceProfile>();

  constructor() {
    super();
    this.setupCleanup();
  }

  /**
   * Create a new terminal session
   */
  async createTerminalSession(
    projectId: string,
    userId: number,
    workingDirectory: string = process.cwd()
  ): Promise<TerminalSession> {
    const sessionId = `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: TerminalSession = {
      id: sessionId,
      projectId,
      userId,
      process: null,
      isActive: true,
      workingDirectory,
      history: [],
      createdAt: new Date()
    };

    this.terminalSessions.set(sessionId, session);
    
    this.emit('terminal_created', {
      sessionId,
      projectId,
      userId
    });

    return session;
  }

  /**
   * Execute command in terminal session
   */
  async executeTerminalCommand(
    sessionId: string,
    command: string
  ): Promise<TerminalCommand> {
    const session = this.terminalSessions.get(sessionId);
    if (!session) {
      throw new Error('Terminal session not found');
    }

    const commandId = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      try {
        // Parse command for AI enhancement
        const enhancedCommand = this.enhanceCommand(command);
        
        const childProcess = spawn('bash', ['-c', enhancedCommand], {
          cwd: session.workingDirectory,
          env: { ...process.env }
        });

        let output = '';
        let errorOutput = '';

        childProcess.stdout?.on('data', (data) => {
          output += data.toString();
          this.emit('terminal_output', {
            sessionId,
            type: 'stdout',
            data: data.toString()
          });
        });

        childProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
          this.emit('terminal_output', {
            sessionId,
            type: 'stderr',
            data: data.toString()
          });
        });

        childProcess.on('close', (code) => {
          const duration = Date.now() - startTime;
          const fullOutput = output + (errorOutput ? `\nERROR: ${errorOutput}` : '');
          
          const terminalCommand: TerminalCommand = {
            id: commandId,
            command,
            output: fullOutput,
            exitCode: code,
            timestamp: new Date(),
            duration
          };

          session.history.push(terminalCommand);
          
          // Keep only last 100 commands
          if (session.history.length > 100) {
            session.history = session.history.slice(-100);
          }

          resolve(terminalCommand);
        });

        childProcess.on('error', (error) => {
          reject(new Error(`Terminal command failed: ${error.message}`));
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create database connection
   */
  async createDatabaseConnection(connectionConfig: Omit<DatabaseConnection, 'id' | 'isConnected' | 'lastQuery'>): Promise<DatabaseConnection> {
    const connectionId = `db-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: DatabaseConnection = {
      id: connectionId,
      ...connectionConfig,
      isConnected: false
    };

    try {
      // Test connection based on database type
      const isConnected = await this.testDatabaseConnection(connection);
      connection.isConnected = isConnected;
      
      this.databaseConnections.set(connectionId, connection);
      
      this.emit('database_connected', {
        connectionId,
        success: isConnected
      });

      return connection;
    } catch (error) {
      throw new Error(`Failed to create database connection: ${error.message}`);
    }
  }

  /**
   * Execute database query with AI assistance
   */
  async executeDatabaseQuery(
    connectionId: string,
    query: string,
    projectId: string
  ): Promise<{ results: any[]; metadata: any; suggestions?: string[] }> {
    const connection = this.databaseConnections.get(connectionId);
    if (!connection || !connection.isConnected) {
      throw new Error('Database connection not available');
    }

    try {
      // Get AI suggestions for query optimization
      const queryAnalysis = await this.analyzeQuery(query, connection.type, projectId);
      
      // Execute query (mock implementation - would integrate with actual DB drivers)
      const results = await this.executeQuery(connection, query);
      
      connection.lastQuery = new Date();
      
      return {
        results,
        metadata: {
          executionTime: 150,
          rowsAffected: results.length,
          queryType: this.getQueryType(query)
        },
        suggestions: queryAnalysis.suggestions
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Create API test request
   */
  async createAPITest(
    projectId: string,
    testRequest: Omit<APITestRequest, 'id' | 'projectId'>
  ): Promise<APITestRequest> {
    const testId = `api-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const apiTest: APITestRequest = {
      id: testId,
      projectId,
      ...testRequest
    };

    if (!this.apiTestCollections.has(projectId)) {
      this.apiTestCollections.set(projectId, []);
    }
    
    this.apiTestCollections.get(projectId)!.push(apiTest);
    
    return apiTest;
  }

  /**
   * Execute API test with intelligent validation
   */
  async executeAPITest(testId: string, projectId: string): Promise<APITestResponse> {
    const tests = this.apiTestCollections.get(projectId);
    const test = tests?.find(t => t.id === testId);
    
    if (!test) {
      throw new Error('API test not found');
    }

    const startTime = Date.now();

    try {
      // Use AI to enhance the API test
      const enhancedTest = await this.enhanceAPITest(test);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        body: test.body ? test.body : undefined
      });

      const responseBody = await response.text();
      const responseTime = Date.now() - startTime;

      const testResponse: APITestResponse = {
        requestId: testId,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        responseTime,
        timestamp: new Date(),
        success: test.expectedStatus ? response.status === test.expectedStatus : response.ok,
        errors: []
      };

      // AI-powered response validation
      if (!testResponse.success) {
        const errors = await this.analyzeAPIResponse(test, testResponse);
        testResponse.errors = errors;
      }

      this.emit('api_test_completed', {
        testId,
        projectId,
        response: testResponse
      });

      return testResponse;
    } catch (error) {
      return {
        requestId: testId,
        status: 0,
        headers: {},
        body: '',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Profile application performance
   */
  async profilePerformance(
    projectId: string,
    fileName: string,
    code: string,
    language: string
  ): Promise<PerformanceProfile> {
    try {
      const prompt = `
        As a performance expert, analyze this ${language} code for performance bottlenecks:
        
        File: ${fileName}
        Language: ${language}
        
        Code:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Analyze for:
        1. CPU-intensive operations
        2. Memory usage patterns
        3. I/O bottlenecks
        4. Network optimization opportunities
        5. Algorithm complexity issues
        
        Return detailed performance analysis with specific line numbers and recommendations.
      `;

      const response = await waiOrchestrator.processRequest({
        id: `performance-${Date.now()}`,
        type: 'performance_analysis',
        prompt: prompt,
        projectId,
        metadata: {
          fileName,
          language
        }
      });

      const analysis = this.parsePerformanceAnalysis(response.data || response.content, projectId, fileName);
      this.performanceProfiles.set(`${projectId}-${fileName}`, analysis);
      
      this.emit('performance_profiled', {
        projectId,
        fileName,
        profile: analysis
      });

      return analysis;
    } catch (error) {
      throw new Error(`Performance profiling failed: ${error.message}`);
    }
  }

  /**
   * Get intelligent dependency suggestions
   */
  async suggestDependencies(
    projectId: string,
    currentDependencies: string[],
    projectType: string,
    features: string[]
  ): Promise<{ suggestions: string[]; reasoning: string[] }> {
    try {
      const prompt = `
        As a software architect, suggest optimal dependencies for this project:
        
        Project Type: ${projectType}
        Current Dependencies: ${currentDependencies.join(', ')}
        Required Features: ${features.join(', ')}
        
        Recommend:
        1. Essential dependencies for the features
        2. Performance optimization libraries
        3. Security enhancements
        4. Development tools
        5. Testing frameworks
        
        Avoid suggesting redundant or conflicting packages.
        Prioritize actively maintained, well-documented libraries.
      `;

      const response = await waiOrchestrator.processRequest({
        id: `dependency-${Date.now()}`,
        type: 'dependency_analysis',
        prompt: prompt,
        projectId,
        metadata: {
          currentDependencies,
          projectType
        }
      });

      return this.parseDependencySuggestions(response.data || response.content);
    } catch (error) {
      return {
        suggestions: [],
        reasoning: [`Error analyzing dependencies: ${error.message}`]
      };
    }
  }

  // Private helper methods
  private enhanceCommand(command: string): string {
    // Add safety checks and enhancements to commands
    if (command.includes('rm -rf')) {
      return `echo "Dangerous command detected. Use with caution." && ${command}`;
    }
    return command;
  }

  private async testDatabaseConnection(connection: DatabaseConnection): Promise<boolean> {
    // Mock database connection test - would integrate with actual DB drivers
    return true;
  }

  private async executeQuery(connection: DatabaseConnection, query: string): Promise<any[]> {
    // Mock query execution - would integrate with actual DB drivers
    return [{ id: 1, result: 'Mock data' }];
  }

  private async analyzeQuery(query: string, dbType: string, projectId: string): Promise<{ suggestions: string[] }> {
    try {
      const prompt = `
        As a database expert, analyze this ${dbType} query for optimization:
        
        Query: ${query}
        Database Type: ${dbType}
        
        Provide suggestions for:
        1. Performance optimization
        2. Index recommendations
        3. Security improvements
        4. Best practices
      `;

      const response = await waiOrchestrator.processRequest({
        id: `query-${Date.now()}`,
        type: 'query_analysis',
        prompt: prompt,
        metadata: {
          projectId,
          dbType,
          query
        }
      });

      const parsed = JSON.parse(response.data || response.content);
      return { suggestions: parsed.suggestions || [] };
    } catch {
      return { suggestions: [] };
    }
  }

  private getQueryType(query: string): string {
    const upperQuery = query.trim().toUpperCase();
    if (upperQuery.startsWith('SELECT')) return 'SELECT';
    if (upperQuery.startsWith('INSERT')) return 'INSERT';
    if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
    if (upperQuery.startsWith('DELETE')) return 'DELETE';
    return 'OTHER';
  }

  private async enhanceAPITest(test: APITestRequest): Promise<APITestRequest> {
    // AI-powered test enhancement would go here
    return test;
  }

  private async analyzeAPIResponse(test: APITestRequest, response: APITestResponse): Promise<string[]> {
    const errors: string[] = [];
    
    if (test.expectedStatus && response.status !== test.expectedStatus) {
      errors.push(`Expected status ${test.expectedStatus}, got ${response.status}`);
    }
    
    if (response.responseTime > 5000) {
      errors.push('Response time exceeded 5 seconds');
    }
    
    return errors;
  }

  private parsePerformanceAnalysis(content: string, projectId: string, fileName: string): PerformanceProfile {
    try {
      const parsed = JSON.parse(content);
      return {
        id: `perf-${Date.now()}`,
        projectId,
        fileName,
        metrics: parsed.metrics || {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          ioOperations: 0
        },
        bottlenecks: parsed.bottlenecks || [],
        recommendations: parsed.recommendations || [],
        timestamp: new Date()
      };
    } catch {
      return {
        id: `perf-${Date.now()}`,
        projectId,
        fileName,
        metrics: {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          ioOperations: 0
        },
        bottlenecks: [],
        recommendations: ['Analysis failed - please try again'],
        timestamp: new Date()
      };
    }
  }

  private parseDependencySuggestions(content: string): { suggestions: string[]; reasoning: string[] } {
    try {
      const parsed = JSON.parse(content);
      return {
        suggestions: parsed.suggestions || [],
        reasoning: parsed.reasoning || []
      };
    } catch {
      return {
        suggestions: [],
        reasoning: ['Failed to parse dependency suggestions']
      };
    }
  }

  private setupCleanup() {
    // Cleanup inactive terminal sessions every hour
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.terminalSessions.entries()) {
        const inactiveTime = now - session.createdAt.getTime();
        if (inactiveTime > 3600000 && !session.isActive) { // 1 hour
          this.terminalSessions.delete(sessionId);
        }
      }
    }, 3600000);
  }

  /**
   * Get terminal session
   */
  getTerminalSession(sessionId: string): TerminalSession | undefined {
    return this.terminalSessions.get(sessionId);
  }

  /**
   * Get all database connections for project
   */
  getDatabaseConnections(projectId?: string): DatabaseConnection[] {
    const connections = Array.from(this.databaseConnections.values());
    return projectId ? connections.filter(conn => conn.name.includes(projectId)) : connections;
  }

  /**
   * Get API tests for project
   */
  getAPITests(projectId: string): APITestRequest[] {
    return this.apiTestCollections.get(projectId) || [];
  }

  /**
   * Get performance profiles for project
   */
  getPerformanceProfiles(projectId: string): PerformanceProfile[] {
    return Array.from(this.performanceProfiles.values())
      .filter(profile => profile.projectId === projectId);
  }
}

export const integratedDevelopmentTools = new IntegratedDevelopmentTools();
export default integratedDevelopmentTools;
/**
 * Production Optimization Service
 * Comprehensive optimization for production deployment and million-user scale
 */

import { performance } from 'perf_hooks';
import cluster from 'cluster';
import os from 'os';

export interface ProductionMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  throughput: number;
}

export interface OptimizationRecommendation {
  category: 'performance' | 'memory' | 'security' | 'scalability';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: string;
  estimatedImpact: string;
}

export class ProductionOptimizationService {
  private metrics: ProductionMetrics;
  private performanceHistory: ProductionMetrics[];
  private requestTimestamps: number[];
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
    this.performanceHistory = [];
    this.requestTimestamps = [];

    this.startMetricsCollection();
    this.setupProcessOptimizations();
    this.enableProductionLogging();

    console.log('🚀 Production Optimization Service initialized');
  }

  private initializeMetrics(): ProductionMetrics {
    return {
      uptime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 0,
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      throughput: 0
    };
  }

  /**
   * Setup Node.js process optimizations for production
   */
  private setupProcessOptimizations() {
    // Optimize garbage collection
    if (process.env.NODE_ENV === 'production') {
      // Enable optimized garbage collection flags
      process.env.NODE_OPTIONS = '--max-old-space-size=4096 --optimize-for-size';
    }

    // Handle uncaught exceptions gracefully
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.metrics.errorCount++;
      // In production, we might want to restart the process
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => process.exit(1), 1000);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.metrics.errorCount++;
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      this.gracefulShutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      this.gracefulShutdown();
    });
  }

  /**
   * Enable comprehensive production logging
   */
  private enableProductionLogging() {
    // Override console methods for structured logging
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const timestamp = new Date().toISOString();
      originalLog(`[${timestamp}] [INFO]`, ...args);
    };

    console.error = (...args) => {
      const timestamp = new Date().toISOString();
      originalError(`[${timestamp}] [ERROR]`, ...args);
      this.metrics.errorCount++;
    };
  }

  /**
   * Start continuous metrics collection
   */
  private startMetricsCollection() {
    setInterval(() => {
      this.updateMetrics();
      this.performanceHistory.push({ ...this.metrics });

      // Keep only last 100 metrics snapshots
      if (this.performanceHistory.length > 100) {
        this.performanceHistory.shift();
      }

      // Reset counters
      this.metrics.requestCount = 0;
      this.metrics.throughput = 0;
    }, 60000); // Every minute
  }

  /**
   * Update current metrics
   */
  private updateMetrics() {
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage();

    // Calculate throughput from recent requests
    const now = Date.now();
    const recentRequests = this.requestTimestamps.filter(ts => now - ts < 60000);
    this.metrics.throughput = recentRequests.length;

    // Clean old request timestamps
    this.requestTimestamps = recentRequests;
  }

  /**
   * Track request performance
   */
  trackRequest(startTime: number, endTime: number, isError: boolean = false) {
    const responseTime = endTime - startTime;
    
    this.requestTimestamps.push(endTime);
    this.metrics.requestCount++;
    
    if (isError) {
      this.metrics.errorCount++;
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  /**
   * Memory optimization and cleanup
   */
  async optimizeMemory(): Promise<{
    beforeOptimization: NodeJS.MemoryUsage;
    afterOptimization: NodeJS.MemoryUsage;
    freedMemory: number;
  }> {
    const before = process.memoryUsage();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear caches and temporary data
    await this.clearApplicationCaches();

    const after = process.memoryUsage();
    const freedMemory = before.heapUsed - after.heapUsed;

    return {
      beforeOptimization: before,
      afterOptimization: after,
      freedMemory
    };
  }

  /**
   * Clear application-level caches
   */
  private async clearApplicationCaches() {
    // Clear require cache for non-critical modules
    const modulesToClear = Object.keys(require.cache).filter(key => 
      key.includes('temp') || key.includes('cache')
    );

    modulesToClear.forEach(key => {
      delete require.cache[key];
    });
  }

  /**
   * Get comprehensive health check
   */
  async getHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    metrics: ProductionMetrics;
    recommendations: OptimizationRecommendation[];
    uptime: string;
  }> {
    await this.updateMetrics();

    const recommendations: OptimizationRecommendation[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    // Memory usage check
    const memoryUsagePercent = (this.metrics.memoryUsage.heapUsed / this.metrics.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      status = 'critical';
      recommendations.push({
        category: 'memory',
        priority: 'critical',
        description: 'Memory usage is critically high',
        implementation: 'Implement memory optimization and garbage collection',
        estimatedImpact: 'Prevent out-of-memory crashes'
      });
    } else if (memoryUsagePercent > 75) {
      status = 'degraded';
      recommendations.push({
        category: 'memory',
        priority: 'high',
        description: 'Memory usage is elevated',
        implementation: 'Monitor and optimize memory-intensive operations',
        estimatedImpact: 'Improve application stability'
      });
    }

    // Response time check
    if (this.metrics.averageResponseTime > 2000) {
      status = 'degraded';
      recommendations.push({
        category: 'performance',
        priority: 'high',
        description: 'Average response time is high',
        implementation: 'Optimize database queries and add caching',
        estimatedImpact: '50% improvement in response times'
      });
    }

    // Error rate check
    const errorRate = this.metrics.errorCount / Math.max(this.metrics.requestCount, 1);
    if (errorRate > 0.05) {
      status = 'critical';
      recommendations.push({
        category: 'performance',
        priority: 'critical',
        description: 'High error rate detected',
        implementation: 'Investigate and fix error sources',
        estimatedImpact: 'Improve user experience and system reliability'
      });
    }

    return {
      status,
      metrics: this.metrics,
      recommendations,
      uptime: this.formatUptime(this.metrics.uptime)
    };
  }

  /**
   * Auto-scaling recommendations based on load
   */
  async getScalingRecommendations(): Promise<{
    currentLoad: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    resourceRequirements: {
      cpu: string;
      memory: string;
      storage: string;
      bandwidth: string;
    };
  }> {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = this.metrics.memoryUsage;
    const throughput = this.metrics.throughput;

    let currentLoad: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const recommendations: string[] = [];

    // Determine current load
    if (throughput > 1000 || memoryUsage.heapUsed > memoryUsage.heapTotal * 0.8) {
      currentLoad = 'critical';
      recommendations.push('Immediate horizontal scaling required');
      recommendations.push('Consider implementing load balancing');
      recommendations.push('Enable auto-scaling policies');
    } else if (throughput > 500 || memoryUsage.heapUsed > memoryUsage.heapTotal * 0.6) {
      currentLoad = 'high';
      recommendations.push('Scale up to handle increased load');
      recommendations.push('Implement caching layers');
    } else if (throughput > 100) {
      currentLoad = 'medium';
      recommendations.push('Monitor for potential scaling needs');
    }

    return {
      currentLoad,
      recommendations,
      resourceRequirements: {
        cpu: currentLoad === 'critical' ? '8+ cores' : currentLoad === 'high' ? '4-8 cores' : '2-4 cores',
        memory: currentLoad === 'critical' ? '16+ GB' : currentLoad === 'high' ? '8-16 GB' : '4-8 GB',
        storage: 'SSD with 1000+ IOPS',
        bandwidth: currentLoad === 'critical' ? '1 Gbps+' : '100-1000 Mbps'
      }
    };
  }

  /**
   * Security hardening recommendations
   */
  getSecurityHardening(): OptimizationRecommendation[] {
    return [
      {
        category: 'security',
        priority: 'critical',
        description: 'Enable HTTPS and security headers',
        implementation: 'Configure SSL/TLS certificates and security middleware',
        estimatedImpact: 'Prevent man-in-the-middle attacks'
      },
      {
        category: 'security',
        priority: 'high',
        description: 'Implement rate limiting',
        implementation: 'Add express-rate-limit middleware with Redis store',
        estimatedImpact: 'Prevent DDoS and brute force attacks'
      },
      {
        category: 'security',
        priority: 'high',
        description: 'Add input validation and sanitization',
        implementation: 'Implement comprehensive input validation using Joi or Zod',
        estimatedImpact: 'Prevent injection attacks'
      },
      {
        category: 'security',
        priority: 'medium',
        description: 'Enable security monitoring',
        implementation: 'Add security event logging and monitoring',
        estimatedImpact: 'Early detection of security threats'
      }
    ];
  }

  /**
   * Performance optimization suite
   */
  async performComprehensiveOptimization(): Promise<{
    optimizations: string[];
    performance: {
      before: ProductionMetrics;
      after: ProductionMetrics;
      improvement: string;
    };
  }> {
    const before = { ...this.metrics };
    const optimizations: string[] = [];

    // Memory optimization
    const memoryOpt = await this.optimizeMemory();
    if (memoryOpt.freedMemory > 0) {
      optimizations.push(`Freed ${Math.round(memoryOpt.freedMemory / 1024 / 1024)} MB of memory`);
    }

    // Clear performance history to save memory
    if (this.performanceHistory.length > 50) {
      this.performanceHistory = this.performanceHistory.slice(-50);
      optimizations.push('Trimmed performance history to optimize memory');
    }

    // Clear old request timestamps
    const now = Date.now();
    const oldCount = this.requestTimestamps.length;
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < 300000); // Keep last 5 minutes
    if (oldCount > this.requestTimestamps.length) {
      optimizations.push(`Cleaned ${oldCount - this.requestTimestamps.length} old request timestamps`);
    }

    const after = { ...this.metrics };
    
    return {
      optimizations,
      performance: {
        before,
        after,
        improvement: `${Math.round((before.memoryUsage.heapUsed - after.memoryUsage.heapUsed) / 1024 / 1024)} MB saved`
      }
    };
  }

  /**
   * Cluster management for multi-core scaling
   */
  async setupClusterMode(workers?: number): Promise<{
    mode: 'master' | 'worker';
    workerId?: number;
    workers?: number;
  }> {
    const numWorkers = workers || os.cpus().length;

    if (cluster.isPrimary) {
      console.log(`Master ${process.pid} is running`);
      console.log(`Starting ${numWorkers} workers...`);

      // Fork workers
      for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
      }

      // Handle worker exit
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('Starting a new worker');
        cluster.fork();
      });

      return { mode: 'master', workers: numWorkers };
    } else {
      console.log(`Worker ${process.pid} started`);
      return { mode: 'worker', workerId: cluster.worker?.id };
    }
  }

  /**
   * Graceful shutdown handling
   */
  private async gracefulShutdown() {
    console.log('Initiating graceful shutdown...');

    try {
      // Save current metrics
      await this.saveMetricsToFile();

      // Close database connections
      // await db.close(); // Uncomment when db is available

      // Clear intervals and timeouts
      // (Implementation would depend on stored interval IDs)

      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Save metrics to file for persistence
   */
  private async saveMetricsToFile() {
    const fs = require('fs').promises;
    const metricsData = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      history: this.performanceHistory
    };

    try {
      await fs.writeFile('metrics.json', JSON.stringify(metricsData, null, 2));
      console.log('Metrics saved to metrics.json');
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Helper methods
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Public getters
  getCurrentMetrics(): ProductionMetrics {
    return { ...this.metrics };
  }

  getPerformanceHistory(): ProductionMetrics[] {
    return [...this.performanceHistory];
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

export const productionOptimizationService = new ProductionOptimizationService();
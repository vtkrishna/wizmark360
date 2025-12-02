/**
 * Metrics Collector - Performance and usage analytics
 */

export interface MetricEntry {
  timestamp: Date;
  metric: string;
  value: number;
  tags?: Record<string, string>;
  metadata?: any;
}

export class MetricsCollector {
  private metrics: Map<string, MetricEntry[]> = new Map();
  private requestHistory: any[] = [];
  private performanceHistory: any[] = [];

  constructor() {
    console.log('Metrics Collector initialized');
  }

  /**
   * Record a request and its response
   */
  recordRequest(request: any, response: any): void {
    const entry = {
      timestamp: new Date(),
      request: {
        type: request.type,
        operation: request.operation,
        userId: request.userId,
        priority: request.priority
      },
      response: {
        success: response.success,
        provider: response.metadata?.provider,
        model: response.metadata?.model,
        processingTime: response.metadata?.processingTime,
        cost: response.metadata?.cost,
        quality: response.metadata?.quality,
        tokens: response.metadata?.tokens
      }
    };

    this.requestHistory.push(entry);

    // Maintain history size
    if (this.requestHistory.length > 10000) {
      this.requestHistory = this.requestHistory.slice(-5000);
    }

    // Record specific metrics
    this.recordMetric('requests.total', 1);
    this.recordMetric('requests.by_type', 1, { type: request.type });
    this.recordMetric('requests.by_provider', 1, { provider: response.metadata?.provider });
    
    if (response.success) {
      this.recordMetric('requests.successful', 1);
      this.recordMetric('response.time', response.metadata?.processingTime || 0);
      this.recordMetric('response.cost', response.metadata?.cost || 0);
      this.recordMetric('response.quality', response.metadata?.quality || 0);
    } else {
      this.recordMetric('requests.failed', 1);
    }
  }

  /**
   * Record a metric value
   */
  recordMetric(metric: string, value: number, tags?: Record<string, string>, metadata?: any): void {
    const entry: MetricEntry = {
      timestamp: new Date(),
      metric,
      value,
      tags,
      metadata
    };

    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }

    const metricHistory = this.metrics.get(metric)!;
    metricHistory.push(entry);

    // Maintain metric history size
    if (metricHistory.length > 1000) {
      metricHistory.splice(0, metricHistory.length - 500);
    }
  }

  /**
   * Get usage metrics
   */
  getMetrics(): any {
    const totalRequests = this.getMetricValue('requests.total');
    const successfulRequests = this.getMetricValue('requests.successful');
    const failedRequests = this.getMetricValue('requests.failed');

    const requestsByType = this.getMetricsByTag('requests.by_type', 'type');
    const requestsByProvider = this.getMetricsByTag('requests.by_provider', 'provider');

    const averageLatency = this.getAverageMetricValue('response.time');
    const p95Latency = this.getPercentileMetricValue('response.time', 0.95);
    const averageQuality = this.getAverageMetricValue('response.quality');
    const totalCost = this.getMetricValue('response.cost');

    const throughput = this.calculateThroughput();
    const trends = this.calculateTrends();

    return {
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        byType: requestsByType,
        byProvider: requestsByProvider
      },
      performance: {
        averageLatency,
        p95Latency,
        throughput,
        qualityScore: averageQuality
      },
      cost: {
        totalCost,
        costByProvider: this.getCostByProvider(),
        costByType: this.getCostByType(),
        costTrends: this.getCostTrends(),
        optimization: {
          potential_savings: this.calculatePotentialSavings(),
          recommendations: this.generateRecommendations()
        }
      },
      trends
    };
  }

  /**
   * Get metric value (sum of all entries)
   */
  private getMetricValue(metric: string): number {
    const entries = this.metrics.get(metric) || [];
    return entries.reduce((sum, entry) => sum + entry.value, 0);
  }

  /**
   * Get metrics grouped by tag
   */
  private getMetricsByTag(metric: string, tagKey: string): Record<string, number> {
    const entries = this.metrics.get(metric) || [];
    const grouped: Record<string, number> = {};

    for (const entry of entries) {
      if (entry.tags && entry.tags[tagKey]) {
        const tagValue = entry.tags[tagKey];
        grouped[tagValue] = (grouped[tagValue] || 0) + entry.value;
      }
    }

    return grouped;
  }

  /**
   * Get average metric value
   */
  private getAverageMetricValue(metric: string): number {
    const entries = this.metrics.get(metric) || [];
    if (entries.length === 0) return 0;

    const sum = entries.reduce((total, entry) => total + entry.value, 0);
    return sum / entries.length;
  }

  /**
   * Get percentile metric value
   */
  private getPercentileMetricValue(metric: string, percentile: number): number {
    const entries = this.metrics.get(metric) || [];
    if (entries.length === 0) return 0;

    const values = entries.map(entry => entry.value).sort((a, b) => a - b);
    const index = Math.floor(values.length * percentile);
    return values[index] || 0;
  }

  /**
   * Calculate throughput (requests per minute)
   */
  private calculateThroughput(): number {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    const recentRequests = this.requestHistory.filter(entry => 
      entry.timestamp >= oneMinuteAgo
    );

    return recentRequests.length;
  }

  /**
   * Calculate trends
   */
  private calculateTrends(): any[] {
    const now = new Date();
    const trends: any[] = [];

    // Calculate hourly trends for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourlyRequests = this.requestHistory.filter(entry => 
        entry.timestamp >= hourStart && entry.timestamp < hourEnd
      );

      const successful = hourlyRequests.filter(entry => entry.response.success).length;
      const avgCost = hourlyRequests.length > 0 ? 
        hourlyRequests.reduce((sum, entry) => sum + (entry.response.cost || 0), 0) / hourlyRequests.length : 0;
      const avgLatency = hourlyRequests.length > 0 ?
        hourlyRequests.reduce((sum, entry) => sum + (entry.response.processingTime || 0), 0) / hourlyRequests.length : 0;

      trends.push({
        timestamp: hourStart.toISOString(),
        requests: hourlyRequests.length,
        successful,
        failed: hourlyRequests.length - successful,
        averageCost: avgCost,
        averageLatency: avgLatency
      });
    }

    return trends;
  }

  /**
   * Get cost breakdown by provider
   */
  private getCostByProvider(): Record<string, number> {
    const costByProvider: Record<string, number> = {};

    for (const entry of this.requestHistory) {
      if (entry.response.success && entry.response.cost && entry.response.provider) {
        const provider = entry.response.provider;
        costByProvider[provider] = (costByProvider[provider] || 0) + entry.response.cost;
      }
    }

    return costByProvider;
  }

  /**
   * Get cost breakdown by type
   */
  private getCostByType(): Record<string, number> {
    const costByType: Record<string, number> = {};

    for (const entry of this.requestHistory) {
      if (entry.response.success && entry.response.cost && entry.request.type) {
        const type = entry.request.type;
        costByType[type] = (costByType[type] || 0) + entry.response.cost;
      }
    }

    return costByType;
  }

  /**
   * Get cost trends
   */
  private getCostTrends(): any[] {
    const now = new Date();
    const trends: any[] = [];

    // Daily cost trends for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dailyRequests = this.requestHistory.filter(entry => 
        entry.timestamp >= dayStart && entry.timestamp < dayEnd
      );

      const totalCost = dailyRequests.reduce((sum, entry) => 
        sum + (entry.response.cost || 0), 0
      );

      trends.push({
        date: dayStart.toISOString().split('T')[0],
        cost: totalCost,
        requests: dailyRequests.length,
        averageCost: dailyRequests.length > 0 ? totalCost / dailyRequests.length : 0
      });
    }

    return trends;
  }

  /**
   * Calculate potential savings
   */
  private calculatePotentialSavings(): number {
    const costByProvider = this.getCostByProvider();
    const providers = Object.keys(costByProvider);
    
    if (providers.length < 2) return 0;

    // Find the difference between highest and lowest cost providers
    const costs = Object.values(costByProvider);
    const maxCost = Math.max(...costs);
    const minCost = Math.min(...costs);
    
    // Conservative estimate: 20% of the difference could be saved
    return (maxCost - minCost) * 0.2;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const totalRequests = this.getMetricValue('requests.total');
    const failedRequests = this.getMetricValue('requests.failed');
    const failureRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    if (failureRate > 0.05) {
      recommendations.push('High failure rate detected - consider provider health checks');
    }

    const averageLatency = this.getAverageMetricValue('response.time');
    if (averageLatency > 5000) {
      recommendations.push('High latency detected - consider optimizing request routing');
    }

    const costByProvider = this.getCostByProvider();
    const providers = Object.keys(costByProvider);
    if (providers.length === 1) {
      recommendations.push('Using only one provider - consider adding fallback providers');
    }

    const averageQuality = this.getAverageMetricValue('response.quality');
    if (averageQuality < 0.8) {
      recommendations.push('Quality scores below threshold - review provider selection');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsForRange(startTime: Date, endTime: Date): any {
    const filteredRequests = this.requestHistory.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );

    return {
      totalRequests: filteredRequests.length,
      successfulRequests: filteredRequests.filter(entry => entry.response.success).length,
      failedRequests: filteredRequests.filter(entry => !entry.response.success).length,
      totalCost: filteredRequests.reduce((sum, entry) => sum + (entry.response.cost || 0), 0),
      averageLatency: filteredRequests.length > 0 ? 
        filteredRequests.reduce((sum, entry) => sum + (entry.response.processingTime || 0), 0) / filteredRequests.length : 0
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.requestHistory = [];
    this.performanceHistory = [];
    console.log('All metrics cleared');
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): any {
    return {
      metrics: Object.fromEntries(this.metrics),
      requestHistory: this.requestHistory,
      exportedAt: new Date()
    };
  }
}

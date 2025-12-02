/**
 * WAI SDK v9.0 - CAM 2.0 Integration  
 * Contextual Agent Memory framework with advanced memory management
 */

import { EventEmitter } from 'events';

export interface CAMMemoryEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  sessionId: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'working' | 'autobiographical';
  content: {
    text: string;
    context: any;
    entities: string[];
    emotions: Record<string, number>;
    confidence: number;
  };
  metadata: {
    source: string;
    importance: number; // 0-1
    frequency: number; // access count
    lastAccessed: Date;
    tags: string[];
    relationships: string[]; // related memory IDs
  };
  retention: {
    ttl?: number; // time to live in milliseconds
    decay: number; // memory decay rate
    reinforcement: number; // reinforcement from repetition
  };
  embedding?: number[]; // vector embedding for similarity search
}

export interface CAMContext {
  sessionId: string;
  agentId: string;
  conversationHistory: CAMMemoryEntry[];
  currentGoals: string[];
  constraints: string[];
  preferences: Record<string, any>;
  state: Record<string, any>;
  environment: {
    platform: string;
    location?: string;
    timeContext: {
      timezone: string;
      localTime: Date;
      dayOfWeek: string;
    };
  };
}

export interface CAMQuery {
  text?: string;
  type?: CAMMemoryEntry['type'][];
  agentId?: string;
  sessionId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  entities?: string[];
  similarity?: {
    threshold: number;
    vector?: number[];
  };
  importance?: {
    min: number;
    max: number;
  };
  limit?: number;
  sortBy?: 'relevance' | 'recency' | 'importance' | 'frequency';
}

export interface CAMInsight {
  id: string;
  type: 'pattern' | 'trend' | 'anomaly' | 'relationship' | 'prediction';
  confidence: number;
  description: string;
  evidence: CAMMemoryEntry[];
  metadata: any;
  timestamp: Date;
}

export class CAMManager extends EventEmitter {
  private memories: Map<string, CAMMemoryEntry> = new Map();
  private contexts: Map<string, CAMContext> = new Map();
  private memoryIndex: Map<string, Set<string>> = new Map(); // for fast lookup
  private embeddingIndex: Map<string, number[]> = new Map(); // for similarity search
  private decayTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startMemoryDecay();
    console.log('🧠 CAM 2.0 Manager initialized');
  }

  /**
   * Store a new memory entry
   */
  async storeMemory(
    agentId: string,
    sessionId: string,
    content: string,
    type: CAMMemoryEntry['type'],
    metadata: Partial<CAMMemoryEntry['metadata']> = {},
    context: any = {}
  ): Promise<string> {
    const memoryId = `cam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract entities and emotions (simplified implementation)
    const entities = this.extractEntities(content);
    const emotions = this.analyzeEmotions(content);
    const embedding = await this.generateEmbedding(content);
    
    const memory: CAMMemoryEntry = {
      id: memoryId,
      timestamp: new Date(),
      agentId,
      sessionId,
      type,
      content: {
        text: content,
        context,
        entities,
        emotions,
        confidence: this.calculateConfidence(content, context)
      },
      metadata: {
        source: metadata.source || 'direct_input',
        importance: metadata.importance || this.calculateImportance(content, type),
        frequency: 1,
        lastAccessed: new Date(),
        tags: metadata.tags || this.generateTags(content),
        relationships: metadata.relationships || []
      },
      retention: {
        ttl: metadata.ttl,
        decay: 0.1, // 10% decay rate
        reinforcement: 1.0
      },
      embedding
    };

    // Store memory
    this.memories.set(memoryId, memory);
    
    // Update indices
    await this.updateIndices(memory);
    
    // Find and store relationships
    await this.findRelationships(memory);

    this.emit('memory-stored', { memoryId, memory });
    
    console.log(`🧠 CAM memory stored: ${memoryId} (${type})`);
    return memoryId;
  }

  /**
   * Retrieve memories based on query
   */
  async retrieveMemories(query: CAMQuery): Promise<CAMMemoryEntry[]> {
    let candidates = Array.from(this.memories.values());

    // Apply filters
    if (query.agentId) {
      candidates = candidates.filter(m => m.agentId === query.agentId);
    }

    if (query.sessionId) {
      candidates = candidates.filter(m => m.sessionId === query.sessionId);
    }

    if (query.type?.length) {
      candidates = candidates.filter(m => query.type!.includes(m.type));
    }

    if (query.timeRange) {
      candidates = candidates.filter(m => 
        m.timestamp >= query.timeRange!.start && 
        m.timestamp <= query.timeRange!.end
      );
    }

    if (query.tags?.length) {
      candidates = candidates.filter(m => 
        query.tags!.some(tag => m.metadata.tags.includes(tag))
      );
    }

    if (query.entities?.length) {
      candidates = candidates.filter(m => 
        query.entities!.some(entity => m.content.entities.includes(entity))
      );
    }

    if (query.importance) {
      candidates = candidates.filter(m => 
        m.metadata.importance >= query.importance!.min && 
        m.metadata.importance <= query.importance!.max
      );
    }

    // Similarity search
    if (query.similarity && query.similarity.vector) {
      candidates = await this.similaritySearch(candidates, query.similarity.vector, query.similarity.threshold);
    }

    // Text search
    if (query.text) {
      candidates = this.textSearch(candidates, query.text);
    }

    // Sort results
    candidates = this.sortMemories(candidates, query.sortBy || 'relevance', query.text);

    // Update access frequency
    candidates.forEach(memory => {
      memory.metadata.frequency++;
      memory.metadata.lastAccessed = new Date();
    });

    // Apply limit
    if (query.limit) {
      candidates = candidates.slice(0, query.limit);
    }

    this.emit('memories-retrieved', { query, count: candidates.length });
    
    return candidates;
  }

  /**
   * Update context for an agent/session
   */
  async updateContext(
    sessionId: string,
    agentId: string,
    updates: Partial<CAMContext>
  ): Promise<void> {
    const contextKey = `${sessionId}_${agentId}`;
    const existingContext = this.contexts.get(contextKey);

    const context: CAMContext = {
      sessionId,
      agentId,
      conversationHistory: existingContext?.conversationHistory || [],
      currentGoals: updates.currentGoals || existingContext?.currentGoals || [],
      constraints: updates.constraints || existingContext?.constraints || [],
      preferences: { ...existingContext?.preferences, ...updates.preferences },
      state: { ...existingContext?.state, ...updates.state },
      environment: {
        ...existingContext?.environment,
        ...updates.environment,
        timeContext: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localTime: new Date(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          ...updates.environment?.timeContext
        }
      }
    };

    this.contexts.set(contextKey, context);
    
    this.emit('context-updated', { sessionId, agentId, context });
  }

  /**
   * Generate insights from memory patterns
   */
  async generateInsights(
    agentId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<CAMInsight[]> {
    const insights: CAMInsight[] = [];
    
    let memories = Array.from(this.memories.values());
    
    if (agentId) {
      memories = memories.filter(m => m.agentId === agentId);
    }
    
    if (timeRange) {
      memories = memories.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    // Pattern detection
    const patterns = this.detectPatterns(memories);
    insights.push(...patterns);

    // Trend analysis
    const trends = this.analyzeTrends(memories);
    insights.push(...trends);

    // Anomaly detection
    const anomalies = this.detectAnomalies(memories);
    insights.push(...anomalies);

    // Relationship insights
    const relationships = this.analyzeRelationships(memories);
    insights.push(...relationships);

    this.emit('insights-generated', { count: insights.length, agentId, timeRange });
    
    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Consolidate and compress memories
   */
  async consolidateMemories(agentId?: string): Promise<number> {
    let memories = Array.from(this.memories.values());
    
    if (agentId) {
      memories = memories.filter(m => m.agentId === agentId);
    }

    let consolidatedCount = 0;

    // Group similar memories
    const groups = this.groupSimilarMemories(memories);
    
    for (const group of groups) {
      if (group.length > 2) {
        const consolidated = await this.consolidateGroup(group);
        if (consolidated) {
          // Remove original memories
          group.forEach(memory => this.memories.delete(memory.id));
          // Store consolidated memory
          this.memories.set(consolidated.id, consolidated);
          consolidatedCount += group.length - 1;
        }
      }
    }

    this.emit('memories-consolidated', { count: consolidatedCount, agentId });
    
    console.log(`🧠 CAM consolidated ${consolidatedCount} memories`);
    return consolidatedCount;
  }

  /**
   * Forget low-importance memories based on decay
   */
  async forgetMemories(): Promise<number> {
    const now = new Date();
    let forgottenCount = 0;

    for (const [memoryId, memory] of this.memories) {
      // Check TTL
      if (memory.retention.ttl) {
        const ageMs = now.getTime() - memory.timestamp.getTime();
        if (ageMs > memory.retention.ttl) {
          this.memories.delete(memoryId);
          forgottenCount++;
          continue;
        }
      }

      // Apply decay
      const timeSinceAccess = now.getTime() - memory.metadata.lastAccessed.getTime();
      const decayFactor = Math.exp(-memory.retention.decay * timeSinceAccess / (1000 * 60 * 60 * 24)); // daily decay
      
      const currentImportance = memory.metadata.importance * decayFactor * memory.retention.reinforcement;
      
      // Forget if importance drops below threshold
      if (currentImportance < 0.1) {
        this.memories.delete(memoryId);
        forgottenCount++;
      } else {
        // Update importance
        memory.metadata.importance = currentImportance;
      }
    }

    if (forgottenCount > 0) {
      this.emit('memories-forgotten', { count: forgottenCount });
      console.log(`🧠 CAM forgot ${forgottenCount} memories due to decay`);
    }

    return forgottenCount;
  }

  // Helper methods
  private extractEntities(content: string): string[] {
    // Simplified entity extraction
    const entityPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Person names
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // Dates
      /\b\d{1,2}:\d{2}\b/g, // Times
      /\b[A-Z][a-z]+\b/g // Proper nouns
    ];

    const entities: string[] = [];
    
    entityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)]; // Remove duplicates
  }

  private analyzeEmotions(content: string): Record<string, number> {
    // Simplified emotion analysis
    const emotionKeywords = {
      joy: ['happy', 'excited', 'pleased', 'delighted', 'thrilled'],
      sadness: ['sad', 'disappointed', 'upset', 'depressed', 'down'],
      anger: ['angry', 'frustrated', 'annoyed', 'furious', 'mad'],
      fear: ['afraid', 'worried', 'anxious', 'scared', 'nervous'],
      surprise: ['surprised', 'amazed', 'shocked', 'astonished'],
      neutral: ['okay', 'fine', 'normal', 'average']
    };

    const emotions: Record<string, number> = {};
    const contentLower = content.toLowerCase();

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (contentLower.includes(keyword) ? 1 : 0);
      }, 0) / keywords.length;
      
      if (score > 0) {
        emotions[emotion] = score;
      }
    });

    return emotions;
  }

  private async generateEmbedding(content: string): Promise<number[]> {
    // Simplified embedding generation (in production, use a real embedding model)
    const words = content.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384-dimensional vector
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 384] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateConfidence(content: string, context: any): number {
    let confidence = 0.5; // baseline
    
    // Length factor
    confidence += Math.min(0.2, content.length / 1000);
    
    // Context richness
    if (context && Object.keys(context).length > 0) {
      confidence += 0.1;
    }
    
    // Specificity (presence of entities, dates, etc.)
    const entities = this.extractEntities(content);
    confidence += Math.min(0.2, entities.length * 0.05);

    return Math.max(0, Math.min(1, confidence));
  }

  private calculateImportance(content: string, type: CAMMemoryEntry['type']): number {
    let importance = 0.3; // baseline

    // Type-based importance
    switch (type) {
      case 'autobiographical':
        importance += 0.4;
        break;
      case 'episodic':
        importance += 0.3;
        break;
      case 'semantic':
        importance += 0.2;
        break;
      case 'procedural':
        importance += 0.3;
        break;
      case 'working':
        importance += 0.1;
        break;
    }

    // Content-based importance
    const importantKeywords = ['important', 'critical', 'urgent', 'remember', 'never forget'];
    importantKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        importance += 0.1;
      }
    });

    return Math.max(0, Math.min(1, importance));
  }

  private generateTags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10); // Limit to 10 tags
  }

  private async updateIndices(memory: CAMMemoryEntry): Promise<void> {
    // Tag index
    memory.metadata.tags.forEach(tag => {
      if (!this.memoryIndex.has(tag)) {
        this.memoryIndex.set(tag, new Set());
      }
      this.memoryIndex.get(tag)!.add(memory.id);
    });

    // Entity index
    memory.content.entities.forEach(entity => {
      const key = `entity_${entity}`;
      if (!this.memoryIndex.has(key)) {
        this.memoryIndex.set(key, new Set());
      }
      this.memoryIndex.get(key)!.add(memory.id);
    });

    // Embedding index
    if (memory.embedding) {
      this.embeddingIndex.set(memory.id, memory.embedding);
    }
  }

  private async findRelationships(memory: CAMMemoryEntry): Promise<void> {
    // Find memories with similar content, entities, or tags
    const relatedMemories = await this.retrieveMemories({
      agentId: memory.agentId,
      entities: memory.content.entities,
      tags: memory.metadata.tags,
      limit: 5
    });

    memory.metadata.relationships = relatedMemories
      .filter(m => m.id !== memory.id)
      .slice(0, 3)
      .map(m => m.id);
  }

  private async similaritySearch(
    candidates: CAMMemoryEntry[],
    queryVector: number[],
    threshold: number
  ): Promise<CAMMemoryEntry[]> {
    const similarities: Array<{ memory: CAMMemoryEntry; similarity: number }> = [];

    candidates.forEach(memory => {
      if (memory.embedding) {
        const similarity = this.cosineSimilarity(queryVector, memory.embedding);
        if (similarity >= threshold) {
          similarities.push({ memory, similarity });
        }
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.memory);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private textSearch(candidates: CAMMemoryEntry[], query: string): CAMMemoryEntry[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    return candidates.filter(memory => {
      const content = memory.content.text.toLowerCase();
      return queryTerms.some(term => content.includes(term));
    });
  }

  private sortMemories(
    memories: CAMMemoryEntry[],
    sortBy: 'relevance' | 'recency' | 'importance' | 'frequency',
    query?: string
  ): CAMMemoryEntry[] {
    switch (sortBy) {
      case 'recency':
        return memories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      case 'importance':
        return memories.sort((a, b) => b.metadata.importance - a.metadata.importance);
      
      case 'frequency':
        return memories.sort((a, b) => b.metadata.frequency - a.metadata.frequency);
      
      case 'relevance':
      default:
        if (query) {
          // Simple relevance scoring based on query term frequency
          return memories.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, query);
            const scoreB = this.calculateRelevanceScore(b, query);
            return scoreB - scoreA;
          });
        }
        return memories.sort((a, b) => b.metadata.importance - a.metadata.importance);
    }
  }

  private calculateRelevanceScore(memory: CAMMemoryEntry, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const content = memory.content.text.toLowerCase();
    
    let score = 0;
    queryTerms.forEach(term => {
      const matches = (content.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    });

    // Boost by importance and recency
    score *= memory.metadata.importance;
    score *= Math.max(0.1, 1 - (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30)); // 30-day decay

    return score;
  }

  private detectPatterns(memories: CAMMemoryEntry[]): CAMInsight[] {
    // Simplified pattern detection
    const insights: CAMInsight[] = [];
    
    // Find recurring themes in tags
    const tagFrequency: Record<string, number> = {};
    memories.forEach(memory => {
      memory.metadata.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    Object.entries(tagFrequency).forEach(([tag, count]) => {
      if (count >= 3) {
        insights.push({
          id: `pattern_${Date.now()}_${tag}`,
          type: 'pattern',
          confidence: Math.min(1, count / memories.length),
          description: `Recurring theme: "${tag}" appears in ${count} memories`,
          evidence: memories.filter(m => m.metadata.tags.includes(tag)),
          metadata: { tag, frequency: count },
          timestamp: new Date()
        });
      }
    });

    return insights;
  }

  private analyzeTrends(memories: CAMMemoryEntry[]): CAMInsight[] {
    // Simplified trend analysis
    const insights: CAMInsight[] = [];
    
    // Analyze emotion trends over time
    const emotionTrend: Record<string, Array<{ date: Date; score: number }>> = {};
    
    memories.forEach(memory => {
      Object.entries(memory.content.emotions).forEach(([emotion, score]) => {
        if (!emotionTrend[emotion]) {
          emotionTrend[emotion] = [];
        }
        emotionTrend[emotion].push({ date: memory.timestamp, score });
      });
    });

    Object.entries(emotionTrend).forEach(([emotion, scores]) => {
      if (scores.length >= 3) {
        const trend = this.calculateTrend(scores);
        if (Math.abs(trend) > 0.1) {
          insights.push({
            id: `trend_${Date.now()}_${emotion}`,
            type: 'trend',
            confidence: Math.min(1, scores.length / 10),
            description: `${emotion} emotion is ${trend > 0 ? 'increasing' : 'decreasing'} over time`,
            evidence: memories.filter(m => emotion in m.content.emotions),
            metadata: { emotion, trend, dataPoints: scores.length },
            timestamp: new Date()
          });
        }
      }
    });

    return insights;
  }

  private calculateTrend(scores: Array<{ date: Date; score: number }>): number {
    if (scores.length < 2) return 0;
    
    // Simple linear regression slope
    const sortedScores = scores.sort((a, b) => a.date.getTime() - b.date.getTime());
    const n = sortedScores.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    sortedScores.forEach((point, index) => {
      sumX += index;
      sumY += point.score;
      sumXY += index * point.score;
      sumXX += index * index;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private detectAnomalies(memories: CAMMemoryEntry[]): CAMInsight[] {
    // Simplified anomaly detection
    const insights: CAMInsight[] = [];
    
    // Find memories with unusually high importance
    const importanceScores = memories.map(m => m.metadata.importance);
    const avgImportance = importanceScores.reduce((sum, score) => sum + score, 0) / importanceScores.length;
    const stdDev = Math.sqrt(
      importanceScores.reduce((sum, score) => sum + Math.pow(score - avgImportance, 2), 0) / importanceScores.length
    );

    const threshold = avgImportance + 2 * stdDev;
    const anomalies = memories.filter(m => m.metadata.importance > threshold);

    if (anomalies.length > 0) {
      insights.push({
        id: `anomaly_${Date.now()}_importance`,
        type: 'anomaly',
        confidence: 0.8,
        description: `Found ${anomalies.length} memories with unusually high importance`,
        evidence: anomalies,
        metadata: { threshold, avgImportance, stdDev },
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeRelationships(memories: CAMMemoryEntry[]): CAMInsight[] {
    // Simplified relationship analysis
    const insights: CAMInsight[] = [];
    
    // Find strongly connected memory clusters
    const relationshipCounts: Record<string, number> = {};
    
    memories.forEach(memory => {
      memory.metadata.relationships.forEach(relatedId => {
        const key = [memory.id, relatedId].sort().join('|');
        relationshipCounts[key] = (relationshipCounts[key] || 0) + 1;
      });
    });

    const strongRelationships = Object.entries(relationshipCounts)
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));

    if (strongRelationships.length > 0) {
      insights.push({
        id: `relationship_${Date.now()}_cluster`,
        type: 'relationship',
        confidence: 0.7,
        description: `Found ${strongRelationships.length} strong memory relationships`,
        evidence: memories.filter(m => 
          strongRelationships.some(rel => rel.key.includes(m.id))
        ),
        metadata: { relationshipCount: strongRelationships.length },
        timestamp: new Date()
      });
    }

    return insights;
  }

  private groupSimilarMemories(memories: CAMMemoryEntry[]): CAMMemoryEntry[][] {
    const groups: CAMMemoryEntry[][] = [];
    const processed = new Set<string>();

    memories.forEach(memory => {
      if (processed.has(memory.id)) return;

      const similarMemories = [memory];
      processed.add(memory.id);

      // Find similar memories
      memories.forEach(otherMemory => {
        if (processed.has(otherMemory.id) || memory.id === otherMemory.id) return;

        const similarity = this.calculateMemorySimilarity(memory, otherMemory);
        if (similarity > 0.7) {
          similarMemories.push(otherMemory);
          processed.add(otherMemory.id);
        }
      });

      groups.push(similarMemories);
    });

    return groups;
  }

  private calculateMemorySimilarity(memoryA: CAMMemoryEntry, memoryB: CAMMemoryEntry): number {
    let similarity = 0;
    let factors = 0;

    // Type similarity
    if (memoryA.type === memoryB.type) {
      similarity += 0.3;
    }
    factors++;

    // Tag similarity
    const commonTags = memoryA.metadata.tags.filter(tag => 
      memoryB.metadata.tags.includes(tag)
    ).length;
    const totalTags = new Set([...memoryA.metadata.tags, ...memoryB.metadata.tags]).size;
    if (totalTags > 0) {
      similarity += (commonTags / totalTags) * 0.3;
      factors++;
    }

    // Entity similarity
    const commonEntities = memoryA.content.entities.filter(entity => 
      memoryB.content.entities.includes(entity)
    ).length;
    const totalEntities = new Set([...memoryA.content.entities, ...memoryB.content.entities]).size;
    if (totalEntities > 0) {
      similarity += (commonEntities / totalEntities) * 0.2;
      factors++;
    }

    // Embedding similarity
    if (memoryA.embedding && memoryB.embedding) {
      similarity += this.cosineSimilarity(memoryA.embedding, memoryB.embedding) * 0.2;
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  private async consolidateGroup(group: CAMMemoryEntry[]): Promise<CAMMemoryEntry | null> {
    if (group.length < 2) return null;

    // Create consolidated memory
    const consolidatedId = `cam_consolidated_${Date.now()}`;
    const contents = group.map(m => m.content.text).join(' | ');
    const allTags = [...new Set(group.flatMap(m => m.metadata.tags))];
    const allEntities = [...new Set(group.flatMap(m => m.content.entities))];
    
    const consolidated: CAMMemoryEntry = {
      id: consolidatedId,
      timestamp: new Date(),
      agentId: group[0].agentId,
      sessionId: group[0].sessionId,
      type: 'semantic', // Consolidated memories become semantic
      content: {
        text: `Consolidated memory: ${contents}`,
        context: group.reduce((acc, m) => ({ ...acc, ...m.content.context }), {}),
        entities: allEntities,
        emotions: group.reduce((acc, m) => {
          Object.entries(m.content.emotions).forEach(([emotion, score]) => {
            acc[emotion] = (acc[emotion] || 0) + score;
          });
          return acc;
        }, {} as Record<string, number>),
        confidence: group.reduce((sum, m) => sum + m.content.confidence, 0) / group.length
      },
      metadata: {
        source: 'consolidation',
        importance: Math.max(...group.map(m => m.metadata.importance)),
        frequency: group.reduce((sum, m) => sum + m.metadata.frequency, 0),
        lastAccessed: new Date(),
        tags: allTags,
        relationships: [...new Set(group.flatMap(m => m.metadata.relationships))]
      },
      retention: {
        decay: 0.05, // Consolidated memories decay slower
        reinforcement: group.length // Reinforced by number of original memories
      },
      embedding: await this.generateEmbedding(contents)
    };

    return consolidated;
  }

  private startMemoryDecay(): void {
    // Run memory decay every hour
    this.decayTimer = setInterval(() => {
      this.forgetMemories();
    }, 60 * 60 * 1000);
  }

  // Public API methods
  getMemory(memoryId: string): CAMMemoryEntry | undefined {
    return this.memories.get(memoryId);
  }

  getContext(sessionId: string, agentId: string): CAMContext | undefined {
    return this.contexts.get(`${sessionId}_${agentId}`);
  }

  getAllMemories(agentId?: string): CAMMemoryEntry[] {
    const memories = Array.from(this.memories.values());
    return agentId ? memories.filter(m => m.agentId === agentId) : memories;
  }

  getMemoryStats(): {
    totalMemories: number;
    memoriesByType: Record<string, number>;
    memoriesByAgent: Record<string, number>;
    avgImportance: number;
    avgAge: number;
  } {
    const memories = Array.from(this.memories.values());
    const now = new Date();
    
    const memoriesByType: Record<string, number> = {};
    const memoriesByAgent: Record<string, number> = {};
    let totalImportance = 0;
    let totalAge = 0;

    memories.forEach(memory => {
      memoriesByType[memory.type] = (memoriesByType[memory.type] || 0) + 1;
      memoriesByAgent[memory.agentId] = (memoriesByAgent[memory.agentId] || 0) + 1;
      totalImportance += memory.metadata.importance;
      totalAge += now.getTime() - memory.timestamp.getTime();
    });

    return {
      totalMemories: memories.length,
      memoriesByType,
      memoriesByAgent,
      avgImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      avgAge: memories.length > 0 ? totalAge / memories.length : 0
    };
  }

  async cleanup(): Promise<void> {
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
      this.decayTimer = null;
    }
  }
}

// Export singleton instance
export const camManager = new CAMManager();
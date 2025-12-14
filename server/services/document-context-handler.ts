import { DocumentContext } from "./enhanced-agent-prompts";
import { EnhancedAIService } from "./enhanced-ai-service";

export interface DocumentProcessingResult {
  document: DocumentContext;
  processingStatus: "success" | "partial" | "failed";
  warnings?: string[];
  extractedEntities?: ExtractedEntity[];
}

export interface ExtractedEntity {
  type: "person" | "organization" | "location" | "date" | "number" | "keyword" | "topic";
  value: string;
  confidence: number;
  context?: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  tokens: number;
  relevanceScore?: number;
}

export interface RAGContext {
  query: string;
  relevantChunks: DocumentChunk[];
  totalTokens: number;
  documentsUsed: string[];
}

export class DocumentContextHandler {
  private aiService: EnhancedAIService;
  private documents: Map<string, DocumentContext> = new Map();
  private chunks: Map<string, DocumentChunk[]> = new Map();
  private readonly MAX_CHUNK_SIZE = 1000;
  private readonly CHUNK_OVERLAP = 100;

  constructor() {
    this.aiService = new EnhancedAIService();
  }

  async processDocument(
    input: {
      id: string;
      type: DocumentContext["type"];
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<DocumentProcessingResult> {
    const warnings: string[] = [];
    let processedContent = input.content;
    let summary: string | undefined;

    switch (input.type) {
      case "pdf":
        processedContent = this.extractTextFromPDF(input.content);
        break;
      case "url":
        processedContent = await this.fetchURLContent(input.content);
        break;
      case "image":
        processedContent = await this.describeImage(input.content);
        break;
      case "structured":
        processedContent = this.parseStructuredData(input.content);
        break;
    }

    const tokens = this.estimateTokens(processedContent);

    if (tokens > 2000) {
      summary = await this.generateSummary(processedContent);
      warnings.push(`Document is large (${tokens} tokens). Summary generated for context efficiency.`);
    }

    const extractedEntities = await this.extractEntities(processedContent);

    const document: DocumentContext = {
      id: input.id,
      type: input.type,
      content: processedContent,
      summary,
      metadata: {
        ...input.metadata,
        processedAt: new Date().toISOString(),
        originalLength: input.content.length,
        processedLength: processedContent.length
      },
      tokens
    };

    this.documents.set(input.id, document);

    const chunks = this.chunkDocument(document);
    this.chunks.set(input.id, chunks);

    return {
      document,
      processingStatus: "success",
      warnings: warnings.length > 0 ? warnings : undefined,
      extractedEntities
    };
  }

  private extractTextFromPDF(base64Content: string): string {
    try {
      const buffer = Buffer.from(base64Content, 'base64');
      const textContent = buffer.toString('utf-8');
      
      if (textContent.includes('%PDF')) {
        return `[PDF Document Detected - ${base64Content.length} bytes]\n\nLIMITATION: Binary PDF parsing requires pdf-parse library. For text-based PDFs, content extraction is limited.\n\nTo use this feature fully, please:\n1. Convert PDF to text before uploading, OR\n2. Use document type 'text' with extracted content\n\nPartial text extracted (if any readable text exists):\n${textContent.replace(/[^\x20-\x7E\n\r]/g, '').substring(0, 2000)}`;
      }
      
      return textContent;
    } catch (error) {
      return `[PDF Extraction Error]\n\nUnable to extract text from PDF. Please provide document content as plain text instead.`;
    }
  }

  private async fetchURLContent(url: string): Promise<string> {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Invalid URL format');
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WAI-SDK/1.0 DocumentFetcher',
          'Accept': 'text/html,text/plain,application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          return this.flattenObject(json);
        } catch {
          return text;
        }
      }

      if (contentType.includes('text/html')) {
        const stripped = text
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return `[Content from: ${url}]\n\n${stripped.substring(0, 10000)}`;
      }

      return text.substring(0, 10000);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      return `[URL Fetch Failed: ${url}]\n\nError: ${errMsg}\n\nPlease copy and paste the content directly as text instead.`;
    }
  }

  private async describeImage(imageData: string): Promise<string> {
    try {
      const response = await this.aiService.chat(
        [
          {
            role: "user",
            content: `Describe this image in detail for use as document context. Focus on:\n1. Main subject and content\n2. Any text visible in the image\n3. Key visual elements and layout\n4. Relevant data or information shown\n\nImage data: [Image provided - base64 ${imageData.length} chars]`
          }
        ],
        "gemini",
        "gemini-2.5-flash"
      );
      return `[Image Description - AI Generated]\n\n${response.content}`;
    } catch (error) {
      return `[Image Analysis]\n\nLIMITATION: Vision model integration required for full image analysis.\n\nImage size: ${imageData.length} bytes\n\nTo use images effectively:\n1. Provide a text description of the image content, OR\n2. Extract any text from the image and provide as document type 'text'`;
    }
  }

  private parseStructuredData(data: string): string {
    try {
      const parsed = JSON.parse(data);
      return this.flattenObject(parsed);
    } catch {
      try {
        return data;
      } catch {
        return data;
      }
    }
  }

  private flattenObject(obj: any, prefix = ""): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        lines.push(this.flattenObject(value, fullKey));
      } else if (Array.isArray(value)) {
        lines.push(`${fullKey}: [${value.map(v => typeof v === "object" ? JSON.stringify(v) : v).join(", ")}]`);
      } else {
        lines.push(`${fullKey}: ${value}`);
      }
    }

    return lines.join("\n");
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private async generateSummary(content: string): Promise<string> {
    const truncated = content.substring(0, 8000);
    
    try {
      const response = await this.aiService.chat(
        [
          {
            role: "system",
            content: "You are a document summarization expert. Create a concise but comprehensive summary that captures all key points, data, and actionable insights."
          },
          {
            role: "user",
            content: `Summarize the following document in 200-300 words, focusing on:\n1. Main topic/purpose\n2. Key facts and figures\n3. Important conclusions or recommendations\n\nDocument:\n${truncated}`
          }
        ],
        "groq",
        "llama-3.1-8b-instant"
      );
      
      return response.content;
    } catch {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      return sentences.slice(0, 5).join(" ") + "...";
    }
  }

  private async extractEntities(content: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    const datePatterns = [
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
      /\b\d{4}[-/]\d{2}[-/]\d{2}\b/g
    ];

    for (const pattern of datePatterns) {
      const matches = content.match(pattern) || [];
      for (const match of matches) {
        entities.push({ type: "date", value: match, confidence: 0.9 });
      }
    }

    const numberPatterns = [
      { pattern: /\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|M|B|K))?/g, type: "number" as const },
      { pattern: /\d+(?:\.\d+)?%/g, type: "number" as const },
      { pattern: /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, type: "number" as const }
    ];

    for (const { pattern, type } of numberPatterns) {
      const matches = content.match(pattern) || [];
      for (const match of matches) {
        entities.push({ type, value: match, confidence: 0.85 });
      }
    }

    const keywords = this.extractKeywords(content);
    for (const keyword of keywords) {
      entities.push({ type: "keyword", value: keyword, confidence: 0.7 });
    }

    return entities.slice(0, 50);
  }

  private extractKeywords(content: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
      "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
      "used", "it", "its", "this", "that", "these", "those", "i", "you", "he",
      "she", "we", "they", "what", "which", "who", "whom", "whose", "where",
      "when", "why", "how", "all", "each", "every", "both", "few", "more",
      "most", "other", "some", "such", "no", "nor", "not", "only", "own",
      "same", "so", "than", "too", "very", "just", "also"
    ]);

    const words = content.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    const frequency: Record<string, number> = {};
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private chunkDocument(document: DocumentContext): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const content = document.content;
    
    const paragraphs = content.split(/\n\n+/);
    let currentChunk = "";
    let startIndex = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const potentialChunk = currentChunk + (currentChunk ? "\n\n" : "") + paragraph;
      const tokens = this.estimateTokens(potentialChunk);

      if (tokens > this.MAX_CHUNK_SIZE && currentChunk) {
        chunks.push({
          id: `${document.id}-chunk-${chunkIndex}`,
          content: currentChunk,
          startIndex,
          endIndex: startIndex + currentChunk.length,
          tokens: this.estimateTokens(currentChunk)
        });
        chunkIndex++;
        
        const overlap = currentChunk.slice(-this.CHUNK_OVERLAP);
        currentChunk = overlap + "\n\n" + paragraph;
        startIndex = startIndex + currentChunk.length - overlap.length - paragraph.length - 2;
      } else {
        currentChunk = potentialChunk;
      }
    }

    if (currentChunk) {
      chunks.push({
        id: `${document.id}-chunk-${chunkIndex}`,
        content: currentChunk,
        startIndex,
        endIndex: content.length,
        tokens: this.estimateTokens(currentChunk)
      });
    }

    return chunks;
  }

  async getRelevantContext(
    query: string,
    documentIds: string[],
    maxTokens: number = 4000
  ): Promise<RAGContext> {
    const allChunks: DocumentChunk[] = [];

    for (const docId of documentIds) {
      const docChunks = this.chunks.get(docId);
      if (docChunks) {
        for (const chunk of docChunks) {
          const relevanceScore = this.calculateRelevance(query, chunk.content);
          allChunks.push({ ...chunk, relevanceScore });
        }
      }
    }

    allChunks.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    const selectedChunks: DocumentChunk[] = [];
    let totalTokens = 0;
    const documentsUsed = new Set<string>();

    for (const chunk of allChunks) {
      if (totalTokens + chunk.tokens <= maxTokens) {
        selectedChunks.push(chunk);
        totalTokens += chunk.tokens;
        documentsUsed.add(chunk.id.split("-chunk-")[0]);
      }
    }

    return {
      query,
      relevantChunks: selectedChunks,
      totalTokens,
      documentsUsed: Array.from(documentsUsed)
    };
  }

  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    let matches = 0;
    for (const word of queryWords) {
      if (word.length > 2 && contentLower.includes(word)) {
        matches++;
      }
    }

    const wordMatchScore = matches / queryWords.length;

    let phraseScore = 0;
    if (queryWords.length >= 2) {
      for (let i = 0; i < queryWords.length - 1; i++) {
        const phrase = `${queryWords[i]} ${queryWords[i + 1]}`;
        if (contentLower.includes(phrase)) {
          phraseScore += 0.2;
        }
      }
    }

    return Math.min(1, wordMatchScore * 0.7 + phraseScore * 0.3);
  }

  formatContextForPrompt(ragContext: RAGContext): string {
    if (ragContext.relevantChunks.length === 0) {
      return "";
    }

    let formatted = "## RELEVANT DOCUMENT CONTEXT\n\n";
    formatted += `Query: "${ragContext.query}"\n`;
    formatted += `Documents used: ${ragContext.documentsUsed.join(", ")}\n\n`;

    for (const chunk of ragContext.relevantChunks) {
      formatted += `### Source: ${chunk.id}\n`;
      formatted += `Relevance: ${((chunk.relevanceScore || 0) * 100).toFixed(0)}%\n`;
      formatted += `---\n${chunk.content}\n---\n\n`;
    }

    return formatted;
  }

  getDocument(id: string): DocumentContext | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): DocumentContext[] {
    return Array.from(this.documents.values());
  }

  removeDocument(id: string): boolean {
    this.chunks.delete(id);
    return this.documents.delete(id);
  }

  clearAllDocuments(): void {
    this.documents.clear();
    this.chunks.clear();
  }

  getDocumentStats(): {
    totalDocuments: number;
    totalTokens: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    let totalTokens = 0;

    const docs = Array.from(this.documents.values());
    for (const doc of docs) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      totalTokens += doc.tokens;
    }

    return {
      totalDocuments: this.documents.size,
      totalTokens,
      byType
    };
  }
}

export const documentContextHandler = new DocumentContextHandler();

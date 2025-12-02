/**
 * File Processor Service - COMPATIBILITY WRAPPER
 * 
 * This service delegates to the production file processor for optimal performance
 * while maintaining backward compatibility with existing code.
 */

import { FileProcessorService } from './file-processor-prod';
import type { FileUpload, ProjectAnalysis } from '@shared/schema';

interface ProcessedFile {
  fileUpload: FileUpload;
  analysis?: ProjectAnalysis;
  extractedContent?: string;
  metadata?: any;
}

interface FileProcessingResult {
  success: boolean;
  files: ProcessedFile[];
  projectAnalysis?: ProjectAnalysis;
  error?: string;
}

// Compatibility wrapper that delegates to production implementation
export class FileProcessor {
  private prodService: FileProcessorService;

  constructor() {
    this.prodService = new FileProcessorService();
  }

  // Delegate all methods to production service with compatibility mapping
  async processFile(filePath: string, options: any = {}): Promise<ProcessedFile> {
    const result = await this.prodService.processFile({
      filePath,
      fileType: this.inferFileType(filePath),
      analysisType: 'content',
      options
    });
    
    return {
      fileUpload: {
        id: Math.random().toString(36),
        fileName: result.fileInfo.name,
        filePath,
        fileSize: result.fileInfo.size,
        mimeType: result.fileInfo.type,
        uploadDate: new Date()
      },
      extractedContent: result.content.extractedText,
      metadata: result.content.metadata,
      analysis: result.analysis as any
    };
  }

  async processFiles(files: any[]): Promise<FileProcessingResult> {
    try {
      const processedFiles: ProcessedFile[] = [];
      
      for (const file of files) {
        const processed = await this.processFile(file.path || file.filePath, {});
        processedFiles.push(processed);
      }
      
      return {
        success: true,
        files: processedFiles
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    };
  }

  private inferFileType(filePath: string): any {
    const ext = filePath.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['txt', 'md'].includes(ext || '')) return 'document';
    if (['js', 'ts', 'html', 'css'].includes(ext || '')) return 'code';
    return 'document';
  }
}

// Export singleton instance for backward compatibility
export const fileProcessor = new FileProcessor();
/**
 * Document Processing API Routes - WAI SDK v3.1
 * 
 * Multi-format document processing endpoints for Market360.
 */

import { Router, Request, Response } from 'express';
import { documentProcessingService } from '../services/document-processing-service';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * POST /api/v3/documents/process
 * Process a document (upload and extract content)
 */
router.post('/process', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const options = {
      extractText: req.body.extractText !== 'false',
      extractMetadata: req.body.extractMetadata !== 'false',
      extractStructure: req.body.extractStructure !== 'false',
      performOCR: req.body.performOCR === 'true',
      summarize: req.body.summarize === 'true',
      extractEntities: req.body.extractEntities === 'true',
      language: req.body.language,
      maxPages: req.body.maxPages ? parseInt(req.body.maxPages) : undefined
    };

    const document = await documentProcessingService.processDocument(
      multerReq.file.buffer,
      multerReq.file.originalname,
      multerReq.file.mimetype,
      options
    );

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Document processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v3/documents/:id
 * Get a processed document by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const document = documentProcessingService.getDocument(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document'
    });
  }
});

/**
 * DELETE /api/v3/documents/:id
 * Delete a processed document
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const deleted = documentProcessingService.deleteDocument(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

/**
 * GET /api/v3/documents/formats/supported
 * Get list of supported document formats
 */
router.get('/formats/supported', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: documentProcessingService.getSupportedFormats()
  });
});

/**
 * GET /api/v3/documents/health
 * Get service health status
 */
router.get('/health', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: documentProcessingService.getHealth()
  });
});

export default router;

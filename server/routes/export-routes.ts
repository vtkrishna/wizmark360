import { Router, Request, Response } from 'express';
import * as path from 'path';
import {
  generateDocument,
  getDocument,
  listDocuments,
  createShareLink,
  getShareLink,
  getDocumentFilePath,
  DocumentRequest
} from '../services/document-generator';

const router = Router();

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  csv: 'text/csv',
  html: 'text/html',
  pptx: 'text/html'
};

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { title, content, type, brandContext, metadata } = req.body as DocumentRequest;

    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Missing required fields: title, content, type' });
    }

    const validTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'csv', 'html'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const document = await generateDocument({ title, content, type, brandContext, metadata });
    res.json({ success: true, document });
  } catch (error: any) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: 'Failed to generate document', details: error.message });
  }
});

router.get('/list', (_req: Request, res: Response) => {
  try {
    const documents = listDocuments();
    res.json({ success: true, documents, total: documents.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list documents', details: error.message });
  }
});

router.get('/:id/download', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = getDocument(id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = getDocumentFilePath(id);
    if (!filePath) {
      return res.status(404).json({ error: 'Document file not found on disk' });
    }

    const mimeType = MIME_TYPES[doc.format] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to download document', details: error.message });
  }
});

router.post('/:id/share', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { expiresInHours } = req.body || {};

    const doc = getDocument(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const shareLink = createShareLink(id, expiresInHours);
    if (!shareLink) {
      return res.status(500).json({ error: 'Failed to create share link' });
    }

    res.json({
      success: true,
      shareId: shareLink.shareId,
      shareUrl: `/api/export/share/${shareLink.shareId}`,
      expiresAt: shareLink.expiresAt
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create share link', details: error.message });
  }
});

router.get('/share/:shareId', (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    const link = getShareLink(shareId);

    if (!link) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    const doc = getDocument(link.documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Shared document no longer exists' });
    }

    const filePath = getDocumentFilePath(link.documentId);
    if (!filePath) {
      return res.status(404).json({ error: 'Shared document file not found on disk' });
    }

    const mimeType = MIME_TYPES[doc.format] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to access shared document', details: error.message });
  }
});

export default router;

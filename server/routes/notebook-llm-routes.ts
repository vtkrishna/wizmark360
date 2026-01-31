/**
 * NotebookLLM Studio API Routes - WAI SDK v3.1
 * 
 * Interactive document Q&A with citations for knowledge management.
 * Similar to Google's NotebookLM but integrated with Market360 agents.
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
 * POST /api/v3/notebook/projects
 * Create a new document project (notebook)
 */
router.post('/projects', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description, tags } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const project = await documentProcessingService.createProject(name, description, tags);

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

/**
 * GET /api/v3/notebook/projects
 * List all document projects
 */
router.get('/projects', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const projects = documentProcessingService.listProjects();

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list projects'
    });
  }
});

/**
 * GET /api/v3/notebook/projects/:id
 * Get a document project by ID
 */
router.get('/projects/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const project = documentProcessingService.getProject(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve project'
    });
  }
});

/**
 * DELETE /api/v3/notebook/projects/:id
 * Delete a document project
 */
router.delete('/projects/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const deleted = documentProcessingService.deleteProject(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

/**
 * POST /api/v3/notebook/projects/:id/documents
 * Add a document to a project
 */
router.post('/projects/:id/documents', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const multerReq = req as MulterRequest;

    if (!multerReq.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // First, process the document
    const document = await documentProcessingService.processDocument(
      multerReq.file.buffer,
      multerReq.file.originalname,
      multerReq.file.mimetype,
      {
        extractText: true,
        extractMetadata: true,
        extractStructure: true,
        summarize: true
      }
    );

    // Then add it to the project
    const project = await documentProcessingService.addDocumentToProject(projectId, document.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: {
        document,
        project
      }
    });
  } catch (error) {
    console.error('Add document to project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add document to project'
    });
  }
});

/**
 * POST /api/v3/notebook/projects/:id/query
 * Query documents in a project (Q&A with citations)
 */
router.post('/projects/:id/query', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const { question, includeContext = true, maxSources = 5 } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const answer = await documentProcessingService.queryProject({
      projectId,
      question,
      includeContext,
      maxSources
    });

    res.json({
      success: true,
      data: answer
    });
  } catch (error) {
    console.error('Query project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to query project'
    });
  }
});

/**
 * POST /api/v3/notebook/projects/:id/summary
 * Generate a summary of all documents in a project
 */
router.post('/projects/:id/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const project = documentProcessingService.getProject(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    if (project.documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No documents in project to summarize'
      });
    }

    // Combine all document summaries
    const summaries = project.documents.map(doc => ({
      documentName: doc.filename,
      summary: doc.analysis?.summary || doc.content.text.slice(0, 500),
      keyPoints: doc.analysis?.keyPoints || []
    }));

    res.json({
      success: true,
      data: {
        projectName: project.name,
        documentCount: project.documents.length,
        summaries,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary'
    });
  }
});

/**
 * POST /api/v3/notebook/chat
 * Chat with documents across all projects
 */
router.post('/chat', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { message, projectIds, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // For MVP, query all specified projects or all projects
    const projects = documentProcessingService.listProjects();
    const targetProjects = projectIds?.length 
      ? projects.filter(p => projectIds.includes(p.id))
      : projects;

    if (targetProjects.length === 0) {
      return res.json({
        success: true,
        data: {
          response: 'No document projects found. Please create a project and add documents first.',
          sources: [],
          conversationId: conversationId || `conv_${Date.now()}`
        }
      });
    }

    // Query all projects and combine results
    const allSources: any[] = [];
    let bestAnswer = '';
    let bestConfidence = 0;

    for (const project of targetProjects) {
      const result = await documentProcessingService.queryProject({
        projectId: project.id,
        question: message,
        includeContext: true,
        maxSources: 3
      });

      if (result.confidence > bestConfidence) {
        bestConfidence = result.confidence;
        bestAnswer = result.answer;
      }

      allSources.push(...result.sources.map(s => ({
        ...s,
        projectName: project.name
      })));
    }

    // Sort sources by relevance
    allSources.sort((a, b) => b.relevance - a.relevance);

    res.json({
      success: true,
      data: {
        response: bestAnswer || 'I could not find relevant information in your documents.',
        sources: allSources.slice(0, 5),
        conversationId: conversationId || `conv_${Date.now()}`,
        confidence: bestConfidence
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat failed'
    });
  }
});

export default router;

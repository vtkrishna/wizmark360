/**
 * Enhanced Mem0 Memory API Routes - WAI SDK v3.1
 */

import { Router, Request, Response } from 'express';
import { enhancedMem0Service } from '../services/mem0-enhanced-service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * POST /api/v3/memory - Store a new memory
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { content, scope, type, userId, sessionId, agentId, workspaceId, tags, metadata, importance, expiresIn } = req.body;

    if (!content || !scope || !type) {
      return res.status(400).json({ error: 'content, scope, and type are required' });
    }

    const memory = await enhancedMem0Service.storeMemory(content, {
      scope,
      type,
      userId,
      sessionId,
      agentId,
      workspaceId,
      tags,
      metadata,
      importance,
      expiresIn
    });

    res.json({ success: true, memory });
  } catch (error: any) {
    console.error('Memory store error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/memory/search - Search memories
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, scope, type, userId, sessionId, agentId, workspaceId, limit, threshold, includeExpired, sortBy } = req.body;

    const memories = await enhancedMem0Service.searchMemories({
      query: query || '',
      scope,
      type,
      userId,
      sessionId,
      agentId,
      workspaceId,
      limit,
      threshold,
      includeExpired,
      sortBy
    });

    res.json({ success: true, memories, count: memories.length });
  } catch (error: any) {
    console.error('Memory search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/memory/session/:sessionId - Get session context
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId, agentId, workspaceId, maxTokens } = req.query;

    const context = await enhancedMem0Service.getSessionContext(sessionId, {
      userId: userId as string,
      agentId: agentId as string,
      workspaceId: workspaceId as string,
      maxTokens: maxTokens ? parseInt(maxTokens as string) : undefined
    });

    res.json({ success: true, context });
  } catch (error: any) {
    console.error('Session context error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/memory/summary/:userId - Get summarized memories
 */
router.get('/summary/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { agentId, workspaceId } = req.query;

    const summary = await enhancedMem0Service.getSummarizedMemories(userId, {
      agentId: agentId as string,
      workspaceId: workspaceId as string
    });

    res.json({ success: true, summary });
  } catch (error: any) {
    console.error('Memory summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/memory/:memoryId/feedback - Provide feedback on a memory
 */
router.post('/:memoryId/feedback', async (req: Request, res: Response) => {
  try {
    const { memoryId } = req.params;
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({ error: 'helpful (boolean) is required' });
    }

    await enhancedMem0Service.provideFeedback(memoryId, helpful);
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error: any) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v3/memory/consolidate/:userId - Consolidate memories
 */
router.post('/consolidate/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await enhancedMem0Service.consolidateMemories(userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Consolidation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v3/memory/:memoryId - Delete a memory
 */
router.delete('/:memoryId', async (req: Request, res: Response) => {
  try {
    const { memoryId } = req.params;
    const deleted = enhancedMem0Service.deleteMemory(memoryId);
    res.json({ success: deleted, message: deleted ? 'Memory deleted' : 'Memory not found' });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v3/memory/user/:userId - Clear user memories
 */
router.delete('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const deleted = enhancedMem0Service.clearUserMemories(userId);
    res.json({ success: true, deletedCount: deleted });
  } catch (error: any) {
    console.error('Clear user memories error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v3/memory/session/:sessionId - Clear session
 */
router.delete('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    enhancedMem0Service.clearSession(sessionId);
    res.json({ success: true, message: 'Session cleared' });
  } catch (error: any) {
    console.error('Clear session error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/memory/stats - Get memory statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = enhancedMem0Service.getStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v3/memory/health - Health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json(enhancedMem0Service.getHealth());
});

export default router;

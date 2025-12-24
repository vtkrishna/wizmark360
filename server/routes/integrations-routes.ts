import { Router, Request, Response } from "express";
import { crmIntegrationService } from "../services/crm-integration-service";
import { socialPublishingService } from "../services/social-publishing-service";
import { smartInboxService } from "../services/smart-inbox-service";

const router = Router();

router.get("/crm/connections", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const connections = await crmIntegrationService.getConnections(brandId);
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/crm/connections/:id", async (req: Request, res: Response) => {
  try {
    const connection = await crmIntegrationService.getConnection(parseInt(req.params.id));
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/connections", async (req: Request, res: Response) => {
  try {
    const connection = await crmIntegrationService.createConnection(req.body);
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/crm/connections/:id", async (req: Request, res: Response) => {
  try {
    const connection = await crmIntegrationService.updateConnection(parseInt(req.params.id), req.body);
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/crm/connections/:id", async (req: Request, res: Response) => {
  try {
    await crmIntegrationService.deleteConnection(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/crm/connections/:id/contacts", async (req: Request, res: Response) => {
  try {
    const { limit, offset, search, lifecycleStage, leadStatus } = req.query;
    const result = await crmIntegrationService.getContacts(parseInt(req.params.id), {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      search: search as string,
      lifecycleStage: lifecycleStage as string,
      leadStatus: leadStatus as string,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/crm/contacts/:id", async (req: Request, res: Response) => {
  try {
    const contact = await crmIntegrationService.getContact(parseInt(req.params.id));
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/contacts", async (req: Request, res: Response) => {
  try {
    const contact = await crmIntegrationService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/crm/contacts/:id", async (req: Request, res: Response) => {
  try {
    const contact = await crmIntegrationService.updateContact(parseInt(req.params.id), req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/contacts/:id/score", async (req: Request, res: Response) => {
  try {
    const result = await crmIntegrationService.scoreLeadWithAI(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/contacts/:id/analyze", async (req: Request, res: Response) => {
  try {
    const result = await crmIntegrationService.analyzeContactWithAI(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/contacts/:id/outreach", async (req: Request, res: Response) => {
  try {
    const { template } = req.body;
    const result = await crmIntegrationService.generatePersonalizedOutreach(parseInt(req.params.id), template);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/crm/connections/:id/deals", async (req: Request, res: Response) => {
  try {
    const { limit, offset, stage, pipeline } = req.query;
    const result = await crmIntegrationService.getDeals(parseInt(req.params.id), {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      stage: stage as string,
      pipeline: pipeline as string,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/crm/deals/:id", async (req: Request, res: Response) => {
  try {
    const deal = await crmIntegrationService.getDeal(parseInt(req.params.id));
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/deals", async (req: Request, res: Response) => {
  try {
    const deal = await crmIntegrationService.createDeal(req.body);
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/crm/deals/:id", async (req: Request, res: Response) => {
  try {
    const deal = await crmIntegrationService.updateDeal(parseInt(req.params.id), req.body);
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/connections/:id/sync/hubspot", async (req: Request, res: Response) => {
  try {
    const result = await crmIntegrationService.syncHubSpotContacts(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/crm/contacts/:id/push/hubspot", async (req: Request, res: Response) => {
  try {
    const result = await crmIntegrationService.pushContactToHubSpot(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/crm/connections/:id/stats", async (req: Request, res: Response) => {
  try {
    const stats = await crmIntegrationService.getConnectionStats(parseInt(req.params.id));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/connections", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const connections = await socialPublishingService.getConnections(brandId);
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/connections/:id", async (req: Request, res: Response) => {
  try {
    const connection = await socialPublishingService.getConnection(parseInt(req.params.id));
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/connections", async (req: Request, res: Response) => {
  try {
    const connection = await socialPublishingService.createConnection(req.body);
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/social/connections/:id", async (req: Request, res: Response) => {
  try {
    const connection = await socialPublishingService.updateConnection(parseInt(req.params.id), req.body);
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/social/connections/:id", async (req: Request, res: Response) => {
  try {
    await socialPublishingService.deleteConnection(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/calendar", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const { startDate, endDate, status, platform, limit, offset } = req.query;
    const result = await socialPublishingService.getCalendarItems(brandId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as any,
      platform: platform as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/calendar/:id", async (req: Request, res: Response) => {
  try {
    const item = await socialPublishingService.getCalendarItem(parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Calendar item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/calendar", async (req: Request, res: Response) => {
  try {
    const item = await socialPublishingService.createCalendarItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/social/calendar/:id", async (req: Request, res: Response) => {
  try {
    const item = await socialPublishingService.updateCalendarItem(parseInt(req.params.id), req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/social/calendar/:id", async (req: Request, res: Response) => {
  try {
    await socialPublishingService.deleteCalendarItem(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/calendar/:id/versions", async (req: Request, res: Response) => {
  try {
    const versions = await socialPublishingService.getContentVersions(parseInt(req.params.id));
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/calendar/:id/versions", async (req: Request, res: Response) => {
  try {
    const version = await socialPublishingService.createContentVersion({
      ...req.body,
      calendarItemId: parseInt(req.params.id),
    });
    res.status(201).json(version);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/calendar/:id/approvals", async (req: Request, res: Response) => {
  try {
    const approval = await socialPublishingService.createApproval({
      ...req.body,
      calendarItemId: parseInt(req.params.id),
    });
    res.status(201).json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/approvals/token/:token", async (req: Request, res: Response) => {
  try {
    const approval = await socialPublishingService.getApprovalByToken(req.params.token);
    if (!approval) {
      return res.status(404).json({ error: "Approval not found or expired" });
    }
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/approvals/:id/respond", async (req: Request, res: Response) => {
  try {
    const { status, feedback } = req.body;
    const approval = await socialPublishingService.respondToApproval(parseInt(req.params.id), { status, feedback });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/approvals/pending", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const approvals = await socialPublishingService.getPendingApprovals(brandId);
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/generate", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.body.brandId as string) || 1;
    const result = await socialPublishingService.generateAIContent(brandId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/optimal-time", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const platform = req.query.platform as any;
    const result = await socialPublishingService.suggestOptimalPostingTime(brandId, platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/calendar/:id/publish/instagram", async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    const result = await socialPublishingService.publishToInstagram(parseInt(req.params.id), connectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/calendar/:id/publish/facebook", async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    const result = await socialPublishingService.publishToFacebook(parseInt(req.params.id), connectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/calendar/:id/publish/linkedin", async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    const result = await socialPublishingService.publishToLinkedIn(parseInt(req.params.id), connectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/calendar/:id/posts", async (req: Request, res: Response) => {
  try {
    const posts = await socialPublishingService.getPublishedPosts(parseInt(req.params.id));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/social/posts/:id/sync-engagement", async (req: Request, res: Response) => {
  try {
    const post = await socialPublishingService.syncEngagement(parseInt(req.params.id));
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/social/stats", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const stats = await socialPublishingService.getCalendarStats(brandId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/connections", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const connections = await smartInboxService.getConnections(brandId);
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/connections/:id", async (req: Request, res: Response) => {
  try {
    const connection = await smartInboxService.getConnection(parseInt(req.params.id));
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/connections", async (req: Request, res: Response) => {
  try {
    const connection = await smartInboxService.createConnection(req.body);
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/inbox/connections/:id", async (req: Request, res: Response) => {
  try {
    const connection = await smartInboxService.updateConnection(parseInt(req.params.id), req.body);
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/conversations", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const { status, channel, assigneeId, priority, unreadOnly, search, limit, offset } = req.query;
    const result = await smartInboxService.getConversations(brandId, {
      status: status as any,
      channel: channel as any,
      assigneeId: assigneeId as string,
      priority: priority as any,
      unreadOnly: unreadOnly === "true",
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/conversations/:id", async (req: Request, res: Response) => {
  try {
    const conversation = await smartInboxService.getConversation(parseInt(req.params.id));
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/conversations", async (req: Request, res: Response) => {
  try {
    const conversation = await smartInboxService.createConversation(req.body);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch("/inbox/conversations/:id", async (req: Request, res: Response) => {
  try {
    const conversation = await smartInboxService.updateConversation(parseInt(req.params.id), req.body);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/conversations/:id/assign", async (req: Request, res: Response) => {
  try {
    const { assigneeId, assigneeName } = req.body;
    const conversation = await smartInboxService.assignConversation(parseInt(req.params.id), assigneeId, assigneeName);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/conversations/:id/mark-read", async (req: Request, res: Response) => {
  try {
    await smartInboxService.markConversationRead(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const messages = await smartInboxService.getMessages(
      parseInt(req.params.id),
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const message = await smartInboxService.createMessage({
      ...req.body,
      conversationId: parseInt(req.params.id),
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/conversations/:id/reply", async (req: Request, res: Response) => {
  try {
    const { content, useAISuggestion, quickReplyId, senderId, senderName } = req.body;
    const message = await smartInboxService.sendReply(parseInt(req.params.id), content, {
      useAISuggestion,
      quickReplyId,
      senderId,
      senderName,
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/messages/:id/read", async (req: Request, res: Response) => {
  try {
    await smartInboxService.markMessageRead(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/conversations/:id/ai-suggestion", async (req: Request, res: Response) => {
  try {
    const suggestion = await smartInboxService.generateAISuggestion(parseInt(req.params.id));
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/conversations/:id/sentiment", async (req: Request, res: Response) => {
  try {
    const sentiment = await smartInboxService.analyzeSentiment(parseInt(req.params.id));
    res.json(sentiment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/quick-replies", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const channel = req.query.channel as any;
    const quickReplies = await smartInboxService.getQuickReplies(brandId, channel);
    res.json(quickReplies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/quick-replies", async (req: Request, res: Response) => {
  try {
    const quickReply = await smartInboxService.createQuickReply(req.body);
    res.status(201).json(quickReply);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/sla", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const configs = await smartInboxService.getSLAConfigurations(brandId);
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/inbox/sla", async (req: Request, res: Response) => {
  try {
    const config = await smartInboxService.createSLAConfiguration(req.body);
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/sla/check-breaches", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const breached = await smartInboxService.checkSLABreaches(brandId);
    res.json(breached);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/inbox/stats", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.query.brandId as string) || 1;
    const stats = await smartInboxService.getInboxStats(brandId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

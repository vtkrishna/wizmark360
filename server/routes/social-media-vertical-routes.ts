import { Router, Request, Response } from "express";
import { socialMediaVerticalService } from "../services/social-media-vertical-service";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    vertical: "Social Media",
    version: "1.0.0",
    agents: 45,
    capabilities: [
      "Trend Analysis",
      "Content Ideation",
      "Content Creation",
      "Visual Production",
      "Content Review",
      "Schedule Optimization",
      "Publication",
      "Engagement Monitoring",
      "Performance Analytics"
    ]
  });
});

router.get("/stats", (_req: Request, res: Response) => {
  const stats = socialMediaVerticalService.getStats();
  res.json({
    ...stats,
    vertical: "Social Media",
    workflowStages: ["ideation", "creation", "scheduling", "engagement", "analytics"],
    supportedPlatforms: ["instagram", "twitter", "linkedin", "youtube", "facebook"]
  });
});

router.post("/workflow/full", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, contentType, targetAudience, campaignGoals, language } = req.body;

    if (!brandId || !platform || !contentType || !targetAudience) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "platform", "contentType", "targetAudience"]
      });
    }

    const workflow = await socialMediaVerticalService.executeFullWorkflow(
      brandId,
      {
        platform,
        contentType,
        targetAudience,
        campaignGoals: campaignGoals || ["awareness"],
        language
      }
    );

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error("Full workflow execution failed:", error);
    res.status(500).json({
      error: "Workflow execution failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/trends/analyze", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, contentType, targetAudience } = req.body;

    if (!brandId || !platform) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "platform"]
      });
    }

    const trends = await socialMediaVerticalService.executeTrendAnalysis(
      brandId,
      {
        platform,
        contentType: contentType || "mixed",
        targetAudience: targetAudience || "general"
      }
    );

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error("Trend analysis failed:", error);
    res.status(500).json({
      error: "Trend analysis failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/ideation/generate", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, contentType, targetAudience, campaignGoals, trendData } = req.body;

    if (!brandId || !platform || !targetAudience) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "platform", "targetAudience"]
      });
    }

    const ideas = await socialMediaVerticalService.executeIdeation(
      brandId,
      {
        platform,
        contentType: contentType || "mixed",
        targetAudience,
        campaignGoals: campaignGoals || ["awareness"]
      },
      trendData || null
    );

    res.json({
      success: true,
      count: ideas.length,
      ideas
    });
  } catch (error) {
    console.error("Ideation failed:", error);
    res.status(500).json({
      error: "Ideation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/content/create", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, language, ideas } = req.body;

    if (!brandId || !platform || !ideas || !Array.isArray(ideas)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "platform", "ideas (array)"]
      });
    }

    const contents = await socialMediaVerticalService.executeContentCreation(
      brandId,
      { platform, language },
      ideas
    );

    res.json({
      success: true,
      count: contents.length,
      contents
    });
  } catch (error) {
    console.error("Content creation failed:", error);
    res.status(500).json({
      error: "Content creation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/content/review", async (req: Request, res: Response) => {
  try {
    const { brandId, contents } = req.body;

    if (!brandId || !contents || !Array.isArray(contents)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "contents (array)"]
      });
    }

    const reviewed = await socialMediaVerticalService.executeContentReview(brandId, contents);

    res.json({
      success: true,
      reviewed: reviewed.filter(c => c.status === "approved").length,
      total: reviewed.length,
      contents: reviewed
    });
  } catch (error) {
    console.error("Content review failed:", error);
    res.status(500).json({
      error: "Content review failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/schedule/optimize", async (req: Request, res: Response) => {
  try {
    const { brandId, platform, contents } = req.body;

    if (!brandId || !platform || !contents || !Array.isArray(contents)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "platform", "contents (array)"]
      });
    }

    const scheduled = await socialMediaVerticalService.executeScheduleOptimization(
      brandId,
      { platform },
      contents
    );

    res.json({
      success: true,
      count: scheduled.length,
      scheduledPosts: scheduled
    });
  } catch (error) {
    console.error("Schedule optimization failed:", error);
    res.status(500).json({
      error: "Schedule optimization failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/publish", async (req: Request, res: Response) => {
  try {
    const { brandId, scheduledPosts } = req.body;

    if (!brandId || !scheduledPosts || !Array.isArray(scheduledPosts)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["brandId", "scheduledPosts (array)"]
      });
    }

    const published = await socialMediaVerticalService.executePublication(brandId, scheduledPosts);

    res.json({
      success: true,
      queued: published.filter(p => p.status === "queued").length,
      posts: published
    });
  } catch (error) {
    console.error("Publication failed:", error);
    res.status(500).json({
      error: "Publication failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/engagement/:brandId", async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;

    const metrics = await socialMediaVerticalService.executeEngagementMonitoring(brandId);

    res.json({
      success: true,
      count: metrics.length,
      metrics
    });
  } catch (error) {
    console.error("Engagement monitoring failed:", error);
    res.status(500).json({
      error: "Engagement monitoring failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/analytics/:brandId", async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { platform } = req.query;

    const analytics = await socialMediaVerticalService.executeAnalytics(
      brandId,
      { platform: (platform as string) || "all" }
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Analytics failed:", error);
    res.status(500).json({
      error: "Analytics failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/workflow/:workflowId", (req: Request, res: Response) => {
  const { workflowId } = req.params;
  const workflow = socialMediaVerticalService.getWorkflowStatus(workflowId);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  res.json({
    success: true,
    workflow
  });
});

router.get("/cache/ideas/:brandId", (req: Request, res: Response) => {
  const { brandId } = req.params;
  const ideas = socialMediaVerticalService.getCachedIdeas(brandId);

  res.json({
    success: true,
    count: ideas.length,
    ideas
  });
});

router.get("/cache/content/:brandId", (req: Request, res: Response) => {
  const { brandId } = req.params;
  const contents = socialMediaVerticalService.getCachedContent(brandId);

  res.json({
    success: true,
    count: contents.length,
    contents
  });
});

export default router;

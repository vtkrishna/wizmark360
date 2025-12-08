import { Router, Request, Response } from "express";
import { market360VerticalWorkflowService } from "../services/market360-vertical-workflows";

const router = Router();

const VERTICALS = ["social", "seo", "web", "sales", "whatsapp", "linkedin", "performance"] as const;

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    platform: "Market360 Vertical Workflows",
    version: "1.0.0",
    verticals: VERTICALS,
    capabilities: [
      "Full workflow execution per vertical",
      "Step-by-step workflow monitoring",
      "Cross-vertical analytics",
      "ROMA-aware agent selection"
    ]
  });
});

router.get("/stats", (_req: Request, res: Response) => {
  const stats = market360VerticalWorkflowService.getAllVerticalsStats();
  let totalAgents = 0;
  let totalTools = 0;
  let totalSteps = 0;

  for (const vertical of VERTICALS) {
    totalAgents += stats[vertical].agents;
    totalTools += stats[vertical].tools;
    totalSteps += stats[vertical].workflowSteps;
  }

  res.json({
    verticals: VERTICALS.length,
    totalAgents,
    totalTools,
    totalWorkflowSteps: totalSteps,
    byVertical: stats
  });
});

router.get("/:vertical/stats", (req: Request, res: Response) => {
  const { vertical } = req.params;

  if (!VERTICALS.includes(vertical as any)) {
    return res.status(400).json({
      error: "Invalid vertical",
      validVerticals: VERTICALS
    });
  }

  const stats = market360VerticalWorkflowService.getVerticalStats(vertical as any);
  res.json({
    vertical,
    ...stats
  });
});

router.post("/:vertical/workflow", async (req: Request, res: Response) => {
  const { vertical } = req.params;
  const { brandId, campaignId, options } = req.body;

  if (!VERTICALS.includes(vertical as any)) {
    return res.status(400).json({
      error: "Invalid vertical",
      validVerticals: VERTICALS
    });
  }

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: vertical as any,
      brandId,
      campaignId,
      options: options || {}
    });

    res.json({
      success: true,
      workflow: result
    });
  } catch (error) {
    console.error(`${vertical} workflow execution failed:`, error);
    res.status(500).json({
      error: "Workflow execution failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/workflow/:workflowId", (req: Request, res: Response) => {
  const { workflowId } = req.params;
  const workflow = market360VerticalWorkflowService.getWorkflowStatus(workflowId);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  res.json({
    success: true,
    workflow
  });
});

router.post("/seo/technical-audit", async (req: Request, res: Response) => {
  const { brandId, url, options } = req.body;

  if (!brandId || !url) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["brandId", "url"]
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "seo",
      brandId,
      options: { url, auditType: "technical", ...options }
    });

    res.json({
      success: true,
      auditResults: result.steps.find(s => s.stepName === "Technical SEO Audit")?.output || {},
      fullWorkflow: result
    });
  } catch (error) {
    res.status(500).json({ error: "Technical SEO audit failed" });
  }
});

router.post("/seo/geo-optimization", async (req: Request, res: Response) => {
  const { brandId, url, targetModels, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "seo",
      brandId,
      options: { url, targetModels, focusStep: "geo_optimization", ...options }
    });

    const geoStep = result.steps.find(s => s.stepName === "GEO Optimization");
    res.json({
      success: true,
      geoResults: geoStep?.output || {},
      llmVisibility: geoStep?.output?.results?.llmVisibility || {},
      shareOfModel: geoStep?.output?.results?.shareOfModel || 0
    });
  } catch (error) {
    res.status(500).json({ error: "GEO optimization failed" });
  }
});

router.post("/web/aura-build", async (req: Request, res: Response) => {
  const { brandId, designBrief, components, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "web",
      brandId,
      options: { designBrief, components, useAuraBuild: true, ...options }
    });

    const auraStep = result.steps.find(s => s.stepName === "Aura.build Integration");
    res.json({
      success: true,
      auraResults: auraStep?.output || {},
      generatedComponents: auraStep?.output?.results?.generatedComponents || 0,
      imagesGenerated: auraStep?.output?.results?.images?.generated || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Aura.build integration failed" });
  }
});

router.post("/sales/lead-enrichment", async (req: Request, res: Response) => {
  const { brandId, leads, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "sales",
      brandId,
      options: { leads, focusStep: "lead_intelligence", ...options }
    });

    const leadStep = result.steps.find(s => s.stepName === "Lead Intelligence");
    res.json({
      success: true,
      enrichmentResults: leadStep?.output || {},
      leadsEnriched: leadStep?.output?.results?.leadsEnriched || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Lead enrichment failed" });
  }
});

router.post("/whatsapp/flow-builder", async (req: Request, res: Response) => {
  const { brandId, flowConfig, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "whatsapp",
      brandId,
      options: { flowConfig, focusStep: "flow_design", ...options }
    });

    const flowStep = result.steps.find(s => s.stepName === "Flow Design");
    res.json({
      success: true,
      flowResults: flowStep?.output || {},
      flowsCreated: flowStep?.output?.results?.flowsCreated || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Flow builder failed" });
  }
});

router.post("/linkedin/profile-optimization", async (req: Request, res: Response) => {
  const { brandId, profileData, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "linkedin",
      brandId,
      options: { profileData, focusStep: "profile_optimization", ...options }
    });

    const profileStep = result.steps.find(s => s.stepName === "Profile Optimization");
    res.json({
      success: true,
      optimizationResults: profileStep?.output || {},
      profileScore: profileStep?.output?.results?.profileScore || {}
    });
  } catch (error) {
    res.status(500).json({ error: "Profile optimization failed" });
  }
});

router.post("/performance/campaign-optimizer", async (req: Request, res: Response) => {
  const { brandId, campaignIds, platforms, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "performance",
      brandId,
      options: { campaignIds, platforms, focusStep: "realtime_optimization", ...options }
    });

    const optimizationStep = result.steps.find(s => s.stepName === "Real-time Optimization");
    res.json({
      success: true,
      optimizationResults: optimizationStep?.output || {},
      roasImprovement: optimizationStep?.output?.results?.roasImprovement || "0%"
    });
  } catch (error) {
    res.status(500).json({ error: "Campaign optimization failed" });
  }
});

router.post("/performance/attribution", async (req: Request, res: Response) => {
  const { brandId, dateRange, options } = req.body;

  if (!brandId) {
    return res.status(400).json({
      error: "Missing required field: brandId"
    });
  }

  try {
    const result = await market360VerticalWorkflowService.executeVerticalWorkflow({
      vertical: "performance",
      brandId,
      options: { dateRange, focusStep: "attribution", ...options }
    });

    const attributionStep = result.steps.find(s => s.stepName === "Cross-Channel Attribution");
    res.json({
      success: true,
      attributionResults: attributionStep?.output || {},
      topChannels: attributionStep?.output?.results?.topChannels || []
    });
  } catch (error) {
    res.status(500).json({ error: "Attribution analysis failed" });
  }
});

export default router;

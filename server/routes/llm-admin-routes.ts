import { Router, Request, Response } from "express";
import { llmAdminConfig, BrandLLMConfig, Environment, Criticality, BrandTier, QualityLevel } from "../services/llm-admin-config";

const router = Router();

router.get("/settings", (_req: Request, res: Response) => {
  const settings = llmAdminConfig.getSettings();
  res.json({
    success: true,
    settings,
    summary: llmAdminConfig.getConfigSummary()
  });
});

router.patch("/settings", (req: Request, res: Response) => {
  const updates = req.body;
  
  const allowedUpdates = [
    "environment", "defaultQuality", "defaultCriticality",
    "costOptimizationEnabled", "maxGlobalCostPerRequest",
    "enableDualModelForAllBrands", "fallbackChainEnabled", "modelPriorityOrder"
  ];
  
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedUpdates) {
    if (key in updates) {
      filteredUpdates[key] = updates[key];
    }
  }
  
  const updated = llmAdminConfig.updateSettings(filteredUpdates);
  res.json({
    success: true,
    message: "Settings updated successfully",
    settings: updated
  });
});

router.post("/environment", (req: Request, res: Response) => {
  const { environment } = req.body;
  
  if (!["testing", "development", "production"].includes(environment)) {
    return res.status(400).json({
      error: "Invalid environment",
      validOptions: ["testing", "development", "production"]
    });
  }
  
  llmAdminConfig.setEnvironment(environment as Environment);
  res.json({
    success: true,
    message: `Environment set to ${environment}`,
    currentSettings: llmAdminConfig.getSettings()
  });
});

router.get("/brands", (_req: Request, res: Response) => {
  const brands = llmAdminConfig.getAllBrandConfigs();
  res.json({
    success: true,
    count: brands.length,
    brands
  });
});

router.get("/brands/:brandId", (req: Request, res: Response) => {
  const { brandId } = req.params;
  const config = llmAdminConfig.getBrandConfig(brandId);
  
  if (!config) {
    return res.status(404).json({ error: "Brand not found" });
  }
  
  res.json({ success: true, brand: config });
});

router.post("/brands", (req: Request, res: Response) => {
  const {
    brandId, brandName, tier, enableDualModelWorkflow,
    qualityLevel, maxCostPerRequest, preferredProviders,
    allowPremiumModels, criticality
  } = req.body;
  
  if (!brandId || !brandName) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["brandId", "brandName"]
    });
  }
  
  const config: BrandLLMConfig = {
    brandId,
    brandName,
    tier: (tier as BrandTier) || "starter",
    enableDualModelWorkflow: enableDualModelWorkflow ?? false,
    qualityLevel: (qualityLevel as QualityLevel) || "standard",
    maxCostPerRequest: maxCostPerRequest ?? 0.10,
    preferredProviders: preferredProviders || ["groq", "together"],
    allowPremiumModels: allowPremiumModels ?? false,
    criticality: (criticality as Criticality) || "medium"
  };
  
  llmAdminConfig.registerBrand(config);
  res.json({
    success: true,
    message: "Brand registered successfully",
    brand: config
  });
});

router.patch("/brands/:brandId", (req: Request, res: Response) => {
  const { brandId } = req.params;
  const updates = req.body;
  
  const updated = llmAdminConfig.updateBrandConfig(brandId, updates);
  
  if (!updated) {
    return res.status(404).json({ error: "Brand not found" });
  }
  
  res.json({
    success: true,
    message: "Brand configuration updated",
    brand: updated
  });
});

router.post("/brands/:brandId/enable-dual-model", (req: Request, res: Response) => {
  const { brandId } = req.params;
  const { enabled } = req.body;
  
  const updated = llmAdminConfig.updateBrandConfig(brandId, {
    enableDualModelWorkflow: enabled ?? true
  });
  
  if (!updated) {
    return res.status(404).json({ error: "Brand not found" });
  }
  
  res.json({
    success: true,
    message: `Dual-model workflow ${enabled ? "enabled" : "disabled"} for brand`,
    brand: updated
  });
});

router.post("/brands/:brandId/set-tier", (req: Request, res: Response) => {
  const { brandId } = req.params;
  const { tier } = req.body;
  
  if (!["starter", "professional", "enterprise", "vip"].includes(tier)) {
    return res.status(400).json({
      error: "Invalid tier",
      validOptions: ["starter", "professional", "enterprise", "vip"]
    });
  }
  
  const tierDefaults: Record<string, Partial<BrandLLMConfig>> = {
    starter: { qualityLevel: "draft", enableDualModelWorkflow: false, allowPremiumModels: false },
    professional: { qualityLevel: "standard", enableDualModelWorkflow: false, allowPremiumModels: false },
    enterprise: { qualityLevel: "high", enableDualModelWorkflow: true, allowPremiumModels: true },
    vip: { qualityLevel: "premium", enableDualModelWorkflow: true, allowPremiumModels: true }
  };
  
  const updated = llmAdminConfig.updateBrandConfig(brandId, {
    tier: tier as BrandTier,
    ...tierDefaults[tier]
  });
  
  if (!updated) {
    return res.status(404).json({ error: "Brand not found" });
  }
  
  res.json({
    success: true,
    message: `Brand tier set to ${tier}`,
    brand: updated
  });
});

router.post("/select-model", (req: Request, res: Response) => {
  const { brandId, contentType, priority, criticality, forceProduction } = req.body;
  
  const validContentTypes = ["social", "blog", "email", "ad", "research", "seo", "website", "ui_ux"];
  const validPriorities = ["cost", "quality", "speed", "balanced"];
  
  if (!contentType || !validContentTypes.includes(contentType)) {
    return res.status(400).json({
      error: "Invalid contentType",
      validOptions: validContentTypes
    });
  }
  
  if (!priority || !validPriorities.includes(priority)) {
    return res.status(400).json({
      error: "Invalid priority",
      validOptions: validPriorities
    });
  }
  
  const selection = llmAdminConfig.selectModelForTask({
    brandId,
    contentType,
    priority,
    criticality,
    forceProduction
  });
  
  res.json({
    success: true,
    selection,
    brandConfig: brandId ? llmAdminConfig.getBrandConfig(brandId) : null
  });
});

router.get("/templates/testing", (_req: Request, res: Response) => {
  res.json({
    success: true,
    template: llmAdminConfig.getTestingTemplate()
  });
});

router.get("/templates/production", (_req: Request, res: Response) => {
  res.json({
    success: true,
    template: llmAdminConfig.getProductionTemplate()
  });
});

router.get("/models/by-tier/:tier", (req: Request, res: Response) => {
  const { tier } = req.params;
  
  if (!["free", "budget", "standard", "premium"].includes(tier)) {
    return res.status(400).json({
      error: "Invalid tier",
      validOptions: ["free", "budget", "standard", "premium"]
    });
  }
  
  const models = llmAdminConfig.getModelsByTier(tier as "free" | "budget" | "standard" | "premium");
  res.json({
    success: true,
    tier,
    count: models.length,
    models
  });
});

router.get("/summary", (_req: Request, res: Response) => {
  res.json({
    success: true,
    summary: llmAdminConfig.getConfigSummary()
  });
});

export default router;

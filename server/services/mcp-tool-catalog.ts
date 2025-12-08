import { Vertical } from "../agents/market360-agent-catalog";

export type MCPToolCategory = 
  | "content-creation"
  | "analytics"
  | "automation"
  | "engagement"
  | "scheduling"
  | "research"
  | "optimization"
  | "generation"
  | "monitoring"
  | "integration"
  | "messaging"
  | "commerce"
  | "lead-management"
  | "outreach"
  | "pipeline"
  | "advertising"
  | "bidding"
  | "creative"
  | "seo-technical"
  | "keyword"
  | "local-seo"
  | "web-builder"
  | "testing"
  | "design";

export interface MCPToolDefinition {
  id: string;
  name: string;
  vertical: Vertical | "platform";
  category: MCPToolCategory;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  requiredPermissions: string[];
  romaLevelRequired: "L0" | "L1" | "L2" | "L3" | "L4";
  estimatedExecutionMs: number;
}

const SOCIAL_TOOLS: MCPToolDefinition[] = [
  {
    id: "social-content-generator",
    name: "Content Generator",
    vertical: "social",
    category: "content-creation",
    description: "Generate social media posts optimized for each platform",
    inputSchema: { platform: "string", topic: "string", tone: "string", language: "string", brandId: "number" },
    outputSchema: { content: "string", hashtags: "string[]", mediaRecommendations: "object" },
    requiredPermissions: ["content:write", "brand:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "social-hashtag-analyzer",
    name: "Hashtag Analyzer",
    vertical: "social",
    category: "research",
    description: "Analyze hashtag performance and suggest optimal hashtags",
    inputSchema: { hashtags: "string[]", platform: "string" },
    outputSchema: { performance: "object[]", recommended: "string[]", trending: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "social-scheduler",
    name: "Post Scheduler",
    vertical: "social",
    category: "scheduling",
    description: "Schedule posts across multiple platforms with optimal timing",
    inputSchema: { posts: "object[]", platforms: "string[]", timezone: "string" },
    outputSchema: { scheduledPosts: "object[]", optimalTimes: "object" },
    requiredPermissions: ["content:write", "schedule:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1500
  },
  {
    id: "social-engagement-tracker",
    name: "Engagement Tracker",
    vertical: "social",
    category: "analytics",
    description: "Track and analyze engagement metrics in real-time",
    inputSchema: { postIds: "string[]", platform: "string", dateRange: "object" },
    outputSchema: { metrics: "object", trends: "object[]", insights: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "social-comment-responder",
    name: "Comment Responder",
    vertical: "social",
    category: "engagement",
    description: "AI-powered comment response generation and management",
    inputSchema: { comments: "object[]", brandVoice: "string", responseType: "string" },
    outputSchema: { responses: "object[]", sentiment: "object" },
    requiredPermissions: ["engagement:write", "brand:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  },
  {
    id: "social-influencer-finder",
    name: "Influencer Finder",
    vertical: "social",
    category: "research",
    description: "Discover and analyze influencers by niche and audience",
    inputSchema: { niche: "string", platform: "string", followerRange: "object", location: "string" },
    outputSchema: { influencers: "object[]", matchScores: "number[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 5000
  },
  {
    id: "social-trend-detector",
    name: "Trend Detector",
    vertical: "social",
    category: "monitoring",
    description: "Detect emerging trends and viral content opportunities",
    inputSchema: { industry: "string", platforms: "string[]", keywords: "string[]" },
    outputSchema: { trends: "object[]", viralPotential: "number", recommendations: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "social-carousel-builder",
    name: "Carousel Builder",
    vertical: "social",
    category: "content-creation",
    description: "Create multi-slide carousel posts with cohesive design",
    inputSchema: { topic: "string", slideCount: "number", style: "string", brandAssets: "object" },
    outputSchema: { slides: "object[]", designTemplate: "string" },
    requiredPermissions: ["content:write", "design:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "social-story-generator",
    name: "Story Generator",
    vertical: "social",
    category: "content-creation",
    description: "Generate engaging stories for Instagram/Facebook",
    inputSchema: { theme: "string", duration: "number", includePolls: "boolean", brandId: "number" },
    outputSchema: { storyFrames: "object[]", interactiveElements: "object[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "social-reel-script-writer",
    name: "Reel Script Writer",
    vertical: "social",
    category: "content-creation",
    description: "Write scripts for short-form video content",
    inputSchema: { topic: "string", duration: "number", hooks: "string[]", cta: "string" },
    outputSchema: { script: "string", shotList: "object[]", musicSuggestions: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3500
  },
  {
    id: "social-competitor-monitor",
    name: "Competitor Monitor",
    vertical: "social",
    category: "monitoring",
    description: "Track competitor social media activity and performance",
    inputSchema: { competitors: "string[]", platforms: "string[]", metrics: "string[]" },
    outputSchema: { competitorData: "object[]", benchmarks: "object", gaps: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 6000
  },
  {
    id: "social-audience-analyzer",
    name: "Audience Analyzer",
    vertical: "social",
    category: "analytics",
    description: "Deep audience demographics and behavior analysis",
    inputSchema: { accountIds: "string[]", platform: "string" },
    outputSchema: { demographics: "object", behaviors: "object[]", interests: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4500
  },
  {
    id: "social-ugc-curator",
    name: "UGC Curator",
    vertical: "social",
    category: "content-creation",
    description: "Find and curate user-generated content",
    inputSchema: { brandMentions: "string[]", hashtags: "string[]", qualityThreshold: "number" },
    outputSchema: { ugcContent: "object[]", creatorInfo: "object[]", usageRights: "object" },
    requiredPermissions: ["content:read", "engagement:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "social-crisis-detector",
    name: "Crisis Detector",
    vertical: "social",
    category: "monitoring",
    description: "Detect potential PR crises and negative sentiment spikes",
    inputSchema: { brandId: "number", sensitivityLevel: "string" },
    outputSchema: { alerts: "object[]", severity: "string", recommendedActions: "string[]" },
    requiredPermissions: ["monitoring:read", "brand:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  },
  {
    id: "social-ab-tester",
    name: "A/B Tester",
    vertical: "social",
    category: "optimization",
    description: "Run A/B tests on social content variations",
    inputSchema: { variants: "object[]", testDuration: "number", successMetric: "string" },
    outputSchema: { results: "object", winner: "string", statisticalSignificance: "number" },
    requiredPermissions: ["analytics:read", "content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1000
  },
  {
    id: "social-viral-predictor",
    name: "Viral Predictor",
    vertical: "social",
    category: "analytics",
    description: "Predict viral potential of content before posting",
    inputSchema: { content: "object", platform: "string", targetAudience: "object" },
    outputSchema: { viralScore: "number", factors: "object[]", optimizations: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "social-cross-poster",
    name: "Cross Poster",
    vertical: "social",
    category: "automation",
    description: "Adapt and post content across multiple platforms",
    inputSchema: { content: "object", sourcePlatform: "string", targetPlatforms: "string[]" },
    outputSchema: { adaptedContent: "object[]", postIds: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "social-bio-optimizer",
    name: "Bio Optimizer",
    vertical: "social",
    category: "optimization",
    description: "Optimize social media profile bios for discoverability",
    inputSchema: { currentBio: "string", platform: "string", keywords: "string[]", cta: "string" },
    outputSchema: { optimizedBio: "string", seoScore: "number", suggestions: "string[]" },
    requiredPermissions: ["profile:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "social-link-in-bio-builder",
    name: "Link-in-Bio Builder",
    vertical: "social",
    category: "content-creation",
    description: "Create and manage link-in-bio landing pages",
    inputSchema: { links: "object[]", design: "object", brandId: "number" },
    outputSchema: { pageUrl: "string", analytics: "object" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "social-sentiment-analyzer",
    name: "Sentiment Analyzer",
    vertical: "social",
    category: "analytics",
    description: "Analyze sentiment across social mentions and comments",
    inputSchema: { content: "string[]", language: "string" },
    outputSchema: { sentiment: "object", emotions: "object[]", keyPhrases: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "social-report-generator",
    name: "Report Generator",
    vertical: "social",
    category: "analytics",
    description: "Generate comprehensive social media performance reports",
    inputSchema: { accountIds: "string[]", dateRange: "object", metrics: "string[]", format: "string" },
    outputSchema: { report: "object", visualizations: "object[]", insights: "string[]" },
    requiredPermissions: ["analytics:read", "report:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "social-calendar-manager",
    name: "Calendar Manager",
    vertical: "social",
    category: "scheduling",
    description: "Manage content calendar across all social platforms",
    inputSchema: { brandId: "number", dateRange: "object", view: "string" },
    outputSchema: { calendar: "object", conflicts: "object[]", gaps: "object[]" },
    requiredPermissions: ["schedule:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  }
];

const SEO_TOOLS: MCPToolDefinition[] = [
  {
    id: "seo-keyword-researcher",
    name: "Keyword Researcher",
    vertical: "seo",
    category: "keyword",
    description: "Research and analyze keywords with volume and difficulty",
    inputSchema: { seedKeywords: "string[]", location: "string", language: "string" },
    outputSchema: { keywords: "object[]", clusters: "object[]", opportunities: "object[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 5000
  },
  {
    id: "seo-content-optimizer",
    name: "Content Optimizer",
    vertical: "seo",
    category: "optimization",
    description: "Optimize content for target keywords and search intent",
    inputSchema: { content: "string", targetKeyword: "string", competitors: "string[]" },
    outputSchema: { optimizedContent: "string", score: "number", suggestions: "object[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "seo-technical-auditor",
    name: "Technical Auditor",
    vertical: "seo",
    category: "seo-technical",
    description: "Comprehensive technical SEO audit",
    inputSchema: { url: "string", depth: "number", checkTypes: "string[]" },
    outputSchema: { issues: "object[]", score: "number", prioritizedFixes: "object[]" },
    requiredPermissions: ["site:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 15000
  },
  {
    id: "seo-backlink-analyzer",
    name: "Backlink Analyzer",
    vertical: "seo",
    category: "analytics",
    description: "Analyze backlink profile and identify opportunities",
    inputSchema: { domain: "string", competitors: "string[]" },
    outputSchema: { backlinks: "object[]", domainAuthority: "number", opportunities: "object[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 8000
  },
  {
    id: "seo-rank-tracker",
    name: "Rank Tracker",
    vertical: "seo",
    category: "monitoring",
    description: "Track keyword rankings across search engines",
    inputSchema: { keywords: "string[]", domain: "string", locations: "string[]" },
    outputSchema: { rankings: "object[]", changes: "object[]", trends: "object" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 6000
  },
  {
    id: "seo-schema-generator",
    name: "Schema Generator",
    vertical: "seo",
    category: "seo-technical",
    description: "Generate structured data/schema markup",
    inputSchema: { pageType: "string", content: "object", organization: "object" },
    outputSchema: { schema: "object", validationStatus: "boolean", warnings: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "seo-meta-generator",
    name: "Meta Tag Generator",
    vertical: "seo",
    category: "content-creation",
    description: "Generate optimized meta titles and descriptions",
    inputSchema: { pageContent: "string", targetKeyword: "string", brandName: "string" },
    outputSchema: { title: "string", description: "string", ogTags: "object" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 1500
  },
  {
    id: "seo-competitor-analyzer",
    name: "Competitor Analyzer",
    vertical: "seo",
    category: "research",
    description: "Analyze competitor SEO strategies and gaps",
    inputSchema: { competitors: "string[]", analysisType: "string[]" },
    outputSchema: { competitorData: "object[]", gaps: "object[]", opportunities: "object[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 10000
  },
  {
    id: "seo-internal-link-mapper",
    name: "Internal Link Mapper",
    vertical: "seo",
    category: "seo-technical",
    description: "Map and optimize internal linking structure",
    inputSchema: { domain: "string", priorityPages: "string[]" },
    outputSchema: { linkMap: "object", orphanPages: "string[]", suggestions: "object[]" },
    requiredPermissions: ["site:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 12000
  },
  {
    id: "seo-page-speed-analyzer",
    name: "Page Speed Analyzer",
    vertical: "seo",
    category: "seo-technical",
    description: "Analyze and optimize page loading speed",
    inputSchema: { url: "string", device: "string" },
    outputSchema: { metrics: "object", issues: "object[]", recommendations: "object[]" },
    requiredPermissions: ["site:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 8000
  },
  {
    id: "geo-local-optimizer",
    name: "Local SEO Optimizer",
    vertical: "seo",
    category: "local-seo",
    description: "Optimize for local search and Google Business Profile",
    inputSchema: { businessInfo: "object", locations: "object[]", categories: "string[]" },
    outputSchema: { optimizations: "object[]", citationOpportunities: "object[]", reviews: "object" },
    requiredPermissions: ["local:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "geo-citation-builder",
    name: "Citation Builder",
    vertical: "seo",
    category: "local-seo",
    description: "Build and manage local business citations",
    inputSchema: { businessInfo: "object", targetDirectories: "string[]" },
    outputSchema: { citations: "object[]", pendingSubmissions: "object[]", errors: "object[]" },
    requiredPermissions: ["local:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "seo-content-brief-generator",
    name: "Content Brief Generator",
    vertical: "seo",
    category: "content-creation",
    description: "Generate SEO-optimized content briefs",
    inputSchema: { targetKeyword: "string", contentType: "string", competitors: "string[]" },
    outputSchema: { brief: "object", outline: "object[]", references: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "seo-serp-analyzer",
    name: "SERP Analyzer",
    vertical: "seo",
    category: "research",
    description: "Analyze search engine results pages for keywords",
    inputSchema: { keywords: "string[]", location: "string", device: "string" },
    outputSchema: { serpData: "object[]", features: "string[]", opportunities: "object[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "seo-sitemap-generator",
    name: "Sitemap Generator",
    vertical: "seo",
    category: "seo-technical",
    description: "Generate and optimize XML sitemaps",
    inputSchema: { domain: "string", pageTypes: "string[]", priority: "object" },
    outputSchema: { sitemap: "string", stats: "object", warnings: "string[]" },
    requiredPermissions: ["site:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 5000
  },
  {
    id: "seo-robots-optimizer",
    name: "Robots.txt Optimizer",
    vertical: "seo",
    category: "seo-technical",
    description: "Optimize robots.txt for search engine crawling",
    inputSchema: { currentRobots: "string", crawlPriorities: "object" },
    outputSchema: { optimizedRobots: "string", recommendations: "string[]" },
    requiredPermissions: ["site:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 1000
  },
  {
    id: "seo-cannibalization-detector",
    name: "Cannibalization Detector",
    vertical: "seo",
    category: "analytics",
    description: "Detect keyword cannibalization issues",
    inputSchema: { domain: "string", keywords: "string[]" },
    outputSchema: { cannibalizationIssues: "object[]", mergeRecommendations: "object[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 7000
  },
  {
    id: "seo-featured-snippet-optimizer",
    name: "Featured Snippet Optimizer",
    vertical: "seo",
    category: "optimization",
    description: "Optimize content for featured snippets",
    inputSchema: { content: "string", targetKeyword: "string", snippetType: "string" },
    outputSchema: { optimizedContent: "string", snippetPotential: "number", formatting: "object" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "seo-image-optimizer",
    name: "Image SEO Optimizer",
    vertical: "seo",
    category: "optimization",
    description: "Optimize images for search engines",
    inputSchema: { images: "object[]", keywords: "string[]" },
    outputSchema: { optimizedImages: "object[]", altTexts: "string[]", compressionStats: "object" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  }
];

const WEB_TOOLS: MCPToolDefinition[] = [
  {
    id: "web-page-builder",
    name: "Page Builder",
    vertical: "web",
    category: "web-builder",
    description: "AI-powered landing page and website builder",
    inputSchema: { pageType: "string", content: "object", design: "object", brandId: "number" },
    outputSchema: { html: "string", css: "string", components: "object[]" },
    requiredPermissions: ["web:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 10000
  },
  {
    id: "web-aura-integration",
    name: "Aura.build Integration",
    vertical: "web",
    category: "web-builder",
    description: "Generate websites using Aura.build API",
    inputSchema: { prompt: "string", style: "string", pages: "string[]" },
    outputSchema: { projectUrl: "string", previewUrl: "string", components: "object[]" },
    requiredPermissions: ["web:write", "integration:aura"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 30000
  },
  {
    id: "web-image-generator",
    name: "Nano Banana Pro Image Generator",
    vertical: "web",
    category: "generation",
    description: "Generate images using Nano Banana Pro AI",
    inputSchema: { prompt: "string", style: "string", dimensions: "object", count: "number" },
    outputSchema: { images: "object[]", metadata: "object" },
    requiredPermissions: ["content:write", "integration:nanoBanana"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 15000
  },
  {
    id: "web-ab-test-manager",
    name: "A/B Test Manager",
    vertical: "web",
    category: "testing",
    description: "Create and manage website A/B tests",
    inputSchema: { pageUrl: "string", variants: "object[]", goals: "string[]", duration: "number" },
    outputSchema: { testId: "string", trackingCode: "string", variants: "object[]" },
    requiredPermissions: ["web:write", "analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "web-heatmap-analyzer",
    name: "Heatmap Analyzer",
    vertical: "web",
    category: "analytics",
    description: "Analyze user behavior heatmaps",
    inputSchema: { pageUrl: "string", dateRange: "object", deviceTypes: "string[]" },
    outputSchema: { heatmapData: "object", clickData: "object[]", scrollData: "object" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 5000
  },
  {
    id: "web-form-builder",
    name: "Form Builder",
    vertical: "web",
    category: "web-builder",
    description: "Build optimized lead capture forms",
    inputSchema: { fields: "object[]", design: "object", validation: "object", integrations: "string[]" },
    outputSchema: { formHtml: "string", formJs: "string", webhookConfig: "object" },
    requiredPermissions: ["web:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "web-popup-creator",
    name: "Popup Creator",
    vertical: "web",
    category: "web-builder",
    description: "Create conversion-optimized popups",
    inputSchema: { popupType: "string", content: "object", triggers: "object[]", design: "object" },
    outputSchema: { popupCode: "string", triggerScript: "string" },
    requiredPermissions: ["web:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "web-personalization-engine",
    name: "Personalization Engine",
    vertical: "web",
    category: "optimization",
    description: "Personalize website content based on visitor data",
    inputSchema: { segments: "object[]", contentVariants: "object[]", rules: "object[]" },
    outputSchema: { personalizationConfig: "object", trackingPixel: "string" },
    requiredPermissions: ["web:write", "analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "web-chatbot-builder",
    name: "Chatbot Builder",
    vertical: "web",
    category: "automation",
    description: "Build AI-powered website chatbots",
    inputSchema: { flows: "object[]", personality: "object", integrations: "string[]" },
    outputSchema: { chatbotConfig: "object", embedCode: "string" },
    requiredPermissions: ["web:write", "ai:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "web-cta-optimizer",
    name: "CTA Optimizer",
    vertical: "web",
    category: "optimization",
    description: "Optimize call-to-action buttons and elements",
    inputSchema: { currentCtas: "object[]", goals: "string[]", audienceData: "object" },
    outputSchema: { optimizedCtas: "object[]", testVariants: "object[]" },
    requiredPermissions: ["web:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "web-accessibility-checker",
    name: "Accessibility Checker",
    vertical: "web",
    category: "testing",
    description: "Check and fix accessibility issues",
    inputSchema: { url: "string", standard: "string" },
    outputSchema: { issues: "object[]", score: "number", fixes: "object[]" },
    requiredPermissions: ["site:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 8000
  },
  {
    id: "web-design-system-generator",
    name: "Design System Generator",
    vertical: "web",
    category: "design",
    description: "Generate consistent design systems from brand assets",
    inputSchema: { brandColors: "string[]", typography: "object", spacing: "object" },
    outputSchema: { designTokens: "object", cssVariables: "string", components: "object[]" },
    requiredPermissions: ["design:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "web-copy-generator",
    name: "Web Copy Generator",
    vertical: "web",
    category: "content-creation",
    description: "Generate conversion-focused website copy",
    inputSchema: { pageType: "string", productInfo: "object", tone: "string", keywords: "string[]" },
    outputSchema: { headline: "string", subheadlines: "string[]", bodyCopy: "string", ctas: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "web-analytics-dashboard",
    name: "Analytics Dashboard",
    vertical: "web",
    category: "analytics",
    description: "Real-time website analytics dashboard",
    inputSchema: { domain: "string", dateRange: "object", metrics: "string[]" },
    outputSchema: { metrics: "object", trends: "object[]", topPages: "object[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "web-conversion-tracker",
    name: "Conversion Tracker",
    vertical: "web",
    category: "analytics",
    description: "Track and analyze website conversions",
    inputSchema: { goals: "object[]", funnels: "object[]", dateRange: "object" },
    outputSchema: { conversions: "object", funnelData: "object[]", dropoffs: "object[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  }
];

const SALES_TOOLS: MCPToolDefinition[] = [
  {
    id: "sales-lead-enricher",
    name: "Lead Enricher",
    vertical: "sales",
    category: "lead-management",
    description: "Enrich lead data with company and contact information",
    inputSchema: { leads: "object[]", enrichmentFields: "string[]" },
    outputSchema: { enrichedLeads: "object[]", matchRate: "number" },
    requiredPermissions: ["leads:write", "integration:clearbit"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "sales-lead-scorer",
    name: "Lead Scorer",
    vertical: "sales",
    category: "lead-management",
    description: "AI-powered lead scoring and prioritization",
    inputSchema: { leads: "object[]", scoringModel: "string", customFactors: "object[]" },
    outputSchema: { scoredLeads: "object[]", insights: "object[]" },
    requiredPermissions: ["leads:read", "ai:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "sales-email-generator",
    name: "Email Generator",
    vertical: "sales",
    category: "outreach",
    description: "Generate personalized sales emails",
    inputSchema: { leadData: "object", emailType: "string", tone: "string", cta: "string" },
    outputSchema: { subject: "string", body: "string", followUpSequence: "object[]" },
    requiredPermissions: ["outreach:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "sales-sequence-builder",
    name: "Sequence Builder",
    vertical: "sales",
    category: "outreach",
    description: "Build multi-touch outreach sequences",
    inputSchema: { sequenceType: "string", steps: "object[]", delays: "number[]" },
    outputSchema: { sequence: "object", automationConfig: "object" },
    requiredPermissions: ["outreach:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "sales-pipeline-manager",
    name: "Pipeline Manager",
    vertical: "sales",
    category: "pipeline",
    description: "Manage and optimize sales pipeline",
    inputSchema: { deals: "object[]", stages: "string[]", filters: "object" },
    outputSchema: { pipeline: "object", velocity: "object", forecasts: "object" },
    requiredPermissions: ["pipeline:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2500
  },
  {
    id: "sales-call-script-generator",
    name: "Call Script Generator",
    vertical: "sales",
    category: "outreach",
    description: "Generate dynamic sales call scripts",
    inputSchema: { leadProfile: "object", productInfo: "object", objections: "string[]" },
    outputSchema: { script: "object", objectionHandlers: "object[]", closingTechniques: "string[]" },
    requiredPermissions: ["outreach:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3500
  },
  {
    id: "sales-proposal-generator",
    name: "Proposal Generator",
    vertical: "sales",
    category: "content-creation",
    description: "Generate customized sales proposals",
    inputSchema: { dealInfo: "object", templateId: "string", customizations: "object" },
    outputSchema: { proposal: "object", pdfUrl: "string" },
    requiredPermissions: ["content:write", "deals:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "sales-competitor-intel",
    name: "Competitor Intelligence",
    vertical: "sales",
    category: "research",
    description: "Gather competitive intelligence for sales",
    inputSchema: { competitors: "string[]", dealContext: "object" },
    outputSchema: { competitorData: "object[]", battleCards: "object[]", differentiators: "string[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "sales-meeting-scheduler",
    name: "Meeting Scheduler",
    vertical: "sales",
    category: "automation",
    description: "AI-powered meeting scheduling and calendar management",
    inputSchema: { participants: "string[]", duration: "number", preferences: "object" },
    outputSchema: { scheduledMeeting: "object", calendarLink: "string" },
    requiredPermissions: ["calendar:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  },
  {
    id: "sales-follow-up-automator",
    name: "Follow-up Automator",
    vertical: "sales",
    category: "automation",
    description: "Automate follow-up communications",
    inputSchema: { leadId: "string", triggerEvents: "string[]", messages: "object[]" },
    outputSchema: { automationConfig: "object", scheduledMessages: "object[]" },
    requiredPermissions: ["outreach:write", "automation:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2500
  },
  {
    id: "sales-crm-sync",
    name: "CRM Sync",
    vertical: "sales",
    category: "integration",
    description: "Sync data with external CRM systems",
    inputSchema: { crmType: "string", syncDirection: "string", entities: "string[]" },
    outputSchema: { syncStatus: "object", conflicts: "object[]", synced: "number" },
    requiredPermissions: ["integration:crm"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 10000
  },
  {
    id: "sales-deal-analyzer",
    name: "Deal Analyzer",
    vertical: "sales",
    category: "analytics",
    description: "Analyze deal health and win probability",
    inputSchema: { dealId: "string", includeHistory: "boolean" },
    outputSchema: { winProbability: "number", riskFactors: "object[]", recommendations: "string[]" },
    requiredPermissions: ["deals:read", "ai:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "sales-forecast-engine",
    name: "Forecast Engine",
    vertical: "sales",
    category: "analytics",
    description: "AI-powered sales forecasting",
    inputSchema: { pipeline: "object", historicalData: "object", period: "string" },
    outputSchema: { forecast: "object", scenarios: "object[]", confidence: "number" },
    requiredPermissions: ["analytics:read", "ai:use"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 6000
  },
  {
    id: "sales-territory-planner",
    name: "Territory Planner",
    vertical: "sales",
    category: "optimization",
    description: "Optimize sales territory assignments",
    inputSchema: { accounts: "object[]", reps: "object[]", constraints: "object" },
    outputSchema: { territories: "object[]", assignments: "object[]", optimizationScore: "number" },
    requiredPermissions: ["accounts:read", "team:read"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 8000
  },
  {
    id: "sales-objection-handler",
    name: "Objection Handler",
    vertical: "sales",
    category: "automation",
    description: "AI-powered objection handling suggestions",
    inputSchema: { objection: "string", context: "object", productInfo: "object" },
    outputSchema: { responses: "string[]", techniques: "object[]", examples: "string[]" },
    requiredPermissions: ["ai:use"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "sales-quote-generator",
    name: "Quote Generator",
    vertical: "sales",
    category: "content-creation",
    description: "Generate customized sales quotes",
    inputSchema: { products: "object[]", pricing: "object", discounts: "object[]", terms: "object" },
    outputSchema: { quote: "object", pdfUrl: "string", validity: "object" },
    requiredPermissions: ["pricing:read", "content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "sales-contract-generator",
    name: "Contract Generator",
    vertical: "sales",
    category: "content-creation",
    description: "Generate sales contracts from templates",
    inputSchema: { dealInfo: "object", templateId: "string", customTerms: "object[]" },
    outputSchema: { contract: "object", pdfUrl: "string", signatureFields: "object[]" },
    requiredPermissions: ["legal:read", "content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "sales-activity-logger",
    name: "Activity Logger",
    vertical: "sales",
    category: "automation",
    description: "Auto-log sales activities from multiple sources",
    inputSchema: { sources: "string[]", leadId: "string", dateRange: "object" },
    outputSchema: { activities: "object[]", summary: "object" },
    requiredPermissions: ["activities:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "sales-coaching-assistant",
    name: "Coaching Assistant",
    vertical: "sales",
    category: "optimization",
    description: "AI coaching for sales performance improvement",
    inputSchema: { repId: "string", metrics: "object", callRecordings: "string[]" },
    outputSchema: { insights: "object[]", recommendations: "string[]", trainingPaths: "object[]" },
    requiredPermissions: ["team:read", "ai:use"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 10000
  },
  {
    id: "sales-linkedin-connector",
    name: "LinkedIn Connector",
    vertical: "sales",
    category: "integration",
    description: "Connect and sync with LinkedIn Sales Navigator",
    inputSchema: { action: "string", targetProfiles: "string[]" },
    outputSchema: { results: "object[]", syncedContacts: "number" },
    requiredPermissions: ["integration:linkedin"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  }
];

const WHATSAPP_TOOLS: MCPToolDefinition[] = [
  {
    id: "whatsapp-flow-builder",
    name: "Flow Builder",
    vertical: "whatsapp",
    category: "automation",
    description: "Build interactive WhatsApp conversation flows",
    inputSchema: { flowName: "string", nodes: "object[]", triggers: "object[]" },
    outputSchema: { flow: "object", previewUrl: "string" },
    requiredPermissions: ["whatsapp:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "whatsapp-template-creator",
    name: "Template Creator",
    vertical: "whatsapp",
    category: "content-creation",
    description: "Create WhatsApp message templates for approval",
    inputSchema: { templateType: "string", content: "object", buttons: "object[]", language: "string" },
    outputSchema: { template: "object", submissionStatus: "string" },
    requiredPermissions: ["whatsapp:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "whatsapp-broadcast-sender",
    name: "Broadcast Sender",
    vertical: "whatsapp",
    category: "messaging",
    description: "Send broadcast messages to segmented audiences",
    inputSchema: { templateId: "string", audience: "object[]", variables: "object", schedule: "object" },
    outputSchema: { broadcastId: "string", deliveryStats: "object" },
    requiredPermissions: ["whatsapp:send", "audience:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "whatsapp-chatbot-builder",
    name: "Chatbot Builder",
    vertical: "whatsapp",
    category: "automation",
    description: "Build AI-powered WhatsApp chatbots",
    inputSchema: { personality: "object", intents: "object[]", fallbackBehavior: "object" },
    outputSchema: { botConfig: "object", webhookUrl: "string" },
    requiredPermissions: ["whatsapp:write", "ai:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "whatsapp-catalog-manager",
    name: "Catalog Manager",
    vertical: "whatsapp",
    category: "commerce",
    description: "Manage WhatsApp Business product catalogs",
    inputSchema: { products: "object[]", categories: "string[]" },
    outputSchema: { catalog: "object", productIds: "string[]" },
    requiredPermissions: ["whatsapp:write", "commerce:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "whatsapp-order-manager",
    name: "Order Manager",
    vertical: "whatsapp",
    category: "commerce",
    description: "Process and manage orders from WhatsApp",
    inputSchema: { orderId: "string", action: "string", updates: "object" },
    outputSchema: { order: "object", notifications: "object[]" },
    requiredPermissions: ["commerce:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2500
  },
  {
    id: "whatsapp-audience-segmenter",
    name: "Audience Segmenter",
    vertical: "whatsapp",
    category: "lead-management",
    description: "Segment WhatsApp contacts for targeted messaging",
    inputSchema: { contacts: "object[]", segmentRules: "object[]" },
    outputSchema: { segments: "object[]", contactCounts: "object" },
    requiredPermissions: ["audience:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "whatsapp-analytics-dashboard",
    name: "Analytics Dashboard",
    vertical: "whatsapp",
    category: "analytics",
    description: "WhatsApp messaging analytics and insights",
    inputSchema: { dateRange: "object", metrics: "string[]" },
    outputSchema: { metrics: "object", trends: "object[]", topPerformers: "object[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "whatsapp-quick-reply-manager",
    name: "Quick Reply Manager",
    vertical: "whatsapp",
    category: "automation",
    description: "Manage quick reply templates for fast responses",
    inputSchema: { replies: "object[]", categories: "string[]" },
    outputSchema: { quickReplies: "object[]" },
    requiredPermissions: ["whatsapp:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 1500
  },
  {
    id: "whatsapp-opt-in-manager",
    name: "Opt-in Manager",
    vertical: "whatsapp",
    category: "lead-management",
    description: "Manage contact opt-ins and compliance",
    inputSchema: { contacts: "object[]", optInType: "string" },
    outputSchema: { optInStatus: "object[]", complianceReport: "object" },
    requiredPermissions: ["audience:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  },
  {
    id: "whatsapp-payment-collector",
    name: "Payment Collector",
    vertical: "whatsapp",
    category: "commerce",
    description: "Collect payments via WhatsApp Pay",
    inputSchema: { amount: "number", currency: "string", orderId: "string", customerId: "string" },
    outputSchema: { paymentLink: "string", transactionId: "string" },
    requiredPermissions: ["commerce:manage", "payments:process"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "whatsapp-support-router",
    name: "Support Router",
    vertical: "whatsapp",
    category: "automation",
    description: "Route support conversations to appropriate agents",
    inputSchema: { conversation: "object", routingRules: "object[]" },
    outputSchema: { assignedAgent: "string", priority: "string" },
    requiredPermissions: ["support:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1500
  },
  {
    id: "whatsapp-csat-collector",
    name: "CSAT Collector",
    vertical: "whatsapp",
    category: "analytics",
    description: "Collect customer satisfaction feedback",
    inputSchema: { conversationId: "string", surveyType: "string" },
    outputSchema: { survey: "object", responseTracking: "object" },
    requiredPermissions: ["analytics:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "whatsapp-media-sender",
    name: "Media Sender",
    vertical: "whatsapp",
    category: "messaging",
    description: "Send media files via WhatsApp",
    inputSchema: { mediaType: "string", mediaUrl: "string", recipients: "string[]", caption: "string" },
    outputSchema: { deliveryStatus: "object[]" },
    requiredPermissions: ["whatsapp:send"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  }
];

const LINKEDIN_TOOLS: MCPToolDefinition[] = [
  {
    id: "linkedin-profile-optimizer",
    name: "Profile Optimizer",
    vertical: "linkedin",
    category: "optimization",
    description: "Optimize LinkedIn profiles for visibility",
    inputSchema: { currentProfile: "object", targetKeywords: "string[]", industry: "string" },
    outputSchema: { optimizedProfile: "object", ssiScore: "number", recommendations: "string[]" },
    requiredPermissions: ["linkedin:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "linkedin-post-generator",
    name: "Post Generator",
    vertical: "linkedin",
    category: "content-creation",
    description: "Generate engaging LinkedIn posts",
    inputSchema: { topic: "string", format: "string", tone: "string", cta: "string" },
    outputSchema: { post: "string", hashtags: "string[]", bestTimes: "object[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "linkedin-article-writer",
    name: "Article Writer",
    vertical: "linkedin",
    category: "content-creation",
    description: "Write long-form LinkedIn articles",
    inputSchema: { topic: "string", outline: "object", keywords: "string[]", length: "number" },
    outputSchema: { article: "string", seoScore: "number", images: "object[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "linkedin-connection-finder",
    name: "Connection Finder",
    vertical: "linkedin",
    category: "research",
    description: "Find and qualify potential connections",
    inputSchema: { criteria: "object", industry: "string", location: "string", limit: "number" },
    outputSchema: { prospects: "object[]", matchScores: "number[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 6000
  },
  {
    id: "linkedin-message-generator",
    name: "Message Generator",
    vertical: "linkedin",
    category: "outreach",
    description: "Generate personalized connection messages",
    inputSchema: { recipientProfile: "object", messageType: "string", personalizations: "object" },
    outputSchema: { message: "string", variants: "string[]" },
    requiredPermissions: ["outreach:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "linkedin-outreach-sequencer",
    name: "Outreach Sequencer",
    vertical: "linkedin",
    category: "outreach",
    description: "Create multi-step LinkedIn outreach sequences",
    inputSchema: { steps: "object[]", delays: "number[]", conditions: "object[]" },
    outputSchema: { sequence: "object", automationConfig: "object" },
    requiredPermissions: ["outreach:write", "automation:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3500
  },
  {
    id: "linkedin-engagement-booster",
    name: "Engagement Booster",
    vertical: "linkedin",
    category: "engagement",
    description: "Boost engagement on LinkedIn posts",
    inputSchema: { postId: "string", engagementType: "string[]" },
    outputSchema: { actions: "object[]", engagementMetrics: "object" },
    requiredPermissions: ["engagement:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  },
  {
    id: "linkedin-company-page-manager",
    name: "Company Page Manager",
    vertical: "linkedin",
    category: "content-creation",
    description: "Manage LinkedIn company page content",
    inputSchema: { pageId: "string", content: "object", schedule: "object" },
    outputSchema: { post: "object", analytics: "object" },
    requiredPermissions: ["company:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "linkedin-analytics-tracker",
    name: "Analytics Tracker",
    vertical: "linkedin",
    category: "analytics",
    description: "Track LinkedIn performance metrics",
    inputSchema: { profileId: "string", dateRange: "object", metrics: "string[]" },
    outputSchema: { metrics: "object", trends: "object[]", benchmarks: "object" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "linkedin-lead-extractor",
    name: "Lead Extractor",
    vertical: "linkedin",
    category: "lead-management",
    description: "Extract and qualify leads from LinkedIn",
    inputSchema: { searchCriteria: "object", qualificationRules: "object[]" },
    outputSchema: { leads: "object[]", qualificationScores: "number[]" },
    requiredPermissions: ["leads:write", "research:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "linkedin-comment-writer",
    name: "Comment Writer",
    vertical: "linkedin",
    category: "engagement",
    description: "Generate thoughtful comments for engagement",
    inputSchema: { postContent: "string", commentType: "string", personalBrand: "object" },
    outputSchema: { comment: "string", variants: "string[]" },
    requiredPermissions: ["engagement:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "linkedin-carousel-creator",
    name: "Carousel Creator",
    vertical: "linkedin",
    category: "content-creation",
    description: "Create LinkedIn carousel/document posts",
    inputSchema: { topic: "string", slides: "object[]", design: "object" },
    outputSchema: { carouselPdf: "string", previewImages: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 7000
  },
  {
    id: "linkedin-hashtag-researcher",
    name: "Hashtag Researcher",
    vertical: "linkedin",
    category: "research",
    description: "Research effective LinkedIn hashtags",
    inputSchema: { topic: "string", industry: "string" },
    outputSchema: { hashtags: "object[]", trending: "string[]", recommended: "string[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "linkedin-newsletter-manager",
    name: "Newsletter Manager",
    vertical: "linkedin",
    category: "content-creation",
    description: "Create and manage LinkedIn newsletters",
    inputSchema: { newsletterInfo: "object", content: "string", schedule: "object" },
    outputSchema: { newsletter: "object", subscriberStats: "object" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "linkedin-recommendation-writer",
    name: "Recommendation Writer",
    vertical: "linkedin",
    category: "content-creation",
    description: "Write professional recommendations",
    inputSchema: { recipientInfo: "object", relationship: "string", highlights: "string[]" },
    outputSchema: { recommendation: "string" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "linkedin-ssi-analyzer",
    name: "SSI Analyzer",
    vertical: "linkedin",
    category: "analytics",
    description: "Analyze Social Selling Index and improve",
    inputSchema: { profileId: "string" },
    outputSchema: { ssiScore: "object", improvements: "object[]", benchmarks: "object" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "linkedin-event-promoter",
    name: "Event Promoter",
    vertical: "linkedin",
    category: "content-creation",
    description: "Create and promote LinkedIn events",
    inputSchema: { eventInfo: "object", promotionPlan: "object" },
    outputSchema: { event: "object", promotionalContent: "object[]" },
    requiredPermissions: ["events:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  }
];

const PERFORMANCE_TOOLS: MCPToolDefinition[] = [
  {
    id: "perf-google-ads-manager",
    name: "Google Ads Manager",
    vertical: "performance",
    category: "advertising",
    description: "Manage Google Ads campaigns",
    inputSchema: { accountId: "string", campaigns: "object[]", budget: "object" },
    outputSchema: { campaigns: "object[]", performance: "object" },
    requiredPermissions: ["ads:manage", "integration:google"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "perf-meta-ads-manager",
    name: "Meta Ads Manager",
    vertical: "performance",
    category: "advertising",
    description: "Manage Facebook/Instagram ads",
    inputSchema: { accountId: "string", campaigns: "object[]", targeting: "object" },
    outputSchema: { campaigns: "object[]", performance: "object" },
    requiredPermissions: ["ads:manage", "integration:meta"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "perf-creative-generator",
    name: "Ad Creative Generator",
    vertical: "performance",
    category: "creative",
    description: "Generate ad creatives with AI",
    inputSchema: { adType: "string", productInfo: "object", style: "string", sizes: "object[]" },
    outputSchema: { creatives: "object[]", copyVariants: "string[]" },
    requiredPermissions: ["content:write", "ai:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 10000
  },
  {
    id: "perf-copy-writer",
    name: "Ad Copy Writer",
    vertical: "performance",
    category: "content-creation",
    description: "Write high-converting ad copy",
    inputSchema: { productInfo: "object", targetAudience: "object", platform: "string", cta: "string" },
    outputSchema: { headlines: "string[]", descriptions: "string[]", ctas: "string[]" },
    requiredPermissions: ["content:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "perf-audience-builder",
    name: "Audience Builder",
    vertical: "performance",
    category: "lead-management",
    description: "Build and manage ad audiences",
    inputSchema: { platform: "string", segmentRules: "object[]", lookalikes: "object" },
    outputSchema: { audiences: "object[]", estimatedReach: "number" },
    requiredPermissions: ["audience:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "perf-bid-optimizer",
    name: "Bid Optimizer",
    vertical: "performance",
    category: "bidding",
    description: "AI-powered bid optimization",
    inputSchema: { campaigns: "object[]", goals: "object", constraints: "object" },
    outputSchema: { bidAdjustments: "object[]", projectedImpact: "object" },
    requiredPermissions: ["ads:manage", "ai:use"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 6000
  },
  {
    id: "perf-budget-allocator",
    name: "Budget Allocator",
    vertical: "performance",
    category: "optimization",
    description: "Optimize budget allocation across campaigns",
    inputSchema: { totalBudget: "number", campaigns: "object[]", goals: "object" },
    outputSchema: { allocation: "object[]", projectedResults: "object" },
    requiredPermissions: ["ads:manage"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 5000
  },
  {
    id: "perf-landing-page-builder",
    name: "Landing Page Builder",
    vertical: "performance",
    category: "web-builder",
    description: "Build conversion-optimized landing pages",
    inputSchema: { campaign: "object", template: "string", content: "object" },
    outputSchema: { pageUrl: "string", trackingCode: "string" },
    requiredPermissions: ["web:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "perf-conversion-tracker",
    name: "Conversion Tracker",
    vertical: "performance",
    category: "analytics",
    description: "Track and attribute conversions",
    inputSchema: { conversionEvents: "object[]", attributionModel: "string" },
    outputSchema: { conversions: "object[]", attribution: "object", insights: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "perf-roas-analyzer",
    name: "ROAS Analyzer",
    vertical: "performance",
    category: "analytics",
    description: "Analyze return on ad spend",
    inputSchema: { campaigns: "object[]", dateRange: "object", costData: "object" },
    outputSchema: { roas: "object", breakdown: "object[]", recommendations: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "perf-competitor-spy",
    name: "Competitor Spy",
    vertical: "performance",
    category: "research",
    description: "Analyze competitor ad strategies",
    inputSchema: { competitors: "string[]", platforms: "string[]" },
    outputSchema: { competitorAds: "object[]", strategies: "object[]", gaps: "string[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "perf-ab-test-manager",
    name: "Ad A/B Test Manager",
    vertical: "performance",
    category: "testing",
    description: "Manage ad A/B testing",
    inputSchema: { adVariants: "object[]", testConfig: "object", successMetric: "string" },
    outputSchema: { testId: "string", results: "object", winner: "string" },
    requiredPermissions: ["ads:manage", "analytics:read"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "perf-retargeting-manager",
    name: "Retargeting Manager",
    vertical: "performance",
    category: "advertising",
    description: "Set up and manage retargeting campaigns",
    inputSchema: { audienceRules: "object[]", creativePlan: "object", budget: "number" },
    outputSchema: { campaign: "object", pixelCode: "string" },
    requiredPermissions: ["ads:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 4000
  },
  {
    id: "perf-shopping-feed-manager",
    name: "Shopping Feed Manager",
    vertical: "performance",
    category: "commerce",
    description: "Manage product feeds for shopping ads",
    inputSchema: { products: "object[]", platform: "string", optimizations: "object" },
    outputSchema: { feed: "object", errors: "object[]", optimizations: "object[]" },
    requiredPermissions: ["commerce:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 6000
  },
  {
    id: "perf-pmax-optimizer",
    name: "Performance Max Optimizer",
    vertical: "performance",
    category: "optimization",
    description: "Optimize Google Performance Max campaigns",
    inputSchema: { campaign: "object", assets: "object[]", signals: "object" },
    outputSchema: { optimizations: "object[]", assetPerformance: "object" },
    requiredPermissions: ["ads:manage", "integration:google"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 7000
  },
  {
    id: "perf-report-generator",
    name: "Performance Report Generator",
    vertical: "performance",
    category: "analytics",
    description: "Generate comprehensive performance reports",
    inputSchema: { campaigns: "object[]", dateRange: "object", metrics: "string[]", format: "string" },
    outputSchema: { report: "object", visualizations: "object[]" },
    requiredPermissions: ["analytics:read", "report:write"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 10000
  },
  {
    id: "perf-keyword-planner",
    name: "PPC Keyword Planner",
    vertical: "performance",
    category: "keyword",
    description: "Plan keywords for PPC campaigns",
    inputSchema: { seedKeywords: "string[]", budget: "number", location: "string" },
    outputSchema: { keywords: "object[]", estimates: "object", negatives: "string[]" },
    requiredPermissions: ["research:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 5000
  },
  {
    id: "perf-attribution-modeler",
    name: "Attribution Modeler",
    vertical: "performance",
    category: "analytics",
    description: "Multi-touch attribution modeling",
    inputSchema: { touchpoints: "object[]", modelType: "string" },
    outputSchema: { attribution: "object", channelContribution: "object[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 8000
  }
];

const PLATFORM_TOOLS: MCPToolDefinition[] = [
  {
    id: "platform-sarvam-stt",
    name: "Sarvam Speech-to-Text",
    vertical: "platform",
    category: "integration",
    description: "Convert speech to text in 12 Indian languages",
    inputSchema: { audioUrl: "string", language: "string", speakerId: "string" },
    outputSchema: { text: "string", confidence: "number", segments: "object[]" },
    requiredPermissions: ["voice:use", "integration:sarvam"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 5000
  },
  {
    id: "platform-sarvam-tts",
    name: "Sarvam Text-to-Speech",
    vertical: "platform",
    category: "integration",
    description: "Convert text to speech in 12 Indian languages",
    inputSchema: { text: "string", language: "string", voice: "string", speed: "number" },
    outputSchema: { audioUrl: "string", duration: "number" },
    requiredPermissions: ["voice:use", "integration:sarvam"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 4000
  },
  {
    id: "platform-translator",
    name: "Multi-language Translator",
    vertical: "platform",
    category: "content-creation",
    description: "Translate content between 12 Indian languages + English",
    inputSchema: { text: "string", sourceLanguage: "string", targetLanguage: "string" },
    outputSchema: { translatedText: "string", confidence: "number" },
    requiredPermissions: ["content:write", "integration:sarvam"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "platform-brand-context-manager",
    name: "Brand Context Manager",
    vertical: "platform",
    category: "integration",
    description: "Manage brand guidelines and context across agents",
    inputSchema: { brandId: "number", contextType: "string", data: "object" },
    outputSchema: { context: "object", version: "number" },
    requiredPermissions: ["brand:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1500
  },
  {
    id: "platform-agent-orchestrator",
    name: "Agent Orchestrator",
    vertical: "platform",
    category: "automation",
    description: "Orchestrate multi-agent workflows",
    inputSchema: { workflow: "object", agents: "string[]", context: "object" },
    outputSchema: { workflowId: "string", status: "string", results: "object[]" },
    requiredPermissions: ["agents:orchestrate"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 10000
  },
  {
    id: "platform-compliance-checker",
    name: "Compliance Checker",
    vertical: "platform",
    category: "monitoring",
    description: "Check content for regulatory compliance",
    inputSchema: { content: "string", jurisdictions: "string[]", contentType: "string" },
    outputSchema: { compliant: "boolean", issues: "object[]", recommendations: "string[]" },
    requiredPermissions: ["compliance:check"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 3000
  },
  {
    id: "platform-quality-scorer",
    name: "Quality Scorer",
    vertical: "platform",
    category: "analytics",
    description: "Score content quality across dimensions",
    inputSchema: { content: "string", contentType: "string", criteria: "string[]" },
    outputSchema: { score: "number", breakdown: "object", improvements: "string[]" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "platform-workflow-builder",
    name: "Workflow Builder",
    vertical: "platform",
    category: "automation",
    description: "Build cross-vertical automated workflows",
    inputSchema: { steps: "object[]", triggers: "object[]", conditions: "object[]" },
    outputSchema: { workflow: "object", validationStatus: "boolean" },
    requiredPermissions: ["automation:manage"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 4000
  },
  {
    id: "platform-notification-manager",
    name: "Notification Manager",
    vertical: "platform",
    category: "automation",
    description: "Manage multi-channel notifications and alerts",
    inputSchema: { channels: "string[]", message: "object", recipients: "object[]" },
    outputSchema: { sentNotifications: "object[]", deliveryStatus: "object" },
    requiredPermissions: ["notifications:send"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "platform-audit-logger",
    name: "Audit Logger",
    vertical: "platform",
    category: "monitoring",
    description: "Log and track all agent actions for compliance",
    inputSchema: { action: "object", agentId: "string", context: "object" },
    outputSchema: { logId: "string", timestamp: "string" },
    requiredPermissions: ["audit:write"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 500
  },
  {
    id: "platform-rate-limiter",
    name: "Rate Limiter",
    vertical: "platform",
    category: "optimization",
    description: "Manage API rate limits across integrations",
    inputSchema: { integration: "string", action: "string" },
    outputSchema: { allowed: "boolean", remainingQuota: "number", resetTime: "string" },
    requiredPermissions: ["system:manage"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 100
  },
  {
    id: "platform-cache-manager",
    name: "Cache Manager",
    vertical: "platform",
    category: "optimization",
    description: "Manage caching for improved performance",
    inputSchema: { key: "string", operation: "string", data: "object", ttl: "number" },
    outputSchema: { success: "boolean", data: "object" },
    requiredPermissions: ["cache:manage"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 50
  },
  {
    id: "platform-data-exporter",
    name: "Data Exporter",
    vertical: "platform",
    category: "integration",
    description: "Export data in various formats (CSV, JSON, Excel)",
    inputSchema: { dataType: "string", filters: "object", format: "string" },
    outputSchema: { fileUrl: "string", rowCount: "number" },
    requiredPermissions: ["data:export"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 5000
  },
  {
    id: "platform-data-importer",
    name: "Data Importer",
    vertical: "platform",
    category: "integration",
    description: "Import data from various sources and formats",
    inputSchema: { fileUrl: "string", dataType: "string", mapping: "object" },
    outputSchema: { importedCount: "number", errors: "object[]" },
    requiredPermissions: ["data:import"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 8000
  },
  {
    id: "platform-report-scheduler",
    name: "Report Scheduler",
    vertical: "platform",
    category: "automation",
    description: "Schedule automated report generation and delivery",
    inputSchema: { reportConfig: "object", schedule: "object", recipients: "string[]" },
    outputSchema: { scheduleId: "string", nextRun: "string" },
    requiredPermissions: ["reports:schedule"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1500
  },
  {
    id: "platform-webhook-manager",
    name: "Webhook Manager",
    vertical: "platform",
    category: "integration",
    description: "Manage incoming and outgoing webhooks",
    inputSchema: { webhookType: "string", config: "object", events: "string[]" },
    outputSchema: { webhookUrl: "string", secret: "string" },
    requiredPermissions: ["webhooks:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1000
  },
  {
    id: "platform-api-key-manager",
    name: "API Key Manager",
    vertical: "platform",
    category: "integration",
    description: "Manage API keys for external integrations",
    inputSchema: { integration: "string", action: "string", permissions: "string[]" },
    outputSchema: { keyId: "string", maskedKey: "string" },
    requiredPermissions: ["apiKeys:manage"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 1000
  },
  {
    id: "platform-usage-tracker",
    name: "Usage Tracker",
    vertical: "platform",
    category: "analytics",
    description: "Track platform usage and resource consumption",
    inputSchema: { resourceType: "string", dateRange: "object" },
    outputSchema: { usage: "object", costs: "object", projections: "object" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2000
  },
  {
    id: "platform-health-monitor",
    name: "Health Monitor",
    vertical: "platform",
    category: "monitoring",
    description: "Monitor system health and integration status",
    inputSchema: { components: "string[]" },
    outputSchema: { status: "object", issues: "object[]", metrics: "object" },
    requiredPermissions: ["system:read"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 1500
  },
  {
    id: "platform-error-handler",
    name: "Error Handler",
    vertical: "platform",
    category: "monitoring",
    description: "Handle and route errors for resolution",
    inputSchema: { error: "object", context: "object", severity: "string" },
    outputSchema: { ticketId: "string", resolution: "object" },
    requiredPermissions: ["errors:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 500
  },
  {
    id: "platform-backup-manager",
    name: "Backup Manager",
    vertical: "platform",
    category: "automation",
    description: "Manage data backups and recovery",
    inputSchema: { backupType: "string", dataTypes: "string[]" },
    outputSchema: { backupId: "string", status: "string", size: "number" },
    requiredPermissions: ["backup:manage"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 30000
  },
  {
    id: "platform-permission-manager",
    name: "Permission Manager",
    vertical: "platform",
    category: "automation",
    description: "Manage user and agent permissions",
    inputSchema: { entityType: "string", entityId: "string", permissions: "string[]" },
    outputSchema: { updatedPermissions: "object" },
    requiredPermissions: ["permissions:manage"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 1000
  },
  {
    id: "platform-sentiment-engine",
    name: "Sentiment Engine",
    vertical: "platform",
    category: "analytics",
    description: "Unified sentiment analysis across all content",
    inputSchema: { content: "string[]", language: "string" },
    outputSchema: { sentiments: "object[]", aggregateSentiment: "object" },
    requiredPermissions: ["analytics:read", "ai:use"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 3000
  },
  {
    id: "platform-entity-extractor",
    name: "Entity Extractor",
    vertical: "platform",
    category: "analytics",
    description: "Extract entities (people, companies, topics) from text",
    inputSchema: { text: "string", entityTypes: "string[]" },
    outputSchema: { entities: "object[]", relationships: "object[]" },
    requiredPermissions: ["ai:use"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 2500
  },
  {
    id: "platform-intent-classifier",
    name: "Intent Classifier",
    vertical: "platform",
    category: "analytics",
    description: "Classify user intent from messages and queries",
    inputSchema: { message: "string", context: "object" },
    outputSchema: { intent: "string", confidence: "number", entities: "object[]" },
    requiredPermissions: ["ai:use"],
    romaLevelRequired: "L1",
    estimatedExecutionMs: 1500
  },
  {
    id: "platform-content-moderator",
    name: "Content Moderator",
    vertical: "platform",
    category: "monitoring",
    description: "Moderate content for policy violations",
    inputSchema: { content: "string", contentType: "string", policies: "string[]" },
    outputSchema: { approved: "boolean", violations: "object[]", suggestions: "string[]" },
    requiredPermissions: ["moderation:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 2000
  },
  {
    id: "platform-ab-test-engine",
    name: "A/B Test Engine",
    vertical: "platform",
    category: "testing",
    description: "Unified A/B testing infrastructure",
    inputSchema: { experiment: "object", variants: "object[]", metrics: "string[]" },
    outputSchema: { experimentId: "string", allocationConfig: "object" },
    requiredPermissions: ["experiments:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 1500
  },
  {
    id: "platform-model-router",
    name: "Model Router",
    vertical: "platform",
    category: "optimization",
    description: "Route requests to optimal LLM based on task",
    inputSchema: { task: "object", constraints: "object" },
    outputSchema: { selectedModel: "object", reasoning: "string" },
    requiredPermissions: ["ai:use"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 200
  },
  {
    id: "platform-cost-optimizer",
    name: "Cost Optimizer",
    vertical: "platform",
    category: "optimization",
    description: "Optimize AI and infrastructure costs",
    inputSchema: { usageData: "object", constraints: "object" },
    outputSchema: { recommendations: "object[]", projectedSavings: "number" },
    requiredPermissions: ["analytics:read"],
    romaLevelRequired: "L3",
    estimatedExecutionMs: 4000
  },
  {
    id: "platform-feature-flags",
    name: "Feature Flags",
    vertical: "platform",
    category: "automation",
    description: "Manage feature flags for controlled rollouts",
    inputSchema: { flagName: "string", operation: "string", config: "object" },
    outputSchema: { flag: "object", affectedUsers: "number" },
    requiredPermissions: ["features:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 500
  },
  {
    id: "platform-session-manager",
    name: "Session Manager",
    vertical: "platform",
    category: "automation",
    description: "Manage user and agent sessions across platform",
    inputSchema: { sessionId: "string", action: "string", metadata: "object" },
    outputSchema: { session: "object", expiresAt: "string" },
    requiredPermissions: ["sessions:manage"],
    romaLevelRequired: "L2",
    estimatedExecutionMs: 300
  }
];

export const ALL_MCP_TOOLS: MCPToolDefinition[] = [
  ...SOCIAL_TOOLS,
  ...SEO_TOOLS,
  ...WEB_TOOLS,
  ...SALES_TOOLS,
  ...WHATSAPP_TOOLS,
  ...LINKEDIN_TOOLS,
  ...PERFORMANCE_TOOLS,
  ...PLATFORM_TOOLS
];

export function getToolsByVertical(vertical: Vertical | "platform"): MCPToolDefinition[] {
  return ALL_MCP_TOOLS.filter(t => t.vertical === vertical);
}

export function getToolsByCategory(category: MCPToolCategory): MCPToolDefinition[] {
  return ALL_MCP_TOOLS.filter(t => t.category === category);
}

export function getToolById(id: string): MCPToolDefinition | undefined {
  return ALL_MCP_TOOLS.find(t => t.id === id);
}

export function getToolsByRomaLevel(level: "L0" | "L1" | "L2" | "L3" | "L4"): MCPToolDefinition[] {
  return ALL_MCP_TOOLS.filter(t => t.romaLevelRequired === level);
}

export function getMCPToolStats(): {
  totalTools: number;
  byVertical: Record<string, number>;
  byCategory: Record<string, number>;
  byRomaLevel: Record<string, number>;
} {
  const byVertical: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byRomaLevel: Record<string, number> = {};

  ALL_MCP_TOOLS.forEach(tool => {
    byVertical[tool.vertical] = (byVertical[tool.vertical] || 0) + 1;
    byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
    byRomaLevel[tool.romaLevelRequired] = (byRomaLevel[tool.romaLevelRequired] || 0) + 1;
  });

  return {
    totalTools: ALL_MCP_TOOLS.length,
    byVertical,
    byCategory,
    byRomaLevel
  };
}

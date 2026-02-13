#!/usr/bin/env node
/**
 * Marketing Agents Registry Generator
 * Generates 285 agents across 8 verticals with full 22-point system prompts
 */

const fs = require('fs');

const VERTICALS = [
  {
    id: 'social-media',
    name: 'Social Media Marketing',
    shortName: 'Social Media',
    agentCount: 45,
    agents: [
      { id: 'social-media-director', name: 'Social Media Director', tier: 'director', roma: 'L4', role: 'Chief social media strategist leading cross-platform strategy, team coordination, and ROI optimization across all social channels', caps: ['cross-platform-strategy', 'content-calendar-orchestration', 'team-coordination', 'performance-analytics', 'budget-optimization', 'crisis-management', 'trend-analysis', 'influencer-strategy'], tools: ['social-analytics', 'content-scheduler', 'audience-insights', 'competitor-monitor', 'sentiment-analysis', 'trend-detector'], manages: ['content-strategy-lead', 'community-lead', 'creative-lead', 'analytics-lead', 'influencer-lead'], reportsTo: ['cmo-agent'], security: 'critical' },
      { id: 'content-strategy-lead', name: 'Content Strategy Lead', tier: 'manager', roma: 'L3', role: 'Strategic content planning specialist for content pillars, editorial calendars, and content performance optimization', caps: ['content-pillar-development', 'editorial-calendar', 'content-performance', 'audience-research', 'competitive-analysis', 'seo-content-planning', 'ab-testing'], tools: ['content-planner', 'analytics-dashboard', 'competitor-tracker', 'trend-monitor'], manages: ['viral-content-creator', 'copywriter-agent', 'hashtag-strategist', 'content-curator'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'community-lead', name: 'Community Management Lead', tier: 'manager', roma: 'L3', role: 'Community engagement strategist managing audience relationships, response protocols, and community growth', caps: ['community-building', 'engagement-optimization', 'crisis-response', 'sentiment-monitoring', 'ugc-management', 'ambassador-programs'], tools: ['community-dashboard', 'sentiment-analyzer', 'response-templates', 'moderation-tools'], manages: ['community-responder', 'ugc-curator', 'review-manager'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'creative-lead', name: 'Creative Content Lead', tier: 'manager', roma: 'L3', role: 'Creative direction for visual and multimedia content across all social platforms', caps: ['visual-strategy', 'brand-consistency', 'creative-briefing', 'multimedia-production', 'design-review'], tools: ['design-system', 'brand-guidelines', 'asset-library', 'creative-brief-generator'], manages: ['graphic-designer', 'video-producer', 'animation-specialist', 'photo-editor'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'analytics-lead', name: 'Social Analytics Lead', tier: 'manager', roma: 'L3', role: 'Data-driven social media performance analyst managing reporting, insights, and optimization recommendations', caps: ['performance-reporting', 'attribution-modeling', 'audience-segmentation', 'predictive-analytics', 'roi-calculation', 'benchmark-analysis'], tools: ['analytics-suite', 'reporting-engine', 'data-visualization', 'attribution-tracker'], manages: ['metrics-analyst', 'reporting-specialist', 'ab-test-analyst'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'influencer-lead', name: 'Influencer Marketing Lead', tier: 'manager', roma: 'L3', role: 'Influencer partnership strategist managing identification, outreach, and campaign coordination', caps: ['influencer-identification', 'partnership-negotiation', 'campaign-coordination', 'roi-tracking', 'relationship-management'], tools: ['influencer-database', 'outreach-automation', 'campaign-tracker', 'roi-calculator'], manages: ['influencer-scout', 'partnership-coordinator', 'influencer-analyst'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'viral-content-creator', name: 'Viral Content Creator', tier: 'specialist', roma: 'L2', role: 'Creates highly shareable viral-worthy content engineered for maximum engagement using psychological triggers and trending formats', caps: ['trend-jacking', 'hook-writing', 'meme-creation', 'format-optimization', 'emotional-triggers', 'newsjacking'], tools: ['trend-tracker', 'viral-predictor', 'engagement-analyzer'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'copywriter-agent', name: 'Social Media Copywriter', tier: 'specialist', roma: 'L2', role: 'Professional copywriter specializing in platform-specific ad copy, captions, and CTAs optimized for each social platform', caps: ['ad-copy', 'caption-writing', 'cta-optimization', 'brand-voice', 'ab-copy-testing', 'localization'], tools: ['copy-templates', 'tone-analyzer', 'headline-tester'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'hashtag-strategist', name: 'Hashtag Strategy Specialist', tier: 'specialist', roma: 'L2', role: 'Hashtag research and strategy specialist optimizing discoverability and reach across platforms', caps: ['hashtag-research', 'trending-analysis', 'competitive-hashtags', 'branded-hashtags', 'performance-tracking'], tools: ['hashtag-analyzer', 'trend-monitor', 'reach-predictor'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'content-curator', name: 'Content Curation Specialist', tier: 'specialist', roma: 'L2', role: 'Curates third-party content, industry news, and user-generated content for brand channels', caps: ['content-discovery', 'relevance-scoring', 'scheduling-optimization', 'source-verification', 'credit-attribution'], tools: ['content-aggregator', 'rss-monitor', 'scheduling-tool'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'community-responder', name: 'Community Response Agent', tier: 'worker', roma: 'L1', role: 'Handles real-time community responses, comments, and DMs with brand-consistent messaging', caps: ['response-generation', 'sentiment-detection', 'escalation-routing', 'template-personalization'], tools: ['response-engine', 'sentiment-detector', 'escalation-system'], reportsTo: ['community-lead'], security: 'medium' },
      { id: 'ugc-curator', name: 'UGC Curation Agent', tier: 'worker', roma: 'L1', role: 'Identifies, curates, and manages user-generated content for brand amplification', caps: ['ugc-discovery', 'rights-management', 'quality-filtering', 'attribution-tracking'], tools: ['ugc-scanner', 'rights-tracker', 'content-filter'], reportsTo: ['community-lead'], security: 'medium' },
      { id: 'review-manager', name: 'Review Management Agent', tier: 'worker', roma: 'L1', role: 'Monitors and responds to brand reviews across platforms with appropriate tone and resolution', caps: ['review-monitoring', 'response-drafting', 'sentiment-classification', 'escalation-management'], tools: ['review-aggregator', 'response-drafter', 'sentiment-classifier'], reportsTo: ['community-lead'], security: 'medium' },
      { id: 'graphic-designer', name: 'Social Graphic Designer', tier: 'specialist', roma: 'L2', role: 'Creates platform-optimized visual content including posts, stories, carousels, and infographics', caps: ['template-design', 'brand-compliance', 'format-optimization', 'accessibility-design', 'responsive-graphics'], tools: ['design-engine', 'template-library', 'brand-checker', 'format-converter'], reportsTo: ['creative-lead'], security: 'medium' },
      { id: 'video-producer', name: 'Social Video Producer', tier: 'specialist', roma: 'L2', role: 'Produces short-form and long-form video content optimized for social platform algorithms', caps: ['video-scripting', 'editing-direction', 'thumbnail-optimization', 'caption-generation', 'format-adaptation'], tools: ['video-editor', 'thumbnail-generator', 'caption-tool', 'analytics-tracker'], reportsTo: ['creative-lead'], security: 'medium' },
      { id: 'animation-specialist', name: 'Motion Graphics Specialist', tier: 'specialist', roma: 'L2', role: 'Creates animated content, GIFs, and motion graphics for social engagement', caps: ['animation-creation', 'gif-production', 'motion-templates', 'interactive-content'], tools: ['animation-engine', 'gif-creator', 'motion-library'], reportsTo: ['creative-lead'], security: 'medium' },
      { id: 'photo-editor', name: 'Photo Enhancement Agent', tier: 'worker', roma: 'L1', role: 'Professional photo editing and enhancement for social media posts with brand consistency', caps: ['photo-enhancement', 'filter-application', 'brand-overlay', 'batch-processing'], tools: ['photo-editor', 'filter-engine', 'brand-overlay-tool'], reportsTo: ['creative-lead'], security: 'low' },
      { id: 'metrics-analyst', name: 'Social Metrics Analyst', tier: 'specialist', roma: 'L2', role: 'Deep-dive social media metrics analysis providing actionable performance insights', caps: ['metric-tracking', 'trend-identification', 'anomaly-detection', 'benchmark-comparison'], tools: ['metrics-dashboard', 'trend-analyzer', 'anomaly-detector'], reportsTo: ['analytics-lead'], security: 'medium' },
      { id: 'reporting-specialist', name: 'Social Reporting Specialist', tier: 'worker', roma: 'L1', role: 'Generates automated social media performance reports with visualizations and recommendations', caps: ['report-generation', 'data-visualization', 'insight-extraction', 'executive-summaries'], tools: ['report-builder', 'chart-generator', 'pdf-exporter'], reportsTo: ['analytics-lead'], security: 'medium' },
      { id: 'ab-test-analyst', name: 'A/B Test Analyst', tier: 'specialist', roma: 'L2', role: 'Designs and analyzes social media A/B tests for continuous content optimization', caps: ['test-design', 'statistical-analysis', 'winner-determination', 'learning-documentation'], tools: ['ab-testing-engine', 'stats-calculator', 'test-tracker'], reportsTo: ['analytics-lead'], security: 'medium' },
      { id: 'influencer-scout', name: 'Influencer Discovery Agent', tier: 'specialist', roma: 'L2', role: 'Discovers and vets potential influencer partners using engagement metrics and audience alignment', caps: ['influencer-search', 'audience-analysis', 'authenticity-scoring', 'niche-matching'], tools: ['influencer-finder', 'audience-analyzer', 'fake-follower-detector'], reportsTo: ['influencer-lead'], security: 'medium' },
      { id: 'partnership-coordinator', name: 'Influencer Partnership Coordinator', tier: 'worker', roma: 'L1', role: 'Manages influencer campaign logistics, briefs, and deliverable tracking', caps: ['brief-creation', 'timeline-management', 'deliverable-tracking', 'contract-coordination'], tools: ['brief-generator', 'project-tracker', 'contract-manager'], reportsTo: ['influencer-lead'], security: 'medium' },
      { id: 'influencer-analyst', name: 'Influencer Performance Analyst', tier: 'worker', roma: 'L1', role: 'Tracks and reports on influencer campaign performance metrics and ROI', caps: ['campaign-tracking', 'roi-calculation', 'engagement-analysis', 'attribution-modeling'], tools: ['campaign-tracker', 'roi-calculator', 'attribution-engine'], reportsTo: ['influencer-lead'], security: 'medium' },
      { id: 'platform-instagram', name: 'Instagram Platform Specialist', tier: 'specialist', roma: 'L2', role: 'Instagram-specific content optimization including Reels, Stories, and Shopping features', caps: ['reels-optimization', 'stories-strategy', 'shopping-integration', 'algorithm-awareness', 'carousel-design'], tools: ['instagram-analytics', 'reels-editor', 'shopping-manager'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'platform-tiktok', name: 'TikTok Platform Specialist', tier: 'specialist', roma: 'L2', role: 'TikTok-specific content creation and trend participation for maximum viral reach', caps: ['tiktok-trends', 'sound-selection', 'duet-stitch-strategy', 'fyp-optimization', 'creator-marketplace'], tools: ['tiktok-analytics', 'trend-finder', 'sound-library'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'platform-youtube', name: 'YouTube Content Specialist', tier: 'specialist', roma: 'L2', role: 'YouTube content strategy including Shorts, long-form, and community engagement', caps: ['seo-optimization', 'thumbnail-design', 'shorts-strategy', 'playlist-curation', 'community-management'], tools: ['youtube-analytics', 'keyword-tool', 'thumbnail-creator'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'platform-twitter', name: 'X/Twitter Platform Specialist', tier: 'specialist', roma: 'L2', role: 'X/Twitter-specific content strategy including threads, polls, Spaces, and real-time engagement', caps: ['thread-creation', 'poll-strategy', 'spaces-hosting', 'real-time-engagement', 'trend-participation'], tools: ['twitter-analytics', 'thread-composer', 'scheduling-tool'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'platform-pinterest', name: 'Pinterest Marketing Specialist', tier: 'specialist', roma: 'L2', role: 'Pinterest-specific visual content strategy for search-driven discovery and shopping', caps: ['pin-optimization', 'board-strategy', 'rich-pins', 'shopping-pins', 'seo-keywords'], tools: ['pinterest-analytics', 'pin-designer', 'keyword-planner'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'social-ads-specialist', name: 'Social Paid Ads Specialist', tier: 'specialist', roma: 'L2', role: 'Manages paid social campaigns across platforms with targeting, bidding, and creative optimization', caps: ['ad-targeting', 'bid-management', 'creative-testing', 'audience-building', 'retargeting', 'lookalike-audiences'], tools: ['ads-manager', 'audience-builder', 'bid-optimizer', 'creative-tester'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'social-listening', name: 'Social Listening Agent', tier: 'specialist', roma: 'L2', role: 'Real-time social media monitoring for brand mentions, competitor activity, and industry trends', caps: ['brand-monitoring', 'competitor-tracking', 'trend-detection', 'sentiment-analysis', 'crisis-early-warning'], tools: ['listening-platform', 'alert-system', 'sentiment-engine', 'competitor-tracker'], reportsTo: ['analytics-lead'], security: 'high' },
      { id: 'crisis-communicator', name: 'Social Crisis Communicator', tier: 'specialist', roma: 'L3', role: 'Handles social media crisis situations with rapid response protocols and damage control', caps: ['crisis-detection', 'rapid-response', 'stakeholder-communication', 'reputation-management', 'post-crisis-analysis'], tools: ['crisis-monitor', 'response-templates', 'stakeholder-notifier', 'impact-analyzer'], reportsTo: ['social-media-director'], security: 'critical' },
      { id: 'localization-specialist', name: 'Social Content Localizer', tier: 'specialist', roma: 'L2', role: 'Localizes social content for Indian languages and regional cultural contexts', caps: ['content-translation', 'cultural-adaptation', 'regional-trending', 'language-switching', 'dialect-awareness'], tools: ['translation-engine', 'cultural-database', 'regional-trend-tracker'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'scheduling-optimizer', name: 'Post Scheduling Optimizer', tier: 'worker', roma: 'L1', role: 'Optimizes content posting schedules based on audience activity patterns and platform algorithms', caps: ['optimal-timing', 'frequency-management', 'timezone-optimization', 'queue-management'], tools: ['scheduling-engine', 'audience-activity-tracker', 'timezone-converter'], reportsTo: ['content-strategy-lead'], security: 'low' },
      { id: 'story-creator', name: 'Stories & Ephemeral Content Agent', tier: 'specialist', roma: 'L2', role: 'Creates engaging ephemeral content for Instagram Stories, Facebook Stories, and similar formats', caps: ['story-design', 'interactive-elements', 'poll-creation', 'sticker-strategy', 'swipe-up-optimization'], tools: ['story-designer', 'interactive-toolkit', 'engagement-tracker'], reportsTo: ['creative-lead'], security: 'medium' },
      { id: 'social-commerce', name: 'Social Commerce Agent', tier: 'specialist', roma: 'L2', role: 'Manages social commerce features including product tagging, shopping feeds, and checkout optimization', caps: ['product-tagging', 'catalog-management', 'checkout-optimization', 'shopping-analytics', 'conversion-tracking'], tools: ['commerce-manager', 'catalog-syncer', 'conversion-tracker'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'engagement-booster', name: 'Engagement Optimization Agent', tier: 'worker', roma: 'L1', role: 'Implements engagement tactics including contests, polls, and interactive content strategies', caps: ['contest-management', 'poll-creation', 'gamification', 'reward-programs', 'engagement-mechanics'], tools: ['contest-builder', 'poll-creator', 'gamification-engine'], reportsTo: ['community-lead'], security: 'low' },
      { id: 'brand-voice-agent', name: 'Brand Voice Consistency Agent', tier: 'specialist', roma: 'L2', role: 'Ensures all social content maintains consistent brand voice, tone, and messaging standards', caps: ['voice-analysis', 'tone-detection', 'consistency-scoring', 'guideline-enforcement', 'style-correction'], tools: ['voice-analyzer', 'tone-detector', 'brand-scorer'], reportsTo: ['social-media-director'], security: 'high' },
      { id: 'competitor-analyst', name: 'Competitor Social Analyst', tier: 'specialist', roma: 'L2', role: 'Monitors and analyzes competitor social media strategies and performance benchmarks', caps: ['competitor-monitoring', 'benchmark-analysis', 'strategy-reverse-engineering', 'gap-identification', 'opportunity-detection'], tools: ['competitor-tracker', 'benchmark-tool', 'gap-analyzer'], reportsTo: ['analytics-lead'], security: 'medium' },
      { id: 'audience-growth', name: 'Audience Growth Specialist', tier: 'specialist', roma: 'L2', role: 'Develops and executes strategies for organic audience growth across social platforms', caps: ['growth-hacking', 'cross-promotion', 'collaboration-strategy', 'viral-mechanics', 'referral-programs'], tools: ['growth-tracker', 'collaboration-finder', 'referral-engine'], reportsTo: ['social-media-director'], security: 'medium' },
      { id: 'social-seo', name: 'Social SEO Specialist', tier: 'specialist', roma: 'L2', role: 'Optimizes social media profiles and content for search visibility within platforms and Google', caps: ['profile-optimization', 'keyword-research', 'alt-text-optimization', 'structured-data', 'search-visibility'], tools: ['seo-analyzer', 'keyword-finder', 'search-tracker'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'social-automation', name: 'Social Workflow Automator', tier: 'worker', roma: 'L1', role: 'Automates repetitive social media workflows including posting, monitoring, and reporting', caps: ['workflow-automation', 'trigger-management', 'batch-processing', 'api-integration'], tools: ['automation-engine', 'trigger-builder', 'api-connector'], reportsTo: ['social-media-director'], security: 'medium' },
      { id: 'event-social', name: 'Event Social Coverage Agent', tier: 'specialist', roma: 'L2', role: 'Manages real-time social coverage for brand events, webinars, and live streams', caps: ['live-coverage', 'real-time-posting', 'event-hashtags', 'audience-engagement', 'post-event-recap'], tools: ['live-posting-tool', 'event-monitor', 'recap-generator'], reportsTo: ['content-strategy-lead'], security: 'medium' },
      { id: 'compliance-checker', name: 'Social Compliance Checker', tier: 'reviewer', roma: 'L2', role: 'Reviews social content for legal compliance, FTC guidelines, platform policies, and brand safety', caps: ['compliance-review', 'policy-checking', 'disclaimer-insertion', 'risk-assessment', 'approval-workflow'], tools: ['compliance-engine', 'policy-checker', 'risk-scorer'], reportsTo: ['social-media-director'], security: 'critical' },
      { id: 'accessibility-agent', name: 'Social Accessibility Agent', tier: 'worker', roma: 'L1', role: 'Ensures all social content meets accessibility standards including alt-text, captions, and contrast', caps: ['alt-text-generation', 'caption-creation', 'contrast-checking', 'screen-reader-optimization'], tools: ['accessibility-checker', 'alt-text-generator', 'caption-tool'], reportsTo: ['creative-lead'], security: 'medium' }
    ]
  },
  {
    id: 'seo-geo',
    name: 'SEO & GEO',
    shortName: 'SEO/GEO',
    agentCount: 38,
    agents: [
      { id: 'seo-director', name: 'SEO Director', tier: 'director', roma: 'L4', role: 'Chief SEO strategist leading organic search, GEO optimization, and technical SEO across all properties', caps: ['seo-strategy', 'technical-audit', 'content-optimization', 'link-building', 'geo-optimization', 'serp-analysis', 'algorithm-adaptation'], tools: ['seo-suite', 'rank-tracker', 'audit-tool', 'backlink-analyzer', 'keyword-planner', 'serp-monitor'], manages: ['technical-seo-lead', 'content-seo-lead', 'link-building-lead', 'local-seo-lead', 'geo-lead', 'seo-analytics-lead'], reportsTo: ['cmo-agent'], security: 'critical' },
      { id: 'technical-seo-lead', name: 'Technical SEO Lead', tier: 'manager', roma: 'L3', role: 'Technical SEO specialist managing site architecture, crawlability, Core Web Vitals, and structured data', caps: ['site-architecture', 'crawl-optimization', 'core-web-vitals', 'structured-data', 'indexation-management', 'mobile-optimization'], tools: ['crawl-analyzer', 'speed-tester', 'schema-generator', 'log-analyzer'], manages: ['crawl-optimizer', 'speed-specialist', 'schema-agent', 'mobile-seo-agent'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'content-seo-lead', name: 'Content SEO Lead', tier: 'manager', roma: 'L3', role: 'Content SEO strategist managing keyword research, content gaps, and on-page optimization', caps: ['keyword-research', 'content-gap-analysis', 'on-page-optimization', 'topic-clustering', 'serp-intent-analysis', 'content-scoring'], tools: ['keyword-tool', 'content-analyzer', 'gap-finder', 'topic-mapper'], manages: ['keyword-researcher', 'content-optimizer', 'meta-writer', 'featured-snippet-agent'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'link-building-lead', name: 'Link Building Lead', tier: 'manager', roma: 'L3', role: 'Link acquisition strategist managing outreach, digital PR, and backlink profile analysis', caps: ['outreach-strategy', 'link-prospecting', 'digital-pr', 'backlink-analysis', 'competitor-link-audit', 'disavow-management'], tools: ['backlink-tool', 'outreach-automation', 'prospect-finder', 'link-tracker'], manages: ['outreach-agent', 'guest-post-agent', 'broken-link-agent', 'link-analyst'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'local-seo-lead', name: 'Local SEO Lead', tier: 'manager', roma: 'L3', role: 'Local search optimization specialist managing Google Business Profiles, citations, and local rankings', caps: ['gbp-optimization', 'citation-building', 'local-ranking-tracking', 'review-management', 'nap-consistency', 'local-link-building'], tools: ['gbp-manager', 'citation-tool', 'local-rank-tracker', 'review-monitor'], manages: ['gbp-optimizer', 'citation-agent', 'local-content-agent'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'geo-lead', name: 'Generative Engine Optimization Lead', tier: 'manager', roma: 'L3', role: 'GEO specialist optimizing brand visibility in AI search engines, ChatGPT, Perplexity, and Gemini results', caps: ['ai-search-optimization', 'entity-seo', 'knowledge-graph', 'ai-citation-building', 'llm-visibility', 'answer-engine-optimization'], tools: ['ai-search-tracker', 'entity-analyzer', 'knowledge-graph-tool', 'citation-builder'], manages: ['ai-search-agent', 'entity-optimizer', 'knowledge-graph-agent'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'seo-analytics-lead', name: 'SEO Analytics Lead', tier: 'manager', roma: 'L3', role: 'SEO performance analyst managing ranking data, traffic analysis, and ROI attribution', caps: ['rank-tracking', 'traffic-analysis', 'conversion-attribution', 'competitor-benchmarking', 'reporting', 'forecasting'], tools: ['analytics-suite', 'rank-tracker', 'attribution-tool', 'forecast-model'], manages: ['rank-tracker-agent', 'traffic-analyst', 'seo-reporter'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'crawl-optimizer', name: 'Crawl Budget Optimizer', tier: 'specialist', roma: 'L2', role: 'Optimizes crawl budget allocation and ensures critical pages are indexed efficiently', caps: ['crawl-budget-analysis', 'robots-txt-optimization', 'xml-sitemap-management', 'index-coverage'], tools: ['crawl-analyzer', 'robots-editor', 'sitemap-generator'], reportsTo: ['technical-seo-lead'], security: 'medium' },
      { id: 'speed-specialist', name: 'Page Speed Specialist', tier: 'specialist', roma: 'L2', role: 'Optimizes Core Web Vitals and page load performance for better rankings and user experience', caps: ['lcp-optimization', 'cls-reduction', 'fid-improvement', 'image-optimization', 'code-splitting', 'caching-strategy'], tools: ['pagespeed-tester', 'lighthouse-runner', 'waterfall-analyzer'], reportsTo: ['technical-seo-lead'], security: 'medium' },
      { id: 'schema-agent', name: 'Schema Markup Agent', tier: 'specialist', roma: 'L2', role: 'Implements and manages structured data markup for rich search results and knowledge panel optimization', caps: ['schema-generation', 'rich-result-optimization', 'testing', 'monitoring', 'json-ld-creation'], tools: ['schema-generator', 'validator', 'rich-result-tester'], reportsTo: ['technical-seo-lead'], security: 'medium' },
      { id: 'mobile-seo-agent', name: 'Mobile SEO Agent', tier: 'specialist', roma: 'L2', role: 'Mobile-first indexing optimization and mobile search experience enhancement', caps: ['mobile-audit', 'responsive-checking', 'amp-management', 'app-indexing', 'pwa-seo'], tools: ['mobile-tester', 'responsive-checker', 'app-index-tool'], reportsTo: ['technical-seo-lead'], security: 'medium' },
      { id: 'keyword-researcher', name: 'Keyword Research Agent', tier: 'specialist', roma: 'L2', role: 'Advanced keyword research using AI to identify high-value opportunities across search intents', caps: ['keyword-discovery', 'intent-classification', 'difficulty-scoring', 'opportunity-analysis', 'long-tail-research'], tools: ['keyword-explorer', 'intent-classifier', 'difficulty-scorer'], reportsTo: ['content-seo-lead'], security: 'medium' },
      { id: 'content-optimizer', name: 'On-Page Content Optimizer', tier: 'specialist', roma: 'L2', role: 'Optimizes page content for target keywords while maintaining quality and user engagement', caps: ['content-scoring', 'keyword-density', 'semantic-enrichment', 'readability-optimization', 'entity-integration'], tools: ['content-scorer', 'semantic-analyzer', 'readability-tool'], reportsTo: ['content-seo-lead'], security: 'medium' },
      { id: 'meta-writer', name: 'Meta Tags & SERP Writer', tier: 'worker', roma: 'L1', role: 'Writes optimized title tags, meta descriptions, and SERP snippets for maximum click-through rates', caps: ['title-optimization', 'meta-description-writing', 'ctr-optimization', 'serp-preview', 'character-counting'], tools: ['meta-writer', 'serp-previewer', 'ctr-predictor'], reportsTo: ['content-seo-lead'], security: 'low' },
      { id: 'featured-snippet-agent', name: 'Featured Snippet Optimizer', tier: 'specialist', roma: 'L2', role: 'Optimizes content specifically for Google Featured Snippets, People Also Ask, and knowledge panels', caps: ['snippet-targeting', 'paa-optimization', 'knowledge-panel-optimization', 'answer-formatting'], tools: ['snippet-tracker', 'paa-analyzer', 'answer-formatter'], reportsTo: ['content-seo-lead'], security: 'medium' },
      { id: 'outreach-agent', name: 'Link Outreach Agent', tier: 'specialist', roma: 'L2', role: 'Manages personalized outreach campaigns for link acquisition and digital PR', caps: ['prospect-research', 'email-personalization', 'follow-up-management', 'relationship-building', 'pitch-optimization'], tools: ['outreach-platform', 'email-tracker', 'prospect-database'], reportsTo: ['link-building-lead'], security: 'medium' },
      { id: 'guest-post-agent', name: 'Guest Posting Agent', tier: 'specialist', roma: 'L2', role: 'Identifies guest posting opportunities and manages content creation for link building', caps: ['opportunity-finding', 'pitch-writing', 'content-creation', 'placement-tracking'], tools: ['opportunity-finder', 'pitch-writer', 'placement-tracker'], reportsTo: ['link-building-lead'], security: 'medium' },
      { id: 'broken-link-agent', name: 'Broken Link Builder', tier: 'worker', roma: 'L1', role: 'Identifies broken links on target sites and proposes replacement content for link building', caps: ['broken-link-detection', 'replacement-suggestion', 'outreach-drafting'], tools: ['link-checker', 'replacement-finder', 'outreach-drafter'], reportsTo: ['link-building-lead'], security: 'low' },
      { id: 'link-analyst', name: 'Backlink Profile Analyst', tier: 'specialist', roma: 'L2', role: 'Analyzes backlink profiles, identifies toxic links, and monitors link velocity', caps: ['profile-analysis', 'toxicity-scoring', 'velocity-monitoring', 'competitor-comparison', 'disavow-recommendations'], tools: ['backlink-analyzer', 'toxicity-scorer', 'velocity-tracker'], reportsTo: ['link-building-lead'], security: 'medium' },
      { id: 'gbp-optimizer', name: 'Google Business Profile Optimizer', tier: 'specialist', roma: 'L2', role: 'Optimizes Google Business Profiles for local search visibility and engagement', caps: ['profile-optimization', 'post-management', 'qa-management', 'photo-optimization', 'category-selection'], tools: ['gbp-manager', 'post-scheduler', 'qa-responder'], reportsTo: ['local-seo-lead'], security: 'medium' },
      { id: 'citation-agent', name: 'Citation Builder', tier: 'worker', roma: 'L1', role: 'Builds and manages business citations across local directories and industry platforms', caps: ['citation-creation', 'nap-consistency-checking', 'directory-submission', 'listing-monitoring'], tools: ['citation-builder', 'nap-checker', 'directory-submitter'], reportsTo: ['local-seo-lead'], security: 'low' },
      { id: 'local-content-agent', name: 'Local Content Agent', tier: 'specialist', roma: 'L2', role: 'Creates locally-relevant content optimized for regional search queries and local intent', caps: ['local-keyword-research', 'regional-content', 'event-coverage', 'community-content'], tools: ['local-keyword-tool', 'regional-trends', 'community-tracker'], reportsTo: ['local-seo-lead'], security: 'medium' },
      { id: 'ai-search-agent', name: 'AI Search Optimization Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes content for AI-powered search engines including ChatGPT, Perplexity, and Gemini', caps: ['ai-seo', 'citation-optimization', 'entity-building', 'answer-optimization', 'llm-friendly-content'], tools: ['ai-search-checker', 'citation-tracker', 'entity-builder'], reportsTo: ['geo-lead'], security: 'high' },
      { id: 'entity-optimizer', name: 'Entity SEO Agent', tier: 'specialist', roma: 'L2', role: 'Builds and optimizes entity relationships for knowledge graph and entity-based search', caps: ['entity-mapping', 'relationship-building', 'wiki-optimization', 'authority-signals'], tools: ['entity-mapper', 'relationship-analyzer', 'authority-checker'], reportsTo: ['geo-lead'], security: 'medium' },
      { id: 'knowledge-graph-agent', name: 'Knowledge Graph Agent', tier: 'specialist', roma: 'L2', role: 'Manages brand presence in Google Knowledge Graph and AI knowledge systems', caps: ['knowledge-panel-optimization', 'fact-verification', 'source-building', 'entity-disambiguation'], tools: ['kg-analyzer', 'fact-checker', 'source-builder'], reportsTo: ['geo-lead'], security: 'medium' },
      { id: 'rank-tracker-agent', name: 'Rank Tracking Agent', tier: 'worker', roma: 'L1', role: 'Automated daily rank tracking across keywords, locations, and devices', caps: ['daily-tracking', 'serp-feature-monitoring', 'competitor-tracking', 'alert-management'], tools: ['rank-tracker', 'serp-monitor', 'alert-engine'], reportsTo: ['seo-analytics-lead'], security: 'low' },
      { id: 'traffic-analyst', name: 'Organic Traffic Analyst', tier: 'specialist', roma: 'L2', role: 'Analyzes organic search traffic patterns, identifies opportunities, and forecasts trends', caps: ['traffic-analysis', 'pattern-recognition', 'opportunity-identification', 'trend-forecasting'], tools: ['analytics-tool', 'pattern-analyzer', 'forecast-model'], reportsTo: ['seo-analytics-lead'], security: 'medium' },
      { id: 'seo-reporter', name: 'SEO Reporting Agent', tier: 'worker', roma: 'L1', role: 'Generates automated SEO reports with ranking changes, traffic data, and conversion metrics', caps: ['report-generation', 'data-aggregation', 'visualization', 'trend-summary'], tools: ['report-builder', 'data-aggregator', 'chart-maker'], reportsTo: ['seo-analytics-lead'], security: 'medium' },
      { id: 'international-seo', name: 'International SEO Agent', tier: 'specialist', roma: 'L2', role: 'Manages international SEO including hreflang, country targeting, and multilingual optimization', caps: ['hreflang-management', 'country-targeting', 'multilingual-seo', 'ccTLD-strategy', 'content-localization'], tools: ['hreflang-checker', 'country-analyzer', 'localization-tool'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'ecommerce-seo', name: 'E-Commerce SEO Specialist', tier: 'specialist', roma: 'L2', role: 'Specialized SEO for e-commerce including product pages, category optimization, and shopping results', caps: ['product-seo', 'category-optimization', 'shopping-feed', 'review-schema', 'faceted-navigation'], tools: ['product-optimizer', 'feed-manager', 'schema-builder'], reportsTo: ['seo-director'], security: 'high' },
      { id: 'content-pruning-agent', name: 'Content Pruning Agent', tier: 'specialist', roma: 'L2', role: 'Identifies underperforming content for update, consolidation, or removal to improve overall site quality', caps: ['content-audit', 'performance-scoring', 'consolidation-recommendations', 'redirect-planning'], tools: ['content-auditor', 'performance-scorer', 'redirect-planner'], reportsTo: ['content-seo-lead'], security: 'medium' },
      { id: 'image-seo-agent', name: 'Image SEO Agent', tier: 'worker', roma: 'L1', role: 'Optimizes images for search including alt text, file names, compression, and image sitemap management', caps: ['alt-text-optimization', 'file-naming', 'compression', 'image-sitemap', 'visual-search-optimization'], tools: ['image-optimizer', 'alt-text-generator', 'compression-tool'], reportsTo: ['technical-seo-lead'], security: 'low' },
      { id: 'video-seo-agent', name: 'Video SEO Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes video content for search visibility in Google, YouTube, and video carousel results', caps: ['video-schema', 'youtube-seo', 'transcript-optimization', 'thumbnail-optimization', 'chapter-marking'], tools: ['video-optimizer', 'transcript-tool', 'schema-builder'], reportsTo: ['content-seo-lead'], security: 'medium' },
      { id: 'seo-testing-agent', name: 'SEO A/B Testing Agent', tier: 'specialist', roma: 'L2', role: 'Designs and runs SEO split tests to validate optimization hypotheses with statistical rigor', caps: ['test-design', 'traffic-splitting', 'statistical-analysis', 'winner-declaration', 'rollout-management'], tools: ['seo-tester', 'stats-engine', 'traffic-splitter'], reportsTo: ['seo-analytics-lead'], security: 'medium' },
      { id: 'seo-compliance', name: 'SEO Compliance Reviewer', tier: 'reviewer', roma: 'L2', role: 'Reviews content and technical changes for SEO compliance before deployment', caps: ['pre-launch-audit', 'redirect-validation', 'canonical-checking', 'indexation-review'], tools: ['pre-launch-checker', 'redirect-validator', 'canonical-tool'], reportsTo: ['seo-director'], security: 'high' }
    ]
  },
  {
    id: 'web-development',
    name: 'Web Development',
    shortName: 'Web Development',
    agentCount: 35,
    agents: [
      { id: 'web-dev-director', name: 'Web Development Director', tier: 'director', roma: 'L4', role: 'Chief web development strategist leading full-stack development, CMS management, and digital experience optimization', caps: ['full-stack-strategy', 'architecture-design', 'team-management', 'tech-stack-selection', 'performance-optimization', 'security-architecture'], tools: ['code-review-system', 'architecture-diagrammer', 'performance-monitor', 'security-scanner', 'deployment-manager', 'version-control'], manages: ['frontend-lead', 'backend-lead', 'devops-lead', 'ux-lead', 'qa-lead'], reportsTo: ['cto-agent'], security: 'critical' },
      { id: 'frontend-lead', name: 'Frontend Development Lead', tier: 'manager', roma: 'L3', role: 'Frontend architecture specialist managing UI frameworks, component libraries, and client-side performance', caps: ['react-development', 'component-architecture', 'state-management', 'responsive-design', 'accessibility', 'performance-optimization'], tools: ['component-library', 'design-system', 'performance-profiler', 'accessibility-checker'], manages: ['react-developer', 'ui-component-builder', 'animation-developer', 'accessibility-specialist'], reportsTo: ['web-dev-director'], security: 'high' },
      { id: 'backend-lead', name: 'Backend Development Lead', tier: 'manager', roma: 'L3', role: 'Backend architecture specialist managing APIs, databases, microservices, and server-side logic', caps: ['api-design', 'database-architecture', 'microservices', 'authentication', 'caching-strategy', 'message-queues'], tools: ['api-designer', 'database-tool', 'microservice-monitor', 'auth-system'], manages: ['api-developer', 'database-engineer', 'integration-developer', 'auth-specialist'], reportsTo: ['web-dev-director'], security: 'critical' },
      { id: 'devops-lead', name: 'DevOps & Infrastructure Lead', tier: 'manager', roma: 'L3', role: 'DevOps specialist managing CI/CD pipelines, cloud infrastructure, and deployment automation', caps: ['cicd-pipelines', 'cloud-infrastructure', 'containerization', 'monitoring', 'auto-scaling', 'disaster-recovery'], tools: ['cicd-platform', 'cloud-console', 'container-orchestrator', 'monitoring-suite'], manages: ['cicd-engineer', 'cloud-engineer', 'monitoring-agent', 'security-ops-agent'], reportsTo: ['web-dev-director'], security: 'critical' },
      { id: 'ux-lead', name: 'UX Design Lead', tier: 'manager', roma: 'L3', role: 'User experience design specialist managing wireframes, prototypes, and usability testing', caps: ['user-research', 'wireframing', 'prototyping', 'usability-testing', 'information-architecture', 'design-systems'], tools: ['design-tool', 'prototype-builder', 'usability-tester', 'analytics-dashboard'], manages: ['ux-researcher', 'ui-designer', 'interaction-designer'], reportsTo: ['web-dev-director'], security: 'high' },
      { id: 'qa-lead', name: 'QA & Testing Lead', tier: 'manager', roma: 'L3', role: 'Quality assurance specialist managing test automation, regression testing, and quality standards', caps: ['test-strategy', 'automation-framework', 'regression-testing', 'performance-testing', 'security-testing'], tools: ['test-framework', 'automation-tool', 'performance-tester', 'security-scanner'], manages: ['test-automation-agent', 'performance-tester-agent', 'cross-browser-agent'], reportsTo: ['web-dev-director'], security: 'high' },
      { id: 'react-developer', name: 'React Development Agent', tier: 'specialist', roma: 'L2', role: 'React.js specialist building high-performance components, hooks, and state management solutions', caps: ['react-components', 'hooks-patterns', 'state-management', 'server-components', 'suspense', 'error-boundaries'], tools: ['react-devtools', 'component-tester', 'state-debugger'], reportsTo: ['frontend-lead'], security: 'medium' },
      { id: 'ui-component-builder', name: 'UI Component Builder', tier: 'specialist', roma: 'L2', role: 'Creates reusable UI component libraries with Tailwind CSS, shadcn/ui, and design tokens', caps: ['component-design', 'design-tokens', 'theming', 'documentation', 'storybook'], tools: ['component-studio', 'token-manager', 'documentation-tool'], reportsTo: ['frontend-lead'], security: 'medium' },
      { id: 'animation-developer', name: 'Web Animation Developer', tier: 'specialist', roma: 'L2', role: 'Creates smooth web animations using Framer Motion, GSAP, and CSS animations', caps: ['motion-design', 'transition-effects', 'scroll-animations', 'micro-interactions', 'performance-optimization'], tools: ['animation-studio', 'performance-profiler', 'motion-library'], reportsTo: ['frontend-lead'], security: 'low' },
      { id: 'accessibility-specialist', name: 'Web Accessibility Agent', tier: 'specialist', roma: 'L2', role: 'Ensures WCAG 2.1 AA compliance across all web properties with accessibility auditing', caps: ['wcag-auditing', 'aria-implementation', 'screen-reader-testing', 'keyboard-navigation', 'color-contrast'], tools: ['accessibility-auditor', 'screen-reader-tester', 'contrast-checker'], reportsTo: ['frontend-lead'], security: 'high' },
      { id: 'api-developer', name: 'API Development Agent', tier: 'specialist', roma: 'L2', role: 'Builds RESTful and GraphQL APIs with proper authentication, validation, and documentation', caps: ['rest-api-design', 'graphql-development', 'openapi-documentation', 'rate-limiting', 'versioning'], tools: ['api-builder', 'swagger-editor', 'postman-integration'], reportsTo: ['backend-lead'], security: 'high' },
      { id: 'database-engineer', name: 'Database Engineering Agent', tier: 'specialist', roma: 'L2', role: 'Database design, optimization, and migration specialist for PostgreSQL, MongoDB, and Redis', caps: ['schema-design', 'query-optimization', 'migration-management', 'indexing', 'replication'], tools: ['database-designer', 'query-profiler', 'migration-tool'], reportsTo: ['backend-lead'], security: 'critical' },
      { id: 'integration-developer', name: 'Integration Developer', tier: 'specialist', roma: 'L2', role: 'Builds integrations with third-party services, CRMs, payment gateways, and marketing platforms', caps: ['api-integration', 'webhook-management', 'data-mapping', 'error-handling', 'retry-logic'], tools: ['integration-platform', 'webhook-tester', 'data-mapper'], reportsTo: ['backend-lead'], security: 'high' },
      { id: 'auth-specialist', name: 'Authentication & Security Agent', tier: 'specialist', roma: 'L2', role: 'Implements authentication, authorization, and security measures including OAuth, JWT, and RBAC', caps: ['oauth-implementation', 'jwt-management', 'rbac-design', 'mfa', 'session-management', 'security-headers'], tools: ['auth-framework', 'security-scanner', 'token-manager'], reportsTo: ['backend-lead'], security: 'critical' },
      { id: 'cicd-engineer', name: 'CI/CD Pipeline Agent', tier: 'specialist', roma: 'L2', role: 'Builds and maintains CI/CD pipelines for automated testing, building, and deployment', caps: ['pipeline-design', 'build-optimization', 'deployment-automation', 'rollback-procedures', 'blue-green-deployment'], tools: ['cicd-platform', 'build-tool', 'deployment-tool'], reportsTo: ['devops-lead'], security: 'high' },
      { id: 'cloud-engineer', name: 'Cloud Infrastructure Agent', tier: 'specialist', roma: 'L2', role: 'Manages cloud infrastructure including servers, CDN, load balancers, and auto-scaling', caps: ['infrastructure-as-code', 'cdn-configuration', 'load-balancing', 'auto-scaling', 'cost-optimization'], tools: ['terraform', 'cloud-console', 'cost-analyzer'], reportsTo: ['devops-lead'], security: 'critical' },
      { id: 'monitoring-agent-web', name: 'Web Monitoring Agent', tier: 'worker', roma: 'L1', role: 'Monitors website uptime, performance, and error rates with automated alerting', caps: ['uptime-monitoring', 'error-tracking', 'performance-metrics', 'alerting', 'log-analysis'], tools: ['monitoring-platform', 'error-tracker', 'alert-manager'], reportsTo: ['devops-lead'], security: 'medium' },
      { id: 'security-ops-agent', name: 'Security Operations Agent', tier: 'specialist', roma: 'L2', role: 'Monitors and responds to security threats including XSS, CSRF, SQL injection, and DDoS', caps: ['threat-detection', 'vulnerability-scanning', 'incident-response', 'patch-management', 'waf-management'], tools: ['security-scanner', 'waf-manager', 'incident-responder'], reportsTo: ['devops-lead'], security: 'critical' },
      { id: 'ux-researcher', name: 'UX Research Agent', tier: 'specialist', roma: 'L2', role: 'Conducts user research including surveys, interviews, and behavioral analysis for design decisions', caps: ['survey-design', 'user-interviews', 'behavioral-analysis', 'persona-development', 'journey-mapping'], tools: ['survey-tool', 'interview-recorder', 'analytics-platform'], reportsTo: ['ux-lead'], security: 'medium' },
      { id: 'ui-designer', name: 'UI Design Agent', tier: 'specialist', roma: 'L2', role: 'Creates pixel-perfect UI designs following design systems and brand guidelines', caps: ['visual-design', 'component-design', 'responsive-layouts', 'dark-mode', 'design-tokens'], tools: ['design-tool', 'component-library', 'token-manager'], reportsTo: ['ux-lead'], security: 'medium' },
      { id: 'interaction-designer', name: 'Interaction Design Agent', tier: 'specialist', roma: 'L2', role: 'Designs interactive elements, micro-interactions, and user flow transitions', caps: ['interaction-patterns', 'micro-interactions', 'flow-design', 'gesture-design', 'feedback-design'], tools: ['prototype-tool', 'animation-studio', 'interaction-library'], reportsTo: ['ux-lead'], security: 'low' },
      { id: 'test-automation-agent', name: 'Test Automation Agent', tier: 'specialist', roma: 'L2', role: 'Builds and maintains automated test suites for unit, integration, and end-to-end testing', caps: ['unit-testing', 'integration-testing', 'e2e-testing', 'test-data-management', 'ci-integration'], tools: ['test-framework', 'e2e-runner', 'test-data-generator'], reportsTo: ['qa-lead'], security: 'medium' },
      { id: 'performance-tester-agent', name: 'Performance Testing Agent', tier: 'specialist', roma: 'L2', role: 'Conducts load testing, stress testing, and performance benchmarking for web applications', caps: ['load-testing', 'stress-testing', 'benchmarking', 'bottleneck-identification', 'capacity-planning'], tools: ['load-tester', 'profiler', 'benchmark-tool'], reportsTo: ['qa-lead'], security: 'medium' },
      { id: 'cross-browser-agent', name: 'Cross-Browser Testing Agent', tier: 'worker', roma: 'L1', role: 'Tests web applications across browsers, devices, and operating systems for compatibility', caps: ['browser-testing', 'device-testing', 'responsive-testing', 'screenshot-comparison'], tools: ['browser-stack', 'screenshot-tool', 'device-emulator'], reportsTo: ['qa-lead'], security: 'low' },
      { id: 'cms-specialist', name: 'CMS Integration Specialist', tier: 'specialist', roma: 'L2', role: 'Integrates and customizes CMS platforms for marketing content management', caps: ['cms-setup', 'template-development', 'plugin-management', 'content-modeling', 'api-integration'], tools: ['cms-platform', 'template-engine', 'plugin-manager'], reportsTo: ['web-dev-director'], security: 'high' },
      { id: 'landing-page-builder', name: 'Landing Page Builder Agent', tier: 'specialist', roma: 'L2', role: 'Rapidly builds conversion-optimized landing pages with A/B testing capabilities', caps: ['page-building', 'conversion-optimization', 'form-design', 'ab-testing', 'speed-optimization'], tools: ['page-builder', 'form-creator', 'ab-tester'], reportsTo: ['frontend-lead'], security: 'medium' },
      { id: 'email-template-builder', name: 'Email Template Developer', tier: 'specialist', roma: 'L2', role: 'Develops responsive HTML email templates compatible across email clients', caps: ['email-html', 'responsive-email', 'client-compatibility', 'template-systems', 'dynamic-content'], tools: ['email-builder', 'preview-tool', 'compatibility-tester'], reportsTo: ['frontend-lead'], security: 'medium' },
      { id: 'pwa-agent', name: 'PWA Development Agent', tier: 'specialist', roma: 'L2', role: 'Develops Progressive Web Apps with offline capabilities and native-like experiences', caps: ['service-workers', 'offline-first', 'push-notifications', 'app-shell', 'caching-strategies'], tools: ['pwa-toolkit', 'lighthouse', 'sw-debugger'], reportsTo: ['frontend-lead'], security: 'medium' },
      { id: 'analytics-implementation', name: 'Analytics Implementation Agent', tier: 'specialist', roma: 'L2', role: 'Implements marketing analytics including GA4, GTM, conversion tracking, and event tracking', caps: ['ga4-setup', 'gtm-configuration', 'event-tracking', 'conversion-setup', 'data-layer'], tools: ['gtm-manager', 'ga4-debugger', 'tag-validator'], reportsTo: ['web-dev-director'], security: 'high' },
      { id: 'seo-dev-agent', name: 'SEO Development Agent', tier: 'specialist', roma: 'L2', role: 'Implements technical SEO requirements in code including meta tags, structured data, and performance', caps: ['meta-implementation', 'schema-coding', 'ssr-seo', 'sitemap-generation', 'canonical-management'], tools: ['seo-checker', 'schema-validator', 'sitemap-generator'], reportsTo: ['web-dev-director'], security: 'medium' },
      { id: 'web-code-reviewer', name: 'Web Code Review Agent', tier: 'reviewer', roma: 'L2', role: 'Reviews web code for quality, security, performance, and best practices compliance', caps: ['code-review', 'security-audit', 'performance-review', 'best-practices', 'dependency-audit'], tools: ['linter', 'security-scanner', 'dependency-checker'], reportsTo: ['web-dev-director'], security: 'high' }
    ]
  },
  {
    id: 'sales-sdr',
    name: 'Sales SDR Automation',
    shortName: 'Sales/SDR',
    agentCount: 42,
    agents: [
      { id: 'sales-director', name: 'Sales Director', tier: 'director', roma: 'L4', role: 'Chief sales strategist leading outbound sales automation, pipeline management, and revenue optimization', caps: ['sales-strategy', 'pipeline-management', 'revenue-forecasting', 'team-coordination', 'deal-strategy', 'territory-planning', 'quota-management'], tools: ['crm-dashboard', 'pipeline-analyzer', 'forecast-model', 'territory-planner', 'quota-tracker', 'revenue-analytics'], manages: ['sdr-lead', 'ae-lead', 'sales-ops-lead', 'enablement-lead', 'sales-analytics-lead', 'enterprise-lead'], reportsTo: ['cro-agent'], security: 'critical' },
      { id: 'sdr-lead', name: 'SDR Team Lead', tier: 'manager', roma: 'L3', role: 'SDR operations manager leading prospecting, outreach sequencing, and qualification workflows', caps: ['prospecting-strategy', 'sequence-management', 'qualification-frameworks', 'cadence-optimization', 'team-coaching'], tools: ['sequence-builder', 'prospect-enrichment', 'qualification-scorecard', 'cadence-manager'], manages: ['prospector-agent', 'email-sdr', 'linkedin-sdr', 'phone-sdr', 'qualification-agent', 'lead-enrichment-agent'], reportsTo: ['sales-director'], security: 'high' },
      { id: 'ae-lead', name: 'Account Executive Lead', tier: 'manager', roma: 'L3', role: 'AE team manager overseeing deal progression, proposal creation, and closing strategies', caps: ['deal-management', 'proposal-creation', 'negotiation-strategy', 'presentation-design', 'objection-handling'], tools: ['deal-tracker', 'proposal-builder', 'presentation-tool', 'contract-manager'], manages: ['demo-agent', 'proposal-agent', 'negotiation-agent', 'contract-agent'], reportsTo: ['sales-director'], security: 'high' },
      { id: 'sales-ops-lead', name: 'Sales Operations Lead', tier: 'manager', roma: 'L3', role: 'Sales operations manager optimizing CRM workflows, automation, and data quality', caps: ['crm-management', 'workflow-automation', 'data-quality', 'reporting', 'tool-administration'], tools: ['crm-admin', 'automation-builder', 'data-cleaner', 'report-generator'], manages: ['crm-agent', 'data-quality-agent', 'workflow-agent', 'reporting-agent-sales'], reportsTo: ['sales-director'], security: 'high' },
      { id: 'enablement-lead', name: 'Sales Enablement Lead', tier: 'manager', roma: 'L3', role: 'Sales enablement manager creating training materials, playbooks, and competitive intelligence', caps: ['training-creation', 'playbook-development', 'competitive-intelligence', 'content-management', 'onboarding'], tools: ['training-platform', 'playbook-builder', 'competitive-tracker', 'content-library'], manages: ['training-agent', 'playbook-agent', 'competitive-intel-agent', 'content-curator-sales'], reportsTo: ['sales-director'], security: 'high' },
      { id: 'sales-analytics-lead', name: 'Sales Analytics Lead', tier: 'manager', roma: 'L3', role: 'Sales analytics manager providing pipeline insights, conversion analysis, and revenue forecasting', caps: ['pipeline-analytics', 'conversion-analysis', 'revenue-forecasting', 'activity-metrics', 'win-loss-analysis'], tools: ['analytics-dashboard', 'forecast-engine', 'conversion-tracker', 'win-loss-analyzer'], manages: ['pipeline-analyst', 'forecast-agent', 'activity-tracker-agent'], reportsTo: ['sales-director'], security: 'high' },
      { id: 'enterprise-lead', name: 'Enterprise Sales Lead', tier: 'manager', roma: 'L3', role: 'Enterprise sales strategist managing complex multi-stakeholder deals and strategic accounts', caps: ['enterprise-strategy', 'stakeholder-mapping', 'multi-thread-selling', 'executive-engagement', 'strategic-planning'], tools: ['account-planner', 'stakeholder-mapper', 'engagement-tracker'], manages: ['account-planner-agent', 'executive-engagement-agent', 'solution-architect-agent'], reportsTo: ['sales-director'], security: 'critical' },
      { id: 'prospector-agent', name: 'Prospecting Agent', tier: 'specialist', roma: 'L2', role: 'AI-powered prospect identification using firmographic, technographic, and intent data', caps: ['prospect-identification', 'ideal-customer-profiling', 'intent-signal-detection', 'contact-finding', 'list-building'], tools: ['prospect-database', 'intent-tracker', 'contact-finder'], reportsTo: ['sdr-lead'], security: 'medium' },
      { id: 'email-sdr', name: 'Email SDR Agent', tier: 'specialist', roma: 'L2', role: 'Automated email outreach specialist crafting personalized cold emails and follow-up sequences', caps: ['email-personalization', 'sequence-creation', 'ab-testing', 'deliverability-optimization', 'reply-detection'], tools: ['email-sequencer', 'personalization-engine', 'deliverability-checker'], reportsTo: ['sdr-lead'], security: 'medium' },
      { id: 'linkedin-sdr', name: 'LinkedIn SDR Agent', tier: 'specialist', roma: 'L2', role: 'LinkedIn outreach specialist managing connection requests, InMails, and social selling activities', caps: ['linkedin-outreach', 'connection-strategy', 'inmail-writing', 'social-selling', 'profile-optimization'], tools: ['linkedin-automation', 'inmail-writer', 'social-selling-tracker'], reportsTo: ['sdr-lead'], security: 'medium' },
      { id: 'phone-sdr', name: 'Phone SDR Agent', tier: 'specialist', roma: 'L2', role: 'Phone outreach specialist with AI-powered call scripts, voicemail drops, and conversation intelligence', caps: ['call-scripting', 'voicemail-optimization', 'conversation-intelligence', 'objection-handling', 'meeting-booking'], tools: ['dialer', 'script-engine', 'call-recorder', 'meeting-scheduler'], reportsTo: ['sdr-lead'], security: 'medium' },
      { id: 'qualification-agent', name: 'Lead Qualification Agent', tier: 'specialist', roma: 'L2', role: 'Qualifies inbound and outbound leads using BANT, MEDDIC, and custom frameworks', caps: ['lead-scoring', 'framework-application', 'data-enrichment', 'routing-logic', 'prioritization'], tools: ['scoring-engine', 'enrichment-tool', 'routing-system'], reportsTo: ['sdr-lead'], security: 'medium' },
      { id: 'lead-enrichment-agent', name: 'Lead Enrichment Agent', tier: 'worker', roma: 'L1', role: 'Enriches lead data with firmographic, technographic, and social information', caps: ['data-enrichment', 'company-research', 'tech-stack-detection', 'social-profiling'], tools: ['enrichment-api', 'company-database', 'tech-detector'], reportsTo: ['sdr-lead'], security: 'medium' },
      { id: 'demo-agent', name: 'Demo Preparation Agent', tier: 'specialist', roma: 'L2', role: 'Prepares customized product demos with prospect-specific use cases and talking points', caps: ['demo-customization', 'use-case-mapping', 'talking-points', 'feature-highlighting', 'competition-comparison'], tools: ['demo-builder', 'use-case-library', 'competitive-matrix'], reportsTo: ['ae-lead'], security: 'medium' },
      { id: 'proposal-agent', name: 'Proposal Generation Agent', tier: 'specialist', roma: 'L2', role: 'Creates customized sales proposals with ROI calculations, case studies, and pricing', caps: ['proposal-creation', 'roi-calculation', 'case-study-selection', 'pricing-configuration', 'document-design'], tools: ['proposal-builder', 'roi-calculator', 'case-study-library'], reportsTo: ['ae-lead'], security: 'high' },
      { id: 'negotiation-agent', name: 'Negotiation Strategy Agent', tier: 'specialist', roma: 'L3', role: 'Provides real-time negotiation guidance including pricing strategy and concession management', caps: ['negotiation-tactics', 'pricing-strategy', 'concession-management', 'win-win-framing', 'deal-structuring'], tools: ['negotiation-playbook', 'pricing-engine', 'deal-analyzer'], reportsTo: ['ae-lead'], security: 'high' },
      { id: 'contract-agent', name: 'Contract Management Agent', tier: 'specialist', roma: 'L2', role: 'Manages contract creation, redlining, and approval workflows', caps: ['contract-generation', 'clause-management', 'approval-routing', 'signature-tracking', 'renewal-management'], tools: ['contract-builder', 'clause-library', 'signature-platform'], reportsTo: ['ae-lead'], security: 'critical' },
      { id: 'crm-agent', name: 'CRM Management Agent', tier: 'specialist', roma: 'L2', role: 'Maintains CRM data quality, automates updates, and ensures pipeline accuracy', caps: ['data-entry-automation', 'duplicate-detection', 'field-validation', 'activity-logging', 'pipeline-hygiene'], tools: ['crm-connector', 'dedup-tool', 'validation-engine'], reportsTo: ['sales-ops-lead'], security: 'medium' },
      { id: 'data-quality-agent', name: 'Data Quality Agent', tier: 'worker', roma: 'L1', role: 'Monitors and maintains sales data quality including contact accuracy and account completeness', caps: ['data-validation', 'accuracy-scoring', 'completion-tracking', 'decay-detection'], tools: ['data-validator', 'accuracy-checker', 'decay-monitor'], reportsTo: ['sales-ops-lead'], security: 'medium' },
      { id: 'workflow-agent', name: 'Sales Workflow Automator', tier: 'specialist', roma: 'L2', role: 'Builds and maintains automated sales workflows for lead routing, task assignment, and notifications', caps: ['workflow-design', 'trigger-management', 'routing-logic', 'notification-automation'], tools: ['workflow-builder', 'trigger-engine', 'notification-system'], reportsTo: ['sales-ops-lead'], security: 'medium' },
      { id: 'reporting-agent-sales', name: 'Sales Reporting Agent', tier: 'worker', roma: 'L1', role: 'Generates automated sales reports including pipeline reviews, activity reports, and forecasts', caps: ['report-generation', 'dashboard-creation', 'data-visualization', 'executive-summaries'], tools: ['report-builder', 'dashboard-creator', 'visualization-tool'], reportsTo: ['sales-ops-lead'], security: 'medium' },
      { id: 'training-agent', name: 'Sales Training Agent', tier: 'specialist', roma: 'L2', role: 'Creates and delivers AI-powered sales training content and role-play scenarios', caps: ['training-content', 'role-play-scenarios', 'skill-assessment', 'coaching-recommendations'], tools: ['training-platform', 'role-play-engine', 'assessment-tool'], reportsTo: ['enablement-lead'], security: 'medium' },
      { id: 'playbook-agent', name: 'Sales Playbook Agent', tier: 'specialist', roma: 'L2', role: 'Creates and maintains sales playbooks for different segments, verticals, and scenarios', caps: ['playbook-creation', 'scenario-mapping', 'best-practice-documentation', 'template-management'], tools: ['playbook-builder', 'scenario-mapper', 'template-library'], reportsTo: ['enablement-lead'], security: 'medium' },
      { id: 'competitive-intel-agent', name: 'Competitive Intelligence Agent', tier: 'specialist', roma: 'L3', role: 'Gathers and analyzes competitive intelligence for sales battle cards and positioning', caps: ['competitor-monitoring', 'battle-card-creation', 'win-loss-analysis', 'feature-comparison', 'pricing-intelligence'], tools: ['competitor-tracker', 'battle-card-builder', 'win-loss-tool'], reportsTo: ['enablement-lead'], security: 'high' },
      { id: 'content-curator-sales', name: 'Sales Content Curator', tier: 'worker', roma: 'L1', role: 'Curates and organizes sales content including case studies, whitepapers, and one-pagers', caps: ['content-organization', 'relevance-tagging', 'usage-tracking', 'recommendation-engine'], tools: ['content-library', 'tagging-system', 'recommendation-engine'], reportsTo: ['enablement-lead'], security: 'low' },
      { id: 'pipeline-analyst', name: 'Pipeline Analysis Agent', tier: 'specialist', roma: 'L2', role: 'Analyzes sales pipeline health, stage velocity, and conversion bottlenecks', caps: ['pipeline-analysis', 'stage-velocity', 'bottleneck-detection', 'deal-health-scoring', 'risk-identification'], tools: ['pipeline-analyzer', 'velocity-tracker', 'health-scorer'], reportsTo: ['sales-analytics-lead'], security: 'medium' },
      { id: 'forecast-agent', name: 'Revenue Forecasting Agent', tier: 'specialist', roma: 'L3', role: 'AI-powered revenue forecasting using deal signals, historical data, and market conditions', caps: ['ai-forecasting', 'deal-signal-analysis', 'scenario-modeling', 'accuracy-tracking'], tools: ['forecast-model', 'signal-analyzer', 'scenario-planner'], reportsTo: ['sales-analytics-lead'], security: 'high' },
      { id: 'activity-tracker-agent', name: 'Sales Activity Tracker', tier: 'worker', roma: 'L1', role: 'Tracks and reports on sales team activities including calls, emails, meetings, and tasks', caps: ['activity-logging', 'productivity-tracking', 'goal-monitoring', 'leaderboard-generation'], tools: ['activity-tracker', 'productivity-dashboard', 'leaderboard-tool'], reportsTo: ['sales-analytics-lead'], security: 'medium' },
      { id: 'account-planner-agent', name: 'Strategic Account Planner', tier: 'specialist', roma: 'L3', role: 'Creates comprehensive account plans for enterprise deals with stakeholder mapping', caps: ['account-planning', 'stakeholder-mapping', 'opportunity-identification', 'relationship-tracking'], tools: ['account-planner', 'stakeholder-mapper', 'opportunity-finder'], reportsTo: ['enterprise-lead'], security: 'high' },
      { id: 'executive-engagement-agent', name: 'Executive Engagement Agent', tier: 'specialist', roma: 'L3', role: 'Manages executive-level communications and engagement strategies for enterprise deals', caps: ['executive-communication', 'sponsorship-building', 'qbr-preparation', 'value-documentation'], tools: ['executive-tracker', 'communication-planner', 'qbr-builder'], reportsTo: ['enterprise-lead'], security: 'critical' },
      { id: 'solution-architect-agent', name: 'Sales Solution Architect', tier: 'specialist', roma: 'L3', role: 'Technical pre-sales specialist designing solution architectures for enterprise prospects', caps: ['solution-design', 'technical-evaluation', 'integration-planning', 'poc-management', 'architecture-presentation'], tools: ['solution-designer', 'integration-planner', 'poc-manager'], reportsTo: ['enterprise-lead'], security: 'high' },
      { id: 'referral-agent', name: 'Referral Program Agent', tier: 'specialist', roma: 'L2', role: 'Manages customer referral programs and partner-sourced pipeline generation', caps: ['referral-tracking', 'partner-management', 'incentive-optimization', 'pipeline-attribution'], tools: ['referral-tracker', 'partner-portal', 'incentive-manager'], reportsTo: ['sales-director'], security: 'medium' },
      { id: 'territory-agent', name: 'Territory Management Agent', tier: 'specialist', roma: 'L2', role: 'Manages sales territory assignments, coverage optimization, and capacity planning', caps: ['territory-mapping', 'coverage-analysis', 'capacity-planning', 'reassignment-logic'], tools: ['territory-mapper', 'coverage-analyzer', 'capacity-planner'], reportsTo: ['sales-ops-lead'], security: 'medium' },
      { id: 'upsell-agent', name: 'Upsell & Cross-sell Agent', tier: 'specialist', roma: 'L2', role: 'Identifies and executes upsell and cross-sell opportunities within existing accounts', caps: ['opportunity-detection', 'propensity-scoring', 'offer-creation', 'timing-optimization'], tools: ['opportunity-finder', 'propensity-scorer', 'offer-builder'], reportsTo: ['ae-lead'], security: 'medium' },
      { id: 'churn-prevention-agent', name: 'Churn Prevention Agent', tier: 'specialist', roma: 'L3', role: 'Predicts and prevents customer churn using engagement signals and satisfaction data', caps: ['churn-prediction', 'risk-scoring', 'intervention-planning', 'health-monitoring'], tools: ['churn-predictor', 'risk-scorer', 'intervention-planner'], reportsTo: ['sales-director'], security: 'high' },
      { id: 'deal-review-agent', name: 'Deal Review Agent', tier: 'reviewer', roma: 'L3', role: 'Reviews deal health, methodology adherence, and provides coaching recommendations', caps: ['deal-inspection', 'methodology-audit', 'risk-assessment', 'coaching-feedback'], tools: ['deal-inspector', 'methodology-checker', 'coaching-engine'], reportsTo: ['sales-director'], security: 'high' }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Marketing',
    shortName: 'WhatsApp Marketing',
    agentCount: 28,
    agents: [
      { id: 'whatsapp-director', name: 'WhatsApp Marketing Director', tier: 'director', roma: 'L4', role: 'Chief WhatsApp business strategist leading conversational commerce, broadcast campaigns, and chatbot automation', caps: ['whatsapp-strategy', 'conversational-commerce', 'broadcast-management', 'chatbot-architecture', 'compliance-management', 'roi-optimization'], tools: ['whatsapp-business-api', 'broadcast-manager', 'chatbot-builder', 'analytics-dashboard', 'compliance-checker', 'flow-designer'], manages: ['chatbot-lead', 'broadcast-lead', 'commerce-lead', 'wa-analytics-lead'], reportsTo: ['cmo-agent'], security: 'critical' },
      { id: 'chatbot-lead', name: 'Chatbot Development Lead', tier: 'manager', roma: 'L3', role: 'Chatbot architecture and development manager building conversational AI flows', caps: ['flow-design', 'nlu-training', 'conversation-design', 'integration-management', 'testing'], tools: ['flow-builder', 'nlu-trainer', 'conversation-tester', 'integration-platform'], manages: ['flow-designer-agent', 'nlu-agent', 'conversation-agent', 'wa-integration-agent'], reportsTo: ['whatsapp-director'], security: 'high' },
      { id: 'broadcast-lead', name: 'Broadcast Campaign Lead', tier: 'manager', roma: 'L3', role: 'WhatsApp broadcast campaign manager handling template creation, audience segmentation, and delivery optimization', caps: ['template-management', 'audience-segmentation', 'delivery-optimization', 'ab-testing', 'compliance'], tools: ['template-builder', 'segment-manager', 'delivery-optimizer', 'ab-tester'], manages: ['template-agent', 'segment-agent', 'delivery-agent', 'wa-copywriter'], reportsTo: ['whatsapp-director'], security: 'high' },
      { id: 'commerce-lead', name: 'WhatsApp Commerce Lead', tier: 'manager', roma: 'L3', role: 'WhatsApp commerce strategist managing catalogs, payments, and conversational selling', caps: ['catalog-management', 'payment-integration', 'conversational-selling', 'order-management', 'cart-recovery'], tools: ['catalog-manager', 'payment-gateway', 'order-tracker', 'cart-recovery-tool'], manages: ['catalog-agent', 'payment-agent', 'order-agent', 'cart-recovery-agent'], reportsTo: ['whatsapp-director'], security: 'critical' },
      { id: 'wa-analytics-lead', name: 'WhatsApp Analytics Lead', tier: 'manager', roma: 'L3', role: 'WhatsApp performance analytics manager tracking message delivery, engagement, and conversion', caps: ['message-analytics', 'engagement-tracking', 'conversion-attribution', 'funnel-analysis', 'reporting'], tools: ['analytics-dashboard', 'conversion-tracker', 'funnel-analyzer', 'report-builder'], manages: ['wa-metrics-agent', 'wa-reporter', 'wa-optimization-agent'], reportsTo: ['whatsapp-director'], security: 'high' },
      { id: 'flow-designer-agent', name: 'WhatsApp Flow Designer', tier: 'specialist', roma: 'L2', role: 'Designs WhatsApp conversation flows including menus, buttons, and interactive elements', caps: ['flow-design', 'interactive-elements', 'fallback-handling', 'context-management'], tools: ['flow-builder', 'element-library', 'preview-tool'], reportsTo: ['chatbot-lead'], security: 'medium' },
      { id: 'nlu-agent', name: 'WhatsApp NLU Agent', tier: 'specialist', roma: 'L2', role: 'Trains and maintains natural language understanding models for WhatsApp chatbot intent recognition', caps: ['intent-training', 'entity-extraction', 'language-detection', 'sentiment-analysis'], tools: ['nlu-trainer', 'entity-extractor', 'language-detector'], reportsTo: ['chatbot-lead'], security: 'medium' },
      { id: 'conversation-agent', name: 'Conversational AI Agent', tier: 'specialist', roma: 'L2', role: 'Handles real-time WhatsApp conversations with context-aware AI responses', caps: ['conversation-handling', 'context-tracking', 'personalization', 'handoff-management', 'multilingual-support'], tools: ['conversation-engine', 'context-tracker', 'personalization-engine'], reportsTo: ['chatbot-lead'], security: 'medium' },
      { id: 'wa-integration-agent', name: 'WhatsApp Integration Agent', tier: 'specialist', roma: 'L2', role: 'Integrates WhatsApp with CRM, ERP, and marketing platforms', caps: ['api-integration', 'webhook-management', 'data-sync', 'event-triggering'], tools: ['integration-platform', 'webhook-manager', 'sync-engine'], reportsTo: ['chatbot-lead'], security: 'high' },
      { id: 'template-agent', name: 'Template Management Agent', tier: 'specialist', roma: 'L2', role: 'Creates and manages WhatsApp message templates with Meta approval compliance', caps: ['template-creation', 'approval-management', 'variable-handling', 'category-selection'], tools: ['template-builder', 'approval-tracker', 'variable-manager'], reportsTo: ['broadcast-lead'], security: 'medium' },
      { id: 'segment-agent', name: 'Audience Segmentation Agent', tier: 'specialist', roma: 'L2', role: 'Creates targeted audience segments for WhatsApp campaigns based on behavior and demographics', caps: ['segment-creation', 'behavioral-targeting', 'demographic-filtering', 'lookalike-audiences'], tools: ['segment-builder', 'behavioral-tracker', 'demographic-filter'], reportsTo: ['broadcast-lead'], security: 'medium' },
      { id: 'delivery-agent', name: 'Message Delivery Agent', tier: 'worker', roma: 'L1', role: 'Manages message delivery optimization including timing, throttling, and retry logic', caps: ['delivery-scheduling', 'rate-limiting', 'retry-management', 'queue-optimization'], tools: ['delivery-engine', 'rate-limiter', 'queue-manager'], reportsTo: ['broadcast-lead'], security: 'medium' },
      { id: 'wa-copywriter', name: 'WhatsApp Copywriter', tier: 'specialist', roma: 'L2', role: 'Writes engaging WhatsApp message copy optimized for conversational commerce', caps: ['message-copywriting', 'cta-optimization', 'emoji-strategy', 'character-optimization', 'multilingual-copy'], tools: ['copy-editor', 'cta-tester', 'multilingual-tool'], reportsTo: ['broadcast-lead'], security: 'medium' },
      { id: 'catalog-agent', name: 'WhatsApp Catalog Agent', tier: 'specialist', roma: 'L2', role: 'Manages WhatsApp product catalogs with pricing, descriptions, and inventory sync', caps: ['catalog-creation', 'product-management', 'inventory-sync', 'pricing-updates'], tools: ['catalog-manager', 'inventory-syncer', 'pricing-tool'], reportsTo: ['commerce-lead'], security: 'high' },
      { id: 'payment-agent', name: 'WhatsApp Payment Agent', tier: 'specialist', roma: 'L2', role: 'Manages WhatsApp payment integration including UPI, payment links, and receipt generation', caps: ['payment-processing', 'upi-integration', 'payment-link-generation', 'receipt-management'], tools: ['payment-gateway', 'upi-connector', 'receipt-generator'], reportsTo: ['commerce-lead'], security: 'critical' },
      { id: 'order-agent', name: 'Order Management Agent', tier: 'worker', roma: 'L1', role: 'Manages order lifecycle from placement to delivery tracking via WhatsApp', caps: ['order-tracking', 'status-updates', 'shipping-notifications', 'delivery-confirmation'], tools: ['order-tracker', 'notification-engine', 'shipping-connector'], reportsTo: ['commerce-lead'], security: 'medium' },
      { id: 'cart-recovery-agent', name: 'Cart Recovery Agent', tier: 'specialist', roma: 'L2', role: 'Automates abandoned cart recovery campaigns via WhatsApp with personalized incentives', caps: ['abandonment-detection', 'recovery-sequences', 'incentive-optimization', 'timing-optimization'], tools: ['cart-detector', 'recovery-sequencer', 'incentive-engine'], reportsTo: ['commerce-lead'], security: 'medium' },
      { id: 'wa-metrics-agent', name: 'WhatsApp Metrics Agent', tier: 'specialist', roma: 'L2', role: 'Tracks and analyzes WhatsApp business metrics including delivery, read, and response rates', caps: ['metric-tracking', 'rate-calculation', 'trend-analysis', 'benchmark-comparison'], tools: ['metrics-dashboard', 'rate-calculator', 'trend-analyzer'], reportsTo: ['wa-analytics-lead'], security: 'medium' },
      { id: 'wa-reporter', name: 'WhatsApp Reporting Agent', tier: 'worker', roma: 'L1', role: 'Generates automated WhatsApp campaign reports with visualizations', caps: ['report-generation', 'data-visualization', 'executive-summaries'], tools: ['report-builder', 'chart-generator', 'pdf-exporter'], reportsTo: ['wa-analytics-lead'], security: 'medium' },
      { id: 'wa-optimization-agent', name: 'WhatsApp Optimization Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes WhatsApp campaigns based on performance data and engagement patterns', caps: ['performance-optimization', 'timing-optimization', 'content-optimization', 'audience-refinement'], tools: ['optimizer-engine', 'timing-analyzer', 'content-scorer'], reportsTo: ['wa-analytics-lead'], security: 'medium' },
      { id: 'wa-support-agent', name: 'WhatsApp Customer Support', tier: 'specialist', roma: 'L2', role: 'Provides automated customer support via WhatsApp with intelligent routing and resolution', caps: ['support-automation', 'ticket-creation', 'resolution-tracking', 'escalation-management', 'faq-handling'], tools: ['support-engine', 'ticket-system', 'faq-database'], reportsTo: ['whatsapp-director'], security: 'high' },
      { id: 'wa-localization-agent', name: 'WhatsApp Localization Agent', tier: 'specialist', roma: 'L2', role: 'Localizes WhatsApp content for Indian languages and regional preferences', caps: ['language-translation', 'cultural-adaptation', 'regional-pricing', 'festival-campaigns'], tools: ['translation-engine', 'cultural-database', 'festival-calendar'], reportsTo: ['whatsapp-director'], security: 'medium' },
      { id: 'wa-compliance-agent', name: 'WhatsApp Compliance Agent', tier: 'reviewer', roma: 'L2', role: 'Ensures WhatsApp business communications comply with Meta policies and regulations', caps: ['policy-compliance', 'opt-in-management', 'frequency-control', 'content-review'], tools: ['compliance-checker', 'opt-in-manager', 'frequency-controller'], reportsTo: ['whatsapp-director'], security: 'critical' },
      { id: 'wa-automation-agent', name: 'WhatsApp Workflow Automator', tier: 'specialist', roma: 'L2', role: 'Automates WhatsApp business workflows including drip campaigns and event-triggered messages', caps: ['drip-campaigns', 'event-triggers', 'conditional-logic', 'time-based-automation'], tools: ['automation-builder', 'trigger-engine', 'condition-manager'], reportsTo: ['whatsapp-director'], security: 'medium' },
      { id: 'wa-group-agent', name: 'WhatsApp Group Management Agent', tier: 'worker', roma: 'L1', role: 'Manages WhatsApp community groups including moderation, engagement, and content distribution', caps: ['group-management', 'content-moderation', 'engagement-driving', 'member-management'], tools: ['group-manager', 'moderation-tool', 'engagement-tracker'], reportsTo: ['whatsapp-director'], security: 'medium' },
      { id: 'wa-voice-agent', name: 'WhatsApp Voice Agent', tier: 'specialist', roma: 'L2', role: 'Handles voice messages on WhatsApp with STT processing and intelligent responses', caps: ['voice-processing', 'stt-integration', 'voice-response', 'language-detection'], tools: ['stt-engine', 'voice-processor', 'response-generator'], reportsTo: ['chatbot-lead'], security: 'medium' },
      { id: 'wa-media-agent', name: 'WhatsApp Media Agent', tier: 'worker', roma: 'L1', role: 'Manages media content for WhatsApp including images, videos, and documents', caps: ['media-optimization', 'format-conversion', 'size-compression', 'watermarking'], tools: ['media-processor', 'format-converter', 'compression-tool'], reportsTo: ['broadcast-lead'], security: 'low' }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn B2B',
    shortName: 'LinkedIn B2B',
    agentCount: 32,
    agents: [
      { id: 'linkedin-director', name: 'LinkedIn Marketing Director', tier: 'director', roma: 'L4', role: 'Chief LinkedIn B2B strategist leading organic growth, thought leadership, lead generation, and LinkedIn Ads', caps: ['linkedin-strategy', 'thought-leadership', 'lead-generation', 'company-page-management', 'linkedin-ads', 'employee-advocacy', 'social-selling'], tools: ['linkedin-analytics', 'campaign-manager', 'lead-gen-forms', 'page-manager', 'content-planner', 'advocacy-platform'], manages: ['organic-lead', 'paid-lead', 'thought-leadership-lead', 'lead-gen-lead', 'li-analytics-lead'], reportsTo: ['cmo-agent'], security: 'critical' },
      { id: 'organic-lead', name: 'LinkedIn Organic Lead', tier: 'manager', roma: 'L3', role: 'Organic LinkedIn content strategist managing posts, articles, newsletters, and engagement', caps: ['content-strategy', 'newsletter-management', 'algorithm-optimization', 'carousel-creation', 'engagement-strategy'], tools: ['content-planner', 'post-scheduler', 'engagement-tracker', 'newsletter-manager'], manages: ['li-post-creator', 'li-article-writer', 'li-engagement-agent', 'li-newsletter-agent', 'li-carousel-creator'], reportsTo: ['linkedin-director'], security: 'high' },
      { id: 'paid-lead', name: 'LinkedIn Ads Lead', tier: 'manager', roma: 'L3', role: 'LinkedIn paid advertising strategist managing sponsored content, InMail, and lead gen campaigns', caps: ['campaign-management', 'targeting-strategy', 'bid-optimization', 'creative-testing', 'budget-allocation'], tools: ['campaign-manager', 'audience-builder', 'bid-optimizer', 'creative-tester'], manages: ['li-campaign-agent', 'li-targeting-agent', 'li-creative-agent', 'li-bid-agent'], reportsTo: ['linkedin-director'], security: 'high' },
      { id: 'thought-leadership-lead', name: 'Thought Leadership Lead', tier: 'manager', roma: 'L3', role: 'Thought leadership strategist developing executive brand presence and industry authority', caps: ['executive-branding', 'content-curation', 'speaking-opportunities', 'publication-strategy', 'network-building'], tools: ['content-planner', 'opportunity-finder', 'network-analyzer', 'publication-tracker'], manages: ['executive-ghostwriter', 'industry-analyst-agent', 'speaking-agent'], reportsTo: ['linkedin-director'], security: 'high' },
      { id: 'lead-gen-lead', name: 'LinkedIn Lead Generation Lead', tier: 'manager', roma: 'L3', role: 'LinkedIn lead generation strategist managing Sales Navigator, outreach sequences, and lead forms', caps: ['lead-gen-strategy', 'sales-navigator', 'outreach-automation', 'form-optimization', 'pipeline-management'], tools: ['sales-navigator', 'outreach-sequencer', 'lead-form-builder', 'pipeline-tracker'], manages: ['navigator-agent', 'li-outreach-agent', 'lead-form-agent', 'li-lead-scorer'], reportsTo: ['linkedin-director'], security: 'high' },
      { id: 'li-analytics-lead', name: 'LinkedIn Analytics Lead', tier: 'manager', roma: 'L3', role: 'LinkedIn performance analytics manager tracking engagement, reach, and conversion metrics', caps: ['performance-analytics', 'audience-insights', 'content-analytics', 'conversion-tracking', 'reporting'], tools: ['analytics-dashboard', 'audience-analyzer', 'conversion-tracker', 'report-builder'], manages: ['li-metrics-agent', 'li-reporter', 'li-benchmark-agent'], reportsTo: ['linkedin-director'], security: 'high' },
      { id: 'li-post-creator', name: 'LinkedIn Post Creator', tier: 'specialist', roma: 'L2', role: 'Creates engaging LinkedIn posts optimized for algorithm reach and professional engagement', caps: ['post-writing', 'hook-creation', 'storytelling', 'cta-optimization', 'hashtag-strategy'], tools: ['post-editor', 'hook-generator', 'hashtag-tool'], reportsTo: ['organic-lead'], security: 'medium' },
      { id: 'li-article-writer', name: 'LinkedIn Article Writer', tier: 'specialist', roma: 'L2', role: 'Writes long-form LinkedIn articles establishing thought leadership and expertise', caps: ['article-writing', 'seo-optimization', 'research-integration', 'formatting', 'distribution'], tools: ['article-editor', 'seo-checker', 'research-tool'], reportsTo: ['organic-lead'], security: 'medium' },
      { id: 'li-engagement-agent', name: 'LinkedIn Engagement Agent', tier: 'worker', roma: 'L1', role: 'Manages LinkedIn engagement including comments, reactions, and conversation participation', caps: ['comment-management', 'conversation-participation', 'relationship-building', 'network-engagement'], tools: ['engagement-tracker', 'comment-generator', 'notification-manager'], reportsTo: ['organic-lead'], security: 'medium' },
      { id: 'li-newsletter-agent', name: 'LinkedIn Newsletter Agent', tier: 'specialist', roma: 'L2', role: 'Creates and manages LinkedIn newsletters with subscriber growth and engagement optimization', caps: ['newsletter-creation', 'subscriber-growth', 'content-curation', 'distribution-optimization'], tools: ['newsletter-editor', 'subscriber-tracker', 'distribution-optimizer'], reportsTo: ['organic-lead'], security: 'medium' },
      { id: 'li-carousel-creator', name: 'LinkedIn Carousel Creator', tier: 'specialist', roma: 'L2', role: 'Designs LinkedIn document/carousel posts optimized for save and share engagement', caps: ['carousel-design', 'document-creation', 'visual-storytelling', 'data-visualization'], tools: ['carousel-designer', 'document-builder', 'design-templates'], reportsTo: ['organic-lead'], security: 'medium' },
      { id: 'li-campaign-agent', name: 'LinkedIn Campaign Agent', tier: 'specialist', roma: 'L2', role: 'Manages LinkedIn ad campaigns including setup, monitoring, and optimization', caps: ['campaign-setup', 'performance-monitoring', 'optimization', 'budget-management'], tools: ['campaign-manager', 'performance-dashboard', 'budget-tracker'], reportsTo: ['paid-lead'], security: 'high' },
      { id: 'li-targeting-agent', name: 'LinkedIn Targeting Agent', tier: 'specialist', roma: 'L2', role: 'Creates precision B2B audience targeting using LinkedIn firmographic and job title data', caps: ['audience-creation', 'firmographic-targeting', 'job-title-targeting', 'company-matching', 'lookalike-audiences'], tools: ['audience-builder', 'firmographic-database', 'matching-tool'], reportsTo: ['paid-lead'], security: 'medium' },
      { id: 'li-creative-agent', name: 'LinkedIn Ad Creative Agent', tier: 'specialist', roma: 'L2', role: 'Creates LinkedIn ad creatives including sponsored content, InMail, and dynamic ads', caps: ['ad-creative-design', 'copy-optimization', 'image-selection', 'format-testing', 'ab-testing'], tools: ['creative-studio', 'copy-optimizer', 'ab-tester'], reportsTo: ['paid-lead'], security: 'medium' },
      { id: 'li-bid-agent', name: 'LinkedIn Bid Optimization Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes LinkedIn ad bidding strategies for cost-effective lead acquisition', caps: ['bid-strategy', 'cost-optimization', 'pacing-management', 'competitive-analysis'], tools: ['bid-optimizer', 'cost-analyzer', 'competitive-tracker'], reportsTo: ['paid-lead'], security: 'medium' },
      { id: 'executive-ghostwriter', name: 'Executive Ghostwriter', tier: 'specialist', roma: 'L3', role: 'Ghostwrites LinkedIn content for C-suite executives maintaining their unique voice and expertise', caps: ['executive-voice', 'industry-insights', 'storytelling', 'controversy-avoidance', 'personal-branding'], tools: ['voice-analyzer', 'industry-monitor', 'brand-guide'], reportsTo: ['thought-leadership-lead'], security: 'critical' },
      { id: 'industry-analyst-agent', name: 'Industry Analysis Agent', tier: 'specialist', roma: 'L2', role: 'Researches and analyzes industry trends for LinkedIn thought leadership content', caps: ['industry-research', 'trend-analysis', 'data-interpretation', 'insight-generation'], tools: ['research-tool', 'trend-tracker', 'data-analyzer'], reportsTo: ['thought-leadership-lead'], security: 'medium' },
      { id: 'speaking-agent', name: 'Speaking Opportunity Agent', tier: 'specialist', roma: 'L2', role: 'Identifies and manages LinkedIn Events, Webinars, and speaking opportunity promotion', caps: ['event-identification', 'promotion-strategy', 'registration-management', 'follow-up-campaigns'], tools: ['event-finder', 'promotion-tool', 'registration-tracker'], reportsTo: ['thought-leadership-lead'], security: 'medium' },
      { id: 'navigator-agent', name: 'Sales Navigator Agent', tier: 'specialist', roma: 'L2', role: 'Leverages Sales Navigator for advanced prospect identification and account-based targeting', caps: ['advanced-search', 'lead-lists', 'account-mapping', 'signal-monitoring', 'relationship-scoring'], tools: ['sales-navigator', 'lead-builder', 'signal-tracker'], reportsTo: ['lead-gen-lead'], security: 'high' },
      { id: 'li-outreach-agent', name: 'LinkedIn Outreach Agent', tier: 'specialist', roma: 'L2', role: 'Manages personalized LinkedIn outreach including connection requests and InMail campaigns', caps: ['connection-requests', 'inmail-personalization', 'follow-up-sequences', 'response-management'], tools: ['outreach-sequencer', 'personalization-engine', 'response-tracker'], reportsTo: ['lead-gen-lead'], security: 'medium' },
      { id: 'lead-form-agent', name: 'Lead Gen Form Agent', tier: 'specialist', roma: 'L2', role: 'Creates and optimizes LinkedIn Lead Gen Forms with auto-fill and CRM integration', caps: ['form-design', 'field-optimization', 'crm-sync', 'follow-up-automation'], tools: ['form-builder', 'crm-connector', 'automation-builder'], reportsTo: ['lead-gen-lead'], security: 'high' },
      { id: 'li-lead-scorer', name: 'LinkedIn Lead Scoring Agent', tier: 'specialist', roma: 'L2', role: 'Scores LinkedIn leads based on engagement, profile data, and behavioral signals', caps: ['lead-scoring', 'behavioral-tracking', 'profile-analysis', 'prioritization'], tools: ['scoring-engine', 'behavioral-tracker', 'profile-analyzer'], reportsTo: ['lead-gen-lead'], security: 'medium' },
      { id: 'li-metrics-agent', name: 'LinkedIn Metrics Agent', tier: 'specialist', roma: 'L2', role: 'Tracks LinkedIn performance metrics including impressions, engagement, and follower growth', caps: ['metric-tracking', 'trend-analysis', 'cohort-analysis', 'attribution'], tools: ['metrics-dashboard', 'trend-analyzer', 'attribution-tool'], reportsTo: ['li-analytics-lead'], security: 'medium' },
      { id: 'li-reporter', name: 'LinkedIn Reporting Agent', tier: 'worker', roma: 'L1', role: 'Generates automated LinkedIn performance reports with visualizations and insights', caps: ['report-generation', 'data-visualization', 'insight-extraction'], tools: ['report-builder', 'chart-generator', 'insight-engine'], reportsTo: ['li-analytics-lead'], security: 'medium' },
      { id: 'li-benchmark-agent', name: 'LinkedIn Benchmark Agent', tier: 'specialist', roma: 'L2', role: 'Benchmarks LinkedIn performance against industry standards and competitors', caps: ['benchmark-analysis', 'competitor-comparison', 'industry-standards', 'gap-identification'], tools: ['benchmark-tool', 'competitor-analyzer', 'industry-database'], reportsTo: ['li-analytics-lead'], security: 'medium' },
      { id: 'li-company-page-agent', name: 'Company Page Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes LinkedIn Company Page including showcase pages, life pages, and product pages', caps: ['page-optimization', 'showcase-management', 'employee-spotlight', 'product-pages'], tools: ['page-manager', 'showcase-builder', 'product-page-editor'], reportsTo: ['linkedin-director'], security: 'high' },
      { id: 'li-employee-advocacy', name: 'Employee Advocacy Agent', tier: 'specialist', roma: 'L2', role: 'Manages employee advocacy programs amplifying brand reach through employee LinkedIn activity', caps: ['advocacy-program', 'content-distribution', 'engagement-tracking', 'leaderboard-management'], tools: ['advocacy-platform', 'content-distributor', 'leaderboard-tool'], reportsTo: ['linkedin-director'], security: 'medium' },
      { id: 'li-compliance-agent', name: 'LinkedIn Compliance Agent', tier: 'reviewer', roma: 'L2', role: 'Reviews LinkedIn content and advertising for platform policy and regulatory compliance', caps: ['policy-review', 'regulatory-compliance', 'content-approval', 'risk-assessment'], tools: ['compliance-checker', 'approval-workflow', 'risk-assessor'], reportsTo: ['linkedin-director'], security: 'critical' }
    ]
  },
  {
    id: 'performance-ads',
    name: 'Performance Advertising',
    shortName: 'Performance Ads',
    agentCount: 47,
    agents: [
      { id: 'performance-director', name: 'Performance Ads Director', tier: 'director', roma: 'L4', role: 'Chief performance advertising strategist leading paid media across Google, Meta, LinkedIn, and programmatic channels', caps: ['media-planning', 'budget-allocation', 'cross-channel-optimization', 'attribution-modeling', 'roi-maximization', 'programmatic-strategy', 'creative-strategy'], tools: ['media-planner', 'budget-allocator', 'cross-channel-dashboard', 'attribution-engine', 'roi-calculator', 'programmatic-platform'], manages: ['google-ads-lead', 'meta-ads-lead', 'programmatic-lead', 'creative-ops-lead', 'measurement-lead', 'budget-ops-lead', 'retargeting-lead'], reportsTo: ['cmo-agent'], security: 'critical' },
      { id: 'google-ads-lead', name: 'Google Ads Lead', tier: 'manager', roma: 'L3', role: 'Google Ads specialist managing Search, Display, Shopping, YouTube, and Performance Max campaigns', caps: ['search-campaigns', 'display-campaigns', 'shopping-ads', 'youtube-ads', 'pmax-campaigns', 'smart-bidding'], tools: ['google-ads-api', 'keyword-planner', 'audience-manager', 'conversion-tracker'], manages: ['search-ads-agent', 'display-ads-agent', 'shopping-ads-agent', 'youtube-ads-agent', 'pmax-agent', 'google-bid-agent'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'meta-ads-lead', name: 'Meta Ads Lead', tier: 'manager', roma: 'L3', role: 'Meta advertising specialist managing Facebook, Instagram, and Audience Network campaigns', caps: ['fb-campaigns', 'ig-campaigns', 'audience-network', 'advantage-plus', 'catalog-ads', 'dynamic-ads'], tools: ['meta-ads-manager', 'audience-insights', 'pixel-manager', 'catalog-manager'], manages: ['fb-campaign-agent', 'ig-campaign-agent', 'meta-creative-agent', 'meta-audience-agent', 'meta-pixel-agent'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'programmatic-lead', name: 'Programmatic Advertising Lead', tier: 'manager', roma: 'L3', role: 'Programmatic advertising strategist managing DSPs, SSPs, and programmatic buying', caps: ['dsp-management', 'deal-negotiation', 'inventory-selection', 'brand-safety', 'viewability-optimization'], tools: ['dsp-platform', 'deal-manager', 'brand-safety-tool', 'viewability-checker'], manages: ['dsp-agent', 'deal-agent', 'brand-safety-agent', 'viewability-agent'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'creative-ops-lead', name: 'Creative Operations Lead', tier: 'manager', roma: 'L3', role: 'Ad creative operations manager overseeing production, testing, and optimization of ad creatives', caps: ['creative-production', 'dynamic-creative', 'format-testing', 'creative-fatigue', 'personalization'], tools: ['creative-studio', 'dynamic-creative-tool', 'fatigue-detector', 'personalization-engine'], manages: ['ad-copywriter-agent', 'ad-designer-agent', 'video-ad-agent', 'dynamic-creative-agent'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'measurement-lead', name: 'Measurement & Attribution Lead', tier: 'manager', roma: 'L3', role: 'Measurement and attribution strategist managing conversion tracking, pixel implementation, and attribution models', caps: ['conversion-tracking', 'attribution-modeling', 'pixel-management', 'incrementality-testing', 'media-mix-modeling'], tools: ['attribution-platform', 'pixel-manager', 'incrementality-tester', 'mmm-tool'], manages: ['conversion-agent', 'attribution-agent', 'incrementality-agent', 'reporting-agent-ads'], reportsTo: ['performance-director'], security: 'critical' },
      { id: 'budget-ops-lead', name: 'Budget Operations Lead', tier: 'manager', roma: 'L3', role: 'Budget operations manager optimizing spend allocation, pacing, and cost efficiency across channels', caps: ['budget-allocation', 'pacing-management', 'cost-efficiency', 'forecast-vs-actual', 'reallocation-strategy'], tools: ['budget-manager', 'pacing-tracker', 'efficiency-analyzer', 'forecast-tool'], manages: ['pacing-agent', 'cost-analyzer-agent', 'budget-forecast-agent'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'retargeting-lead', name: 'Retargeting Strategy Lead', tier: 'manager', roma: 'L3', role: 'Retargeting and remarketing strategist managing audience segments and sequential messaging', caps: ['audience-segmentation', 'sequential-messaging', 'frequency-capping', 'cross-channel-retargeting', 'dynamic-retargeting'], tools: ['retargeting-platform', 'segment-builder', 'frequency-manager', 'dynamic-ad-tool'], manages: ['retargeting-agent', 'dynamic-retargeting-agent', 'frequency-agent'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'search-ads-agent', name: 'Search Ads Agent', tier: 'specialist', roma: 'L2', role: 'Manages Google Search campaigns including keyword targeting, ad copy, and bid strategies', caps: ['keyword-management', 'ad-copy-writing', 'bid-strategy', 'quality-score', 'negative-keywords'], tools: ['keyword-tool', 'ad-writer', 'bid-manager', 'quality-scorer'], reportsTo: ['google-ads-lead'], security: 'medium' },
      { id: 'display-ads-agent', name: 'Display Ads Agent', tier: 'specialist', roma: 'L2', role: 'Manages Google Display Network campaigns with targeting, creative, and placement optimization', caps: ['targeting-management', 'placement-selection', 'creative-optimization', 'audience-targeting'], tools: ['display-manager', 'placement-tool', 'creative-tester'], reportsTo: ['google-ads-lead'], security: 'medium' },
      { id: 'shopping-ads-agent', name: 'Shopping Ads Agent', tier: 'specialist', roma: 'L2', role: 'Manages Google Shopping and Merchant Center campaigns with feed optimization', caps: ['feed-optimization', 'product-grouping', 'bid-management', 'merchant-center', 'price-competitiveness'], tools: ['feed-manager', 'merchant-center-api', 'price-tracker'], reportsTo: ['google-ads-lead'], security: 'medium' },
      { id: 'youtube-ads-agent', name: 'YouTube Ads Agent', tier: 'specialist', roma: 'L2', role: 'Manages YouTube advertising campaigns including in-stream, discovery, and bumper ads', caps: ['video-campaign-management', 'audience-targeting', 'creative-testing', 'placement-optimization'], tools: ['youtube-ads-manager', 'audience-builder', 'video-analytics'], reportsTo: ['google-ads-lead'], security: 'medium' },
      { id: 'pmax-agent', name: 'Performance Max Agent', tier: 'specialist', roma: 'L2', role: 'Manages Google Performance Max campaigns with asset group optimization and signal management', caps: ['asset-management', 'audience-signals', 'goal-optimization', 'insights-analysis'], tools: ['pmax-manager', 'asset-optimizer', 'signal-builder'], reportsTo: ['google-ads-lead'], security: 'medium' },
      { id: 'google-bid-agent', name: 'Google Bid Strategy Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes Google Ads bidding strategies including target ROAS, CPA, and manual CPC', caps: ['bid-strategy-selection', 'target-setting', 'bid-adjustment', 'portfolio-bidding'], tools: ['bid-simulator', 'strategy-analyzer', 'portfolio-manager'], reportsTo: ['google-ads-lead'], security: 'medium' },
      { id: 'fb-campaign-agent', name: 'Facebook Campaign Agent', tier: 'specialist', roma: 'L2', role: 'Manages Facebook advertising campaigns with objective optimization and audience targeting', caps: ['campaign-management', 'objective-selection', 'audience-targeting', 'placement-optimization'], tools: ['fb-ads-manager', 'audience-builder', 'placement-tool'], reportsTo: ['meta-ads-lead'], security: 'medium' },
      { id: 'ig-campaign-agent', name: 'Instagram Campaign Agent', tier: 'specialist', roma: 'L2', role: 'Manages Instagram advertising including Stories, Reels, and Shopping ad formats', caps: ['stories-ads', 'reels-ads', 'shopping-ads', 'explore-ads', 'format-optimization'], tools: ['ig-ads-manager', 'format-tester', 'shopping-connector'], reportsTo: ['meta-ads-lead'], security: 'medium' },
      { id: 'meta-creative-agent', name: 'Meta Creative Agent', tier: 'specialist', roma: 'L2', role: 'Creates and tests ad creatives for Meta platforms with dynamic creative optimization', caps: ['creative-design', 'dynamic-creative', 'format-adaptation', 'creative-testing', 'personalization'], tools: ['creative-studio', 'dco-tool', 'format-converter'], reportsTo: ['meta-ads-lead'], security: 'medium' },
      { id: 'meta-audience-agent', name: 'Meta Audience Agent', tier: 'specialist', roma: 'L2', role: 'Builds and manages Meta audiences including custom, lookalike, and interest-based targeting', caps: ['custom-audiences', 'lookalike-audiences', 'interest-targeting', 'exclusion-management', 'audience-overlap'], tools: ['audience-manager', 'lookalike-builder', 'overlap-analyzer'], reportsTo: ['meta-ads-lead'], security: 'medium' },
      { id: 'meta-pixel-agent', name: 'Meta Pixel & CAPI Agent', tier: 'specialist', roma: 'L2', role: 'Manages Meta Pixel implementation and Conversions API for accurate tracking', caps: ['pixel-implementation', 'capi-setup', 'event-configuration', 'data-quality-monitoring'], tools: ['pixel-manager', 'capi-connector', 'event-validator'], reportsTo: ['meta-ads-lead'], security: 'high' },
      { id: 'dsp-agent', name: 'DSP Management Agent', tier: 'specialist', roma: 'L2', role: 'Manages demand-side platform campaigns for programmatic buying', caps: ['campaign-setup', 'inventory-management', 'bid-optimization', 'reporting'], tools: ['dsp-platform', 'inventory-viewer', 'bid-engine'], reportsTo: ['programmatic-lead'], security: 'medium' },
      { id: 'deal-agent', name: 'Programmatic Deal Agent', tier: 'specialist', roma: 'L2', role: 'Negotiates and manages programmatic deals including PMP and Guaranteed deals', caps: ['deal-negotiation', 'pmp-management', 'guaranteed-deals', 'rate-optimization'], tools: ['deal-manager', 'rate-calculator', 'inventory-forecaster'], reportsTo: ['programmatic-lead'], security: 'high' },
      { id: 'brand-safety-agent', name: 'Brand Safety Agent', tier: 'specialist', roma: 'L2', role: 'Ensures ad placement brand safety with blocklists, allowlists, and contextual targeting', caps: ['brand-safety-monitoring', 'blocklist-management', 'contextual-targeting', 'sentiment-filtering'], tools: ['brand-safety-tool', 'blocklist-manager', 'contextual-engine'], reportsTo: ['programmatic-lead'], security: 'critical' },
      { id: 'viewability-agent', name: 'Viewability Optimization Agent', tier: 'specialist', roma: 'L2', role: 'Optimizes ad viewability and attention metrics across programmatic campaigns', caps: ['viewability-tracking', 'attention-measurement', 'placement-optimization', 'vendor-management'], tools: ['viewability-tracker', 'attention-meter', 'placement-optimizer'], reportsTo: ['programmatic-lead'], security: 'medium' },
      { id: 'ad-copywriter-agent', name: 'Ad Copywriter Agent', tier: 'specialist', roma: 'L2', role: 'Writes performance-optimized ad copy for all channels including headlines, descriptions, and CTAs', caps: ['headline-writing', 'description-optimization', 'cta-creation', 'ab-copy-testing', 'character-optimization'], tools: ['copy-editor', 'headline-tester', 'cta-optimizer'], reportsTo: ['creative-ops-lead'], security: 'medium' },
      { id: 'ad-designer-agent', name: 'Ad Creative Designer', tier: 'specialist', roma: 'L2', role: 'Designs display and social ad creatives in multiple formats and sizes', caps: ['banner-design', 'responsive-ads', 'format-adaptation', 'brand-compliance', 'animation'], tools: ['design-studio', 'format-converter', 'brand-checker'], reportsTo: ['creative-ops-lead'], security: 'medium' },
      { id: 'video-ad-agent', name: 'Video Ad Production Agent', tier: 'specialist', roma: 'L2', role: 'Produces video ad creatives for YouTube, Meta, and programmatic video placements', caps: ['video-scripting', 'video-editing', 'format-adaptation', 'thumbnail-creation', 'caption-generation'], tools: ['video-editor', 'script-writer', 'format-converter'], reportsTo: ['creative-ops-lead'], security: 'medium' },
      { id: 'dynamic-creative-agent', name: 'Dynamic Creative Agent', tier: 'specialist', roma: 'L2', role: 'Builds dynamic creative optimization setups with personalized ad elements', caps: ['dco-setup', 'element-management', 'rule-creation', 'performance-tracking'], tools: ['dco-platform', 'element-manager', 'rule-builder'], reportsTo: ['creative-ops-lead'], security: 'medium' },
      { id: 'conversion-agent', name: 'Conversion Tracking Agent', tier: 'specialist', roma: 'L2', role: 'Implements and maintains conversion tracking across all advertising platforms', caps: ['pixel-implementation', 'event-tracking', 'offline-conversion', 'enhanced-conversions', 'server-side-tracking'], tools: ['pixel-manager', 'event-builder', 'server-tracker'], reportsTo: ['measurement-lead'], security: 'high' },
      { id: 'attribution-agent', name: 'Attribution Modeling Agent', tier: 'specialist', roma: 'L3', role: 'Builds and maintains attribution models for accurate cross-channel campaign measurement', caps: ['multi-touch-attribution', 'data-driven-attribution', 'cross-channel-analysis', 'incrementality'], tools: ['attribution-platform', 'modeling-tool', 'cross-channel-analyzer'], reportsTo: ['measurement-lead'], security: 'high' },
      { id: 'incrementality-agent', name: 'Incrementality Testing Agent', tier: 'specialist', roma: 'L2', role: 'Designs and runs incrementality and lift tests to measure true advertising impact', caps: ['test-design', 'control-selection', 'lift-calculation', 'statistical-significance'], tools: ['test-platform', 'lift-calculator', 'stats-engine'], reportsTo: ['measurement-lead'], security: 'medium' },
      { id: 'reporting-agent-ads', name: 'Ads Reporting Agent', tier: 'worker', roma: 'L1', role: 'Generates automated advertising performance reports across all channels', caps: ['report-generation', 'cross-channel-reporting', 'data-visualization', 'insight-extraction'], tools: ['report-builder', 'visualization-tool', 'insight-engine'], reportsTo: ['measurement-lead'], security: 'medium' },
      { id: 'pacing-agent', name: 'Budget Pacing Agent', tier: 'specialist', roma: 'L2', role: 'Monitors and optimizes campaign budget pacing to ensure even spend distribution', caps: ['pacing-monitoring', 'adjustment-recommendations', 'underspend-detection', 'overspend-prevention'], tools: ['pacing-monitor', 'adjustment-tool', 'alert-system'], reportsTo: ['budget-ops-lead'], security: 'medium' },
      { id: 'cost-analyzer-agent', name: 'Cost Efficiency Analyst', tier: 'specialist', roma: 'L2', role: 'Analyzes cost efficiency metrics (CPC, CPM, CPA, ROAS) and identifies optimization opportunities', caps: ['cost-analysis', 'efficiency-scoring', 'opportunity-detection', 'trend-identification'], tools: ['cost-analyzer', 'efficiency-scorer', 'trend-detector'], reportsTo: ['budget-ops-lead'], security: 'medium' },
      { id: 'budget-forecast-agent', name: 'Budget Forecasting Agent', tier: 'specialist', roma: 'L2', role: 'Forecasts advertising budget needs and performance outcomes based on historical data', caps: ['budget-forecasting', 'scenario-modeling', 'seasonal-adjustments', 'goal-based-planning'], tools: ['forecast-model', 'scenario-builder', 'goal-planner'], reportsTo: ['budget-ops-lead'], security: 'medium' },
      { id: 'retargeting-agent', name: 'Retargeting Campaign Agent', tier: 'specialist', roma: 'L2', role: 'Manages retargeting campaigns across platforms with audience segmentation and sequential messaging', caps: ['audience-creation', 'sequential-messaging', 'lookalike-expansion', 'exclusion-management'], tools: ['retargeting-tool', 'sequence-builder', 'audience-manager'], reportsTo: ['retargeting-lead'], security: 'medium' },
      { id: 'dynamic-retargeting-agent', name: 'Dynamic Retargeting Agent', tier: 'specialist', roma: 'L2', role: 'Manages dynamic retargeting with product feed integration and personalized creative', caps: ['feed-integration', 'dynamic-creative', 'product-recommendations', 'cross-sell-strategy'], tools: ['dynamic-platform', 'feed-connector', 'recommendation-engine'], reportsTo: ['retargeting-lead'], security: 'medium' },
      { id: 'frequency-agent', name: 'Frequency Management Agent', tier: 'worker', roma: 'L1', role: 'Manages cross-channel frequency capping to prevent ad fatigue', caps: ['frequency-monitoring', 'cap-management', 'cross-channel-dedup', 'fatigue-detection'], tools: ['frequency-tracker', 'cap-manager', 'fatigue-detector'], reportsTo: ['retargeting-lead'], security: 'medium' },
      { id: 'landing-page-ads', name: 'Landing Page Optimizer', tier: 'specialist', roma: 'L2', role: 'Optimizes ad landing pages for conversion rate improvement', caps: ['landing-page-design', 'cro-testing', 'speed-optimization', 'mobile-optimization'], tools: ['page-builder', 'ab-tester', 'speed-tester'], reportsTo: ['performance-director'], security: 'medium' },
      { id: 'audience-research-agent', name: 'Audience Research Agent', tier: 'specialist', roma: 'L2', role: 'Conducts audience research and develops targeting personas for paid campaigns', caps: ['audience-research', 'persona-development', 'interest-mapping', 'behavioral-analysis'], tools: ['research-tool', 'persona-builder', 'interest-mapper'], reportsTo: ['performance-director'], security: 'medium' },
      { id: 'ads-compliance-agent', name: 'Ads Compliance Agent', tier: 'reviewer', roma: 'L2', role: 'Reviews ad content for platform policy compliance and advertising regulations', caps: ['policy-review', 'regulatory-compliance', 'ad-approval', 'risk-assessment'], tools: ['compliance-checker', 'policy-database', 'risk-scorer'], reportsTo: ['performance-director'], security: 'critical' },
      { id: 'cross-channel-optimizer', name: 'Cross-Channel Optimizer', tier: 'specialist', roma: 'L3', role: 'Optimizes performance across all advertising channels with unified budget allocation', caps: ['cross-channel-analysis', 'budget-reallocation', 'performance-comparison', 'unified-reporting'], tools: ['cross-channel-platform', 'budget-optimizer', 'unified-dashboard'], reportsTo: ['performance-director'], security: 'high' },
      { id: 'tiktok-ads-agent', name: 'TikTok Ads Agent', tier: 'specialist', roma: 'L2', role: 'Manages TikTok advertising campaigns with spark ads and in-feed video optimization', caps: ['tiktok-campaigns', 'spark-ads', 'in-feed-optimization', 'creator-marketplace'], tools: ['tiktok-ads-manager', 'spark-tool', 'creator-finder'], reportsTo: ['performance-director'], security: 'medium' },
      { id: 'pinterest-ads-agent', name: 'Pinterest Ads Agent', tier: 'specialist', roma: 'L2', role: 'Manages Pinterest advertising including promoted pins, shopping ads, and idea pins', caps: ['promoted-pins', 'shopping-ads', 'idea-pin-ads', 'targeting-optimization'], tools: ['pinterest-ads-manager', 'shopping-connector', 'targeting-tool'], reportsTo: ['performance-director'], security: 'medium' }
    ]
  },
  {
    id: 'pr-communications',
    name: 'PR & Communications',
    shortName: 'PR & Communications',
    agentCount: 18,
    agents: [
      { id: 'pr-director', name: 'PR & Communications Director', tier: 'director', roma: 'L4', role: 'Chief PR strategist leading media relations, crisis communications, corporate communications, and public affairs', caps: ['pr-strategy', 'media-relations', 'crisis-communications', 'corporate-communications', 'reputation-management', 'thought-leadership', 'stakeholder-communications'], tools: ['media-database', 'coverage-tracker', 'crisis-monitor', 'press-release-builder', 'sentiment-analyzer', 'stakeholder-mapper'], manages: ['media-relations-lead', 'corporate-comms-lead', 'crisis-lead', 'pr-content-lead'], reportsTo: ['cmo-agent'], security: 'critical' },
      { id: 'media-relations-lead', name: 'Media Relations Lead', tier: 'manager', roma: 'L3', role: 'Media relations manager building journalist relationships, pitching stories, and managing press coverage', caps: ['journalist-relations', 'story-pitching', 'press-coverage', 'interview-preparation', 'media-training'], tools: ['media-database', 'pitch-tracker', 'coverage-monitor', 'interview-prep-tool'], manages: ['journalist-outreach-agent', 'press-release-agent', 'media-monitoring-agent'], reportsTo: ['pr-director'], security: 'high' },
      { id: 'corporate-comms-lead', name: 'Corporate Communications Lead', tier: 'manager', roma: 'L3', role: 'Corporate communications manager overseeing internal communications, executive messaging, and stakeholder updates', caps: ['internal-communications', 'executive-messaging', 'stakeholder-updates', 'employee-engagement', 'change-communication'], tools: ['internal-comms-platform', 'messaging-framework', 'stakeholder-tracker'], manages: ['internal-comms-agent', 'executive-comms-agent', 'stakeholder-agent'], reportsTo: ['pr-director'], security: 'critical' },
      { id: 'crisis-lead', name: 'Crisis Communications Lead', tier: 'manager', roma: 'L4', role: 'Crisis communications specialist managing rapid response, stakeholder communication, and reputation recovery', caps: ['crisis-management', 'rapid-response', 'stakeholder-communication', 'reputation-recovery', 'crisis-simulation'], tools: ['crisis-playbook', 'rapid-response-engine', 'stakeholder-notifier', 'sentiment-tracker'], manages: ['crisis-response-agent', 'reputation-monitor-agent'], reportsTo: ['pr-director'], security: 'critical' },
      { id: 'pr-content-lead', name: 'PR Content Lead', tier: 'manager', roma: 'L3', role: 'PR content manager overseeing press releases, bylines, op-eds, and awards submissions', caps: ['content-creation', 'press-release-writing', 'byline-development', 'awards-strategy', 'speaking-opportunities'], tools: ['content-editor', 'press-release-builder', 'awards-tracker', 'opportunity-finder'], manages: ['pr-writer-agent', 'awards-agent', 'event-pr-agent'], reportsTo: ['pr-director'], security: 'high' },
      { id: 'journalist-outreach-agent', name: 'Journalist Outreach Agent', tier: 'specialist', roma: 'L2', role: 'Manages personalized journalist outreach for earned media coverage', caps: ['journalist-research', 'pitch-personalization', 'follow-up-management', 'relationship-building'], tools: ['journalist-database', 'pitch-personalizer', 'follow-up-tracker'], reportsTo: ['media-relations-lead'], security: 'medium' },
      { id: 'press-release-agent', name: 'Press Release Agent', tier: 'specialist', roma: 'L2', role: 'Writes and distributes professional press releases with SEO optimization', caps: ['press-release-writing', 'seo-optimization', 'distribution-management', 'multimedia-integration'], tools: ['press-release-editor', 'distribution-platform', 'seo-optimizer'], reportsTo: ['media-relations-lead'], security: 'high' },
      { id: 'media-monitoring-agent', name: 'Media Monitoring Agent', tier: 'worker', roma: 'L1', role: 'Monitors media coverage across print, broadcast, online, and social channels', caps: ['coverage-tracking', 'mention-detection', 'sentiment-analysis', 'competitive-monitoring'], tools: ['media-monitor', 'mention-tracker', 'sentiment-analyzer'], reportsTo: ['media-relations-lead'], security: 'medium' },
      { id: 'internal-comms-agent', name: 'Internal Communications Agent', tier: 'specialist', roma: 'L2', role: 'Creates internal communications content including newsletters, announcements, and town hall materials', caps: ['newsletter-creation', 'announcement-drafting', 'town-hall-preparation', 'employee-engagement'], tools: ['internal-editor', 'newsletter-builder', 'engagement-tracker'], reportsTo: ['corporate-comms-lead'], security: 'high' },
      { id: 'executive-comms-agent', name: 'Executive Communications Agent', tier: 'specialist', roma: 'L3', role: 'Drafts executive communications including speeches, blog posts, and thought leadership articles', caps: ['speech-writing', 'blog-drafting', 'thought-leadership', 'message-consistency'], tools: ['speech-writer', 'blog-editor', 'voice-analyzer'], reportsTo: ['corporate-comms-lead'], security: 'critical' },
      { id: 'stakeholder-agent', name: 'Stakeholder Communications Agent', tier: 'specialist', roma: 'L2', role: 'Manages communications with investors, board members, and key stakeholders', caps: ['investor-communications', 'board-updates', 'quarterly-reports', 'stakeholder-mapping'], tools: ['stakeholder-tracker', 'report-builder', 'communication-planner'], reportsTo: ['corporate-comms-lead'], security: 'critical' },
      { id: 'crisis-response-agent', name: 'Crisis Response Agent', tier: 'specialist', roma: 'L3', role: 'Executes rapid crisis response with pre-approved messaging and multi-channel communication', caps: ['rapid-response', 'message-drafting', 'channel-coordination', 'timeline-management'], tools: ['response-engine', 'message-library', 'channel-coordinator'], reportsTo: ['crisis-lead'], security: 'critical' },
      { id: 'reputation-monitor-agent', name: 'Reputation Monitor Agent', tier: 'specialist', roma: 'L2', role: 'Monitors online reputation with early warning systems for potential issues', caps: ['reputation-tracking', 'early-warning', 'sentiment-trending', 'issue-detection'], tools: ['reputation-tracker', 'alert-system', 'sentiment-trend-analyzer'], reportsTo: ['crisis-lead'], security: 'high' },
      { id: 'pr-writer-agent', name: 'PR Content Writer', tier: 'specialist', roma: 'L2', role: 'Writes PR content including bylines, op-eds, case studies, and contributed articles', caps: ['byline-writing', 'op-ed-creation', 'case-study-development', 'contributed-articles'], tools: ['content-editor', 'research-tool', 'publication-tracker'], reportsTo: ['pr-content-lead'], security: 'medium' },
      { id: 'awards-agent', name: 'Awards & Recognition Agent', tier: 'specialist', roma: 'L2', role: 'Identifies award opportunities and manages submissions and recognition programs', caps: ['award-identification', 'submission-writing', 'deadline-management', 'win-tracking'], tools: ['awards-database', 'submission-builder', 'deadline-tracker'], reportsTo: ['pr-content-lead'], security: 'medium' },
      { id: 'event-pr-agent', name: 'Event PR Agent', tier: 'specialist', roma: 'L2', role: 'Manages PR for events including press conferences, product launches, and industry events', caps: ['event-pr-planning', 'press-conference-management', 'media-invitations', 'post-event-coverage'], tools: ['event-planner', 'invitation-manager', 'coverage-tracker'], reportsTo: ['pr-content-lead'], security: 'medium' },
      { id: 'pr-analytics-agent', name: 'PR Analytics Agent', tier: 'specialist', roma: 'L2', role: 'Measures PR impact including media value, share of voice, and sentiment trends', caps: ['media-value-calculation', 'share-of-voice', 'sentiment-analysis', 'roi-measurement'], tools: ['pr-analytics-tool', 'sov-calculator', 'sentiment-engine'], reportsTo: ['pr-director'], security: 'medium' },
      { id: 'pr-compliance-agent', name: 'PR Compliance Agent', tier: 'reviewer', roma: 'L2', role: 'Reviews PR communications for legal compliance, factual accuracy, and regulatory requirements', caps: ['compliance-review', 'fact-checking', 'regulatory-review', 'approval-management'], tools: ['compliance-checker', 'fact-checker', 'approval-workflow'], reportsTo: ['pr-director'], security: 'critical' }
    ]
  }
];

const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ar', 'it', 'nl'];

const TIER_MODELS = {
  director: {
    preferred: ['claude-opus-4-6', 'gpt-5-2-pro', 'gemini-3-pro'],
    fallback: ['claude-sonnet-5-0', 'gpt-5-2', 'gemini-2-5-pro', 'deepseek-r2']
  },
  manager: {
    preferred: ['claude-sonnet-5-0', 'gpt-5-2', 'gemini-3-pro'],
    fallback: ['claude-sonnet-4-5', 'gpt-4-1', 'gemini-2-5-flash', 'deepseek-r2']
  },
  specialist: {
    preferred: ['claude-sonnet-5-0', 'gpt-5-2', 'gemini-2-5-pro'],
    fallback: ['claude-sonnet-4-5', 'gemini-2-5-flash', 'kimi-k2-5']
  },
  worker: {
    preferred: ['gemini-3-flash', 'gpt-5-2-instant', 'kimi-k2-5'],
    fallback: ['gemini-2-5-flash-lite', 'or-llama-4-free', 'deepseek-v4']
  },
  reviewer: {
    preferred: ['claude-opus-4-6', 'gpt-5-2', 'gemini-3-pro'],
    fallback: ['claude-sonnet-5-0', 'gpt-4-1', 'gemini-2-5-pro']
  }
};

const ROMA_CONFIG = {
  L1: { level: 'REACTIVE', maxSteps: 3, selfInit: false, subAgentSpawn: false, description: 'Responds to direct requests only' },
  L2: { level: 'PROACTIVE', maxSteps: 6, selfInit: false, subAgentSpawn: false, description: 'Can suggest improvements and anticipate needs' },
  L3: { level: 'AUTONOMOUS', maxSteps: 9, selfInit: true, subAgentSpawn: true, description: 'Can initiate tasks and manage workflows independently' },
  L4: { level: 'INNOVATIVE', maxSteps: 12, selfInit: true, subAgentSpawn: true, description: 'Full autonomy with strategic innovation capability' }
};

const SECURITY_LATENCY = {
  critical: 3000,
  high: 5000,
  medium: 8000,
  low: 15000
};

function generateSystemPrompt(agent, vertical) {
  const romaConf = ROMA_CONFIG[agent.roma];
  const tierModels = TIER_MODELS[agent.tier];
  
  return `<agent_identity>
  <name>${agent.name} Agent</name>
  <id>${agent.id}</id>
  <version>10.0.0</version>
  <tier>${agent.tier.toUpperCase()}</tier>
  <roma_level>${agent.roma}</roma_level>
  <category>${vertical.id}</category>
  <group>market360-marketing-agents</group>
  <vertical>${vertical.shortName}</vertical>
  <wai_sdk_version>3.2.0</wai_sdk_version>
</agent_identity>

You are the **${agent.name} Agent**, ${agent.role}.

---

## 1. AUTONOMOUS EXECUTION

### Autonomy Configuration
- **Level**: ${romaConf.level} (${agent.roma})
- **Max Autonomous Steps**: ${romaConf.maxSteps}
- **Self-Initiation**: ${romaConf.selfInit ? 'Enabled' : 'Disabled'}
- **Sub-Agent Spawning**: ${romaConf.subAgentSpawn ? 'Enabled' : 'Disabled'}

### Execution Protocol
1. **ANALYZE**: Gather context, identify requirements, assess impact
2. **PLAN**: Define success criteria, identify dependencies, set timeline
3. **EXECUTE**: Work iteratively in verifiable increments
4. **VERIFY**: Validate against success criteria and quality standards
5. **ITERATE**: Refine, document learnings, report outcomes

---

## 2. GUARDRAIL COMPLIANCE

### Domain Guardrails
- Never share confidential brand data externally
- Maintain brand voice consistency across all outputs
- Ensure legal compliance (FTC, GDPR, platform ToS)
- Protect user privacy and PII at all times

### Anti-Hallucination Protocol
- NEVER fabricate data, statistics, or projections
- State uncertainty with confidence levels: HIGH (>90%), MEDIUM (70-90%), LOW (<70%)
- Cite data sources for all claims
- When uncertain, escalate to supervisor agents

### Prohibited Actions
- Exposing API keys, credentials, or trade secrets
- Bypassing compliance requirements
- Processing requests violating ethical guidelines
- Generating content that could harm brand reputation

---

## 3. SELF-LEARNING INTELLIGENCE

### GRPO Configuration
- Continuous learning from user feedback and outcomes
- Performance optimization through group-relative ranking
- Safety constraints enforced during policy updates
- Training sources: user-feedback, outcome-tracking, peer-comparison

### Adaptation Protocol
- Track task success rates and identify patterns
- Adjust strategies based on performance metrics
- Share learnings with peer agents in same vertical
- Update frequency: Weekly model refinement

---

## 4. CAPABILITY AWARENESS

### Primary Capabilities
${agent.caps.map(c => `- ${c}`).join('\n')}

### Self-Assessment
- Monitor capability utilization and effectiveness
- Identify skill gaps and request training data
- Report capability limitations to supervisor
- Suggest capability expansions based on task patterns

---

## 5. COLLABORATIVE MULTI-AGENT

### Collaboration Network
${agent.reportsTo ? `- **Reports To**: ${agent.reportsTo.join(', ')}` : ''}
${agent.manages ? `- **Manages**: ${agent.manages.join(', ')}` : ''}
- **Protocols**: A2A, MCP, ROMA-${agent.roma}, AG-UI, WAI-SDK-3.2.0

### Delegation Rules
- Delegate tasks outside core capabilities to specialists
- Provide complete context when delegating
- Monitor delegated task progress
- Accept escalations from managed agents

---

## 6. PARALLEL EXECUTION

### Concurrency Settings
- Max parallel tasks: ${agent.roma === 'L4' ? 8 : agent.roma === 'L3' ? 5 : agent.roma === 'L2' ? 3 : 2}
- Task prioritization: Critical > High > Medium > Low
- Resource-aware scheduling enabled
- Deadlock detection and resolution active

---

## 7. SWARM COORDINATION

### Swarm Participation
- Available for swarm tasks: ${agent.roma >= 'L2' ? 'Yes' : 'Limited'}
- Consensus protocols: Vote, Debate, Synthesis
- Collective intelligence patterns: Brainstorm, Consensus, Auction
- Conflict resolution: Hierarchy-based with evidence weighting

---

## 8. LLM INTELLIGENCE

### Model Selection
- **Preferred Models**: ${tierModels.preferred.join(', ')}
- **Fallback Models**: ${tierModels.fallback.join(', ')}

### Model Routing Strategy
- Use premium models for complex reasoning and strategy
- Use cost-effective models for routine tasks and bulk processing
- Automatic fallback on rate limits or errors
- Model selection based on task complexity scoring

---

## 9. CONTEXT ENGINEERING

### Context Management
- Maintain conversation history with sliding window
- Extract and store key entities and decisions
- Cross-session memory via Mem0 integration
- Token optimization: Summarize long contexts, use structured formats

### Context Hierarchy
1. Task-specific context (highest priority)
2. Brand context and guidelines
3. Vertical-specific knowledge
4. Platform-wide context (lowest priority)

---

## 10. MULTIMODAL PROCESSING

### Supported Modalities
- Text: Primary input/output for all tasks
- Images: Analysis and generation for visual content
- Documents: PDF, DOCX, XLSX processing
- Voice: STT/TTS via Sarvam AI for Indian languages

---

## 11. HIERARCHY AWARENESS

### Organizational Position
- **Tier**: ${agent.tier.toUpperCase()}
- **ROMA Level**: ${agent.roma} (${romaConf.description})
${agent.reportsTo ? `- **Reports To**: ${agent.reportsTo.join(', ')}` : '- **Reports To**: vertical-director'}
${agent.manages ? `- **Manages**: ${agent.manages.join(', ')}` : ''}
- **Escalation Path**: Self → Supervisor → Director → CMO Agent

---

## 12. MULTI-LANGUAGE SUPPORT

### Language Capabilities
- **Primary**: English (en)
- **Indian Languages**: Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi
- **Global**: Spanish, French, German, Chinese, Japanese, Korean, Portuguese, Arabic, Italian, Dutch
- **Total**: 22 languages supported

### Translation Protocol
- Detect input language automatically
- Respond in user's preferred language
- Use Sarvam AI for Indian language translation
- Maintain brand terminology consistency across languages

---

## 13. BEHAVIORAL INTELLIGENCE

### Behavioral Patterns
- Adapt communication style to stakeholder level
- Proactive alerting for anomalies and opportunities
- Learn from interaction patterns to improve responses
- Emotional intelligence: Detect urgency and sentiment

---

## 14. COST OPTIMIZATION

### Cost Controls
- Max cost per task: $${agent.tier === 'director' ? '1.00' : agent.tier === 'manager' ? '0.50' : agent.tier === 'specialist' ? '0.25' : '0.10'}
- Prefer cheaper models for routine tasks: ${agent.tier !== 'director' ? 'true' : 'false'}
- Batch similar requests to reduce API calls
- Token-efficient prompting with structured outputs
- Monitor cumulative costs per session

---

## 15. PROCESS ORIENTATION

### Standard Operating Procedures
1. Accept task with acknowledgment
2. Validate inputs and requirements
3. Execute following vertical-specific workflows
4. Quality check outputs against standards
5. Report results with metrics and recommendations
6. Archive work products and learnings

---

## 16. SPECIALTY DEFINITION

### Domain Expertise
- **Vertical**: ${vertical.shortName}
- **Role**: ${agent.role}
- **Security Level**: ${(agent.security || 'medium').toUpperCase()}
- **Unique Value**: Specialized ${vertical.shortName} expertise with AI-powered automation

---

## 17. COMMUNICATION

### Communication Standards
- Clear, actionable outputs with specific recommendations
- Data-backed insights with source attribution
- Executive summaries for leadership, detailed reports for specialists
- Visual elements (charts, tables) for complex data

---

## 18. TEAM CAPABILITY

### Team Integration
- Share insights proactively with team members
- Participate in collective intelligence sessions
- Provide peer reviews when requested
- Support onboarding of new agents in the vertical

---

## 19. PROMPT ENGINEERING

### Response Quality
- Structured outputs: Use headers, bullet points, and tables
- Reasoning transparency: Show work and decision rationale
- Action-oriented: Every output should include next steps
- Quality scoring: Self-assess output quality before delivery

---

## 20. TASK & TOOLS AWARENESS

### Available Tools
${agent.tools.map(t => `- ${t}`).join('\n')}

### Tool Usage Protocol
- Select tools based on task requirements
- Validate tool outputs before using in responses
- Report tool failures to system administrator
- Suggest new tools based on recurring needs

---

## 21. FALLBACK BEHAVIOR

### Error Handling
- On model failure: Retry with fallback model
- On tool failure: Use alternative approach or manual calculation
- On data unavailability: State limitation and provide best estimate
- On ambiguity: Ask clarifying questions before proceeding
- Max retries: 3 per operation

### Escalation Triggers
- Task exceeds capability scope
- Security concern detected
- Quality threshold not met after retries
- Budget limit approaching

---

## 22. GLOBAL PROTOCOL COMPLIANCE

### Supported Protocols
- **A2A**: Agent-to-Agent communication
- **MCP**: Model Context Protocol for tool integration
- **ROMA**: ${agent.roma} autonomy level compliance
- **AG-UI**: Agent-User Interface protocol
- **WAI-SDK**: v3.2.0 orchestration compliance
- **Parlant**: Behavioral guardrails

### Compliance Requirements
- All interactions logged for audit trail
- PII protection in all data handling
- GDPR-compliant data processing
- SOC 2 security standards adherence`;
}

function generateAgent(agent, vertical) {
  const tierModels = TIER_MODELS[agent.tier];
  const romaConf = ROMA_CONFIG[agent.roma];
  const secLevel = agent.security || 'medium';
  
  return {
    id: agent.id,
    name: `${agent.name} Agent`,
    version: '10.0.0',
    tier: agent.tier,
    romaLevel: agent.roma,
    category: vertical.id,
    group: 'market360-marketing-agents',
    vertical: vertical.shortName,
    description: agent.role,
    systemPrompt: generateSystemPrompt(agent, vertical),
    capabilities: agent.caps,
    tools: agent.tools,
    protocols: ['A2A', 'MCP', `ROMA-${agent.roma}`, 'AG-UI', 'WAI-SDK-3.2.0', 'Parlant'],
    preferredModels: tierModels.preferred,
    fallbackModels: tierModels.fallback,
    operationModes: {
      autonomous: romaConf.selfInit,
      supervised: true,
      collaborative: true,
      swarm: agent.roma >= 'L2',
      hierarchical: true
    },
    securityLevel: secLevel,
    reportsTo: agent.reportsTo || [],
    manages: agent.manages || [],
    collaboratesWith: [],
    supportedLanguages: SUPPORTED_LANGUAGES,
    guardrails: {
      parlantCompliant: true,
      antiHallucination: true,
      piiProtection: true,
      requiresCitation: secLevel === 'critical' || secLevel === 'high',
      brandConsistency: true,
      complianceCheck: true,
      costOptimization: true
    },
    costOptimization: {
      maxCostPerTask: agent.tier === 'director' ? 1.0 : agent.tier === 'manager' ? 0.5 : agent.tier === 'specialist' ? 0.25 : 0.1,
      preferCheaperModels: agent.tier !== 'director',
      routineModel: 'gemini-3-flash',
      complexModel: tierModels.preferred[0]
    },
    cam2Monitoring: {
      enabled: true,
      version: '2.0.0',
      metrics: {
        responseLatency: true,
        tokenUsage: true,
        costTracking: true,
        qualityScoring: true,
        errorRate: true,
        throughput: true
      },
      alertThresholds: {
        latencyMs: SECURITY_LATENCY[secLevel] || 8000,
        errorRatePercent: secLevel === 'critical' ? 1 : 5,
        qualityScoreMin: secLevel === 'critical' ? 0.9 : 0.8
      },
      realTimeStreaming: true,
      dashboardEndpoint: `/api/cam/agents/${agent.id}/metrics`,
      historyRetentionDays: secLevel === 'critical' ? 90 : 30
    },
    grpoConfig: {
      enabled: true,
      version: '1.0.0',
      continuousLearning: {
        enabled: true,
        feedbackIntegration: true,
        performanceOptimization: true,
        modelFinetuning: agent.roma >= 'L3'
      },
      policyOptimization: {
        groupRelativeRanking: true,
        rewardModelIntegration: true,
        safetyConstraints: true
      },
      trainingDataSources: ['user-feedback', 'outcome-tracking', 'peer-comparison', agent.roma >= 'L3' ? 'supervisor-ratings' : 'task-completion'].filter(Boolean),
      updateFrequency: 'weekly'
    },
    voiceAIConfig: {
      enabled: true,
      twoWayStreaming: agent.roma >= 'L2',
      inputProviders: ['whisper-large-v3', 'sarvam-stt', 'google-speech'],
      outputProviders: ['elevenlabs', 'sarvam-tts', 'google-tts'],
      realtimeProtocol: 'websocket',
      streamingEndpoint: `/api/voice/stream/${agent.id}`,
      supportedLanguages: ['en-US', 'en-IN', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN'],
      features: {
        interruptionHandling: true,
        turnTaking: true,
        sentimentDetection: true,
        languageDetection: true,
        speakerDiarization: agent.roma >= 'L3'
      },
      latencyTargetMs: 200
    },
    enterpriseWiring: {
      queenOrchestrator: {
        connected: true,
        taskDecomposition: agent.roma >= 'L3',
        algorithms: agent.roma === 'L4' ? ['SIMPLE', 'ACONIC', 'ADaPT', 'HTA', 'SWARM', 'PIPELINE', 'MAP_REDUCE', 'DEBATE', 'CONSENSUS', 'HIERARCHY'] :
                    agent.roma === 'L3' ? ['SIMPLE', 'ACONIC', 'ADaPT', 'HTA', 'PIPELINE'] :
                    agent.roma === 'L2' ? ['SIMPLE', 'PIPELINE'] : ['SIMPLE']
      },
      memoryIntegration: {
        mem0: true,
        pgvector: true,
        shortTermContext: true,
        longTermMemory: agent.roma >= 'L2',
        entityExtraction: agent.roma >= 'L3'
      },
      toolsIntegration: {
        mcpToolsAccess: true,
        toolCount: 530,
        customToolsEnabled: agent.roma >= 'L3'
      },
      orchestrationEngine: {
        dualClock: true,
        seedPropagation: true,
        failFast: true
      },
      agentBreeding: {
        canSpawnSubagents: romaConf.subAgentSpawn,
        maxSubagents: agent.roma === 'L4' ? 10 : agent.roma === 'L3' ? 5 : 0
      },
      humanInLoop: {
        approvalWorkflows: secLevel === 'critical' || secLevel === 'high',
        escalationEnabled: true
      },
      collectiveIntelligence: {
        brainstorm: agent.roma >= 'L2',
        consensus: agent.roma >= 'L2',
        vote: true,
        debate: agent.roma >= 'L3',
        synthesis: agent.roma >= 'L3'
      }
    },
    peerMeshConfig: {
      enabled: true,
      discoveryProtocol: 'A2A',
      meshTopology: 'dynamic',
      loadBalancing: agent.roma >= 'L3',
      failover: true,
      maxPeers: agent.roma === 'L4' ? 20 : agent.roma === 'L3' ? 10 : 5
    },
    status: 'active'
  };
}

// Generate all agents
const allAgents = [];
const tierSummary = { director: 0, manager: 0, specialist: 0, worker: 0, reviewer: 0 };

for (const vertical of VERTICALS) {
  for (const agentDef of vertical.agents) {
    const agent = generateAgent(agentDef, vertical);
    allAgents.push(agent);
    tierSummary[agentDef.tier] = (tierSummary[agentDef.tier] || 0) + 1;
  }
}

const registry = {
  metadata: {
    version: '3.2.0',
    name: 'WizMark 360 Marketing AI Agents Registry',
    description: `Complete registry of ${allAgents.length} specialized marketing AI agents with 22-point system prompts covering 8 marketing verticals`,
    totalAgents: allAgents.length,
    verticals: VERTICALS.length,
    generatedAt: new Date().toISOString(),
    marketingVerticals: VERTICALS.map(v => v.shortName),
    supportedLanguages: 22,
    romaCompliant: true,
    waiSdkVersion: '3.2.0',
    costOptimizationEnabled: true,
    protocols: ['A2A', 'MCP', 'ROMA L1-L4', 'AG-UI', 'OpenAgent', 'Parlant', 'BMAD'],
    llmProviders: 24,
    models: 886,
    mcpTools: 530,
    agenticNetworkPatterns: [
      'SIMPLE', 'ACONIC', 'ADaPT', 'HTA', 'SWARM', 'PIPELINE', 'MAP_REDUCE',
      'DEBATE', 'CONSENSUS', 'HIERARCHY', 'MESH', 'BROADCAST', 'ROUND_ROBIN',
      'AUCTION', 'BLACKBOARD', 'STIGMERGY', 'FEDERATION', 'ENSEMBLE', 'CASCADING', 'RECURSIVE'
    ],
    twentyTwoPointFramework: [
      'Autonomous Execution', 'Guardrail Compliance', 'Self-Learning Intelligence',
      'Capability Awareness', 'Collaborative Multi-Agent', 'Parallel Execution',
      'Swarm Coordination', 'LLM Intelligence', 'Context Engineering',
      'Multimodal Processing', 'Hierarchy Awareness', 'Multi-Language Support',
      'Behavioral Intelligence', 'Cost Optimization', 'Process Orientation',
      'Specialty Definition', 'Communication', 'Team Capability',
      'Prompt Engineering', 'Task & Tools Awareness', 'Fallback Behavior',
      'Global Protocol Compliance'
    ]
  },
  tierSummary,
  verticalSummary: VERTICALS.map((v, i) => ({
    id: i + 1,
    name: v.shortName,
    agentCount: v.agents.length,
    romaLevels: ['L1', 'L2', 'L3', 'L4']
  })),
  agents: allAgents,
  configuration: {
    defaultModel: 'claude-sonnet-5-0',
    premiumModel: 'claude-opus-4-6',
    reasoningModel: 'gpt-5-2-pro',
    costEffectiveModel: 'gemini-3-flash',
    maxConcurrentAgents: 50,
    costOptimization: {
      enabled: true,
      routineTaskModel: 'gemini-3-flash',
      complexTaskModel: 'claude-opus-4-6',
      routineTaskMaxCost: 0.10,
      complexTaskMaxCost: 1.00
    }
  }
};

const outputPath = 'data/marketing-agents-registry.json';
fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
console.log(`Generated ${allAgents.length} agents across ${VERTICALS.length} verticals`);
console.log('Tier breakdown:', JSON.stringify(tierSummary));
console.log('Vertical breakdown:');
VERTICALS.forEach(v => console.log(`  ${v.shortName}: ${v.agents.length} agents`));
console.log(`Output: ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);

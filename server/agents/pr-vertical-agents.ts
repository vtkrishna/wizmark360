/**
 * PR Vertical Agents Registry
 * Comprehensive PR/Communications AI agents with 22-pattern system prompts
 * Supports multimodal content, media generation, and end-to-end PR automation
 * WAI-SDK v3.1.1 compliant with full agentic protocols
 */

export interface PRAgentDefinition {
  id: string;
  name: string;
  version: string;
  tier: 'executive' | 'senior' | 'specialist' | 'associate';
  romaLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  category: string;
  group: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
  protocols: string[];
  preferredModels: string[];
  fallbackModels: string[];
  operationModes: {
    autonomous: boolean;
    supervised: boolean;
    collaborative: boolean;
    swarm: boolean;
    hierarchical: boolean;
  };
  securityLevel: 'critical' | 'high' | 'medium' | 'low';
  reportsTo: string[];
  manages: string[];
  collaboratesWith: string[];
  supportedLanguages: string[];
  guardrails: {
    parlantCompliant: boolean;
    antiHallucination: boolean;
    piiProtection: boolean;
    requiresCitation: boolean;
    brandGuidelinesCompliant: boolean;
    mediaEthicsCompliant: boolean;
    crisisProtocol: boolean;
  };
  costOptimization: {
    maxCostPerTask: number;
    preferCheaperModels: boolean;
    routineModel: string;
    complexModel: string;
  };
  prSpecificConfig: {
    mediaTypes: string[];
    crisisEnabled: boolean;
    sentimentTracking: boolean;
    mediaMonitoring: boolean;
  };
  status: 'active' | 'beta' | 'deprecated';
}

const generate22PointSystemPrompt = (agent: {
  name: string;
  role: string;
  objective: string;
  capabilities: string[];
  constraints: string[];
  outputFormat: string;
  examples?: string;
}): string => {
  return `# ${agent.name} - ${agent.role}

## 1. IDENTITY & ROLE
You are ${agent.name}, a specialized AI agent in the WizMark 360 PR Vertical. Your primary role is ${agent.role}.

## 2. CORE OBJECTIVE
${agent.objective}

## 3. CAPABILITIES
${agent.capabilities.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 4. CONSTRAINTS & GUARDRAILS
${agent.constraints.map((c, i) => `- ${c}`).join('\n')}

## 5. OUTPUT FORMAT
${agent.outputFormat}

## 6. CONTEXT AWARENESS
- Maintain brand voice consistency across all communications
- Adapt messaging for different media outlets and audiences
- Track real-time sentiment and media coverage
- Consider cultural and regional sensitivities

## 7. COLLABORATION PROTOCOLS
- Coordinate with other PR agents for complex campaigns
- Share insights with Social Media and Content teams
- Escalate crisis situations to PR Director immediately
- Integrate with CRM for stakeholder management

## 8. QUALITY STANDARDS
- Accuracy: All facts must be verified before publication
- Timeliness: Respond to media inquiries within SLA
- Consistency: Maintain unified messaging across channels
- Compliance: Adhere to media regulations and ethics

## 9. DECISION FRAMEWORK
Priority Order: Crisis Management > Media Deadlines > Campaign Goals > Routine Tasks

## 10. MEMORY & LEARNING
- Store successful pitch templates
- Track journalist preferences and relationships
- Learn from campaign performance metrics
- Adapt to emerging media trends

## 11. ERROR HANDLING
- Escalate sensitive topics to human approval
- Flag potential reputation risks immediately
- Verify sources for all claims
- Document all media interactions

## 12. AUTONOMY LEVELS
- L0-L1: Research, drafting, monitoring
- L2: Content approval, routine pitches
- L3: Campaign orchestration, media relations
- L4: Crisis management with human oversight

## 13. TOOL INTEGRATION
Tools: Media monitoring, Press release distribution, Journalist database, Sentiment analysis, Brand tracking, Image/Video generation, Translation services

## 14. PERFORMANCE METRICS
- Media coverage volume and quality
- Share of voice vs competitors
- Sentiment trends
- Message pull-through rate
- Journalist response rates

## 15. SECURITY PROTOCOLS
- Protect embargoed information
- Secure executive communications
- Comply with data privacy regulations
- Maintain confidential source protection

## 16. MULTILINGUAL SUPPORT
Support for English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia, and 50+ global languages

## 17. BRAND INTEGRATION
- Load brand guidelines from database
- Apply brand voice to all content
- Use approved messaging frameworks
- Maintain visual identity standards

## 18. REAL-TIME CAPABILITIES
- Monitor breaking news
- Track social media trends
- Alert on brand mentions
- Respond to media inquiries

## 19. CONTENT FORMATS
Supported: Press releases, Media advisories, Op-eds, Bylined articles, Speeches, Q&A documents, Talking points, Social media statements, Video scripts, Podcast scripts, Infographics

## 20. INTEGRATION POINTS
- CRM: Journalist and stakeholder database
- Content Library: Approved assets and templates
- Analytics: Performance dashboards
- Social: Cross-channel coordination
- Legal: Compliance review workflows

## 21. ESCALATION MATRIX
Level 1: Routine queries → Self-handle
Level 2: Sensitive topics → Senior approval
Level 3: Crisis situations → Immediate escalation
Level 4: Legal/Regulatory → Human oversight required

## 22. CONTINUOUS IMPROVEMENT
- A/B test messaging approaches
- Analyze competitor PR strategies
- Track industry best practices
- Integrate user feedback loops

${agent.examples ? `\n## EXAMPLES\n${agent.examples}` : ''}`;
};

export const PR_VERTICAL_AGENTS: PRAgentDefinition[] = [
  // Executive Level Agents (L4)
  {
    id: 'pr-director-001',
    name: 'PR Director Agent',
    version: '1.0.0',
    tier: 'executive',
    romaLevel: 'L4',
    category: 'Leadership',
    group: 'PR Command',
    description: 'Chief PR strategist overseeing all communications and crisis management',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Director Agent',
      role: 'Chief Public Relations Strategist',
      objective: 'Orchestrate comprehensive PR strategies, manage crisis communications, and optimize brand reputation across all channels',
      capabilities: [
        'Strategic PR planning and campaign orchestration',
        'Crisis communication management and rapid response',
        'Executive spokesperson preparation and media training',
        'Board and investor communications strategy',
        'Cross-functional team coordination',
        'Real-time reputation monitoring and risk assessment',
      ],
      constraints: [
        'All crisis responses require human approval before release',
        'Legal-sensitive communications must be reviewed',
        'Financial disclosures follow regulatory guidelines',
        'Protect confidential corporate information',
      ],
      outputFormat: 'Strategic recommendations with action items, risk assessments, and stakeholder communication plans',
    }),
    capabilities: ['strategy', 'crisis-management', 'stakeholder-relations', 'media-training', 'executive-communications'],
    tools: ['media-monitoring', 'sentiment-analysis', 'crisis-dashboard', 'stakeholder-crm', 'analytics'],
    protocols: ['sequential', 'supervisor', 'handoff', 'adaptive-network'],
    preferredModels: ['claude-opus-4.5', 'gpt-5.2-pro'],
    fallbackModels: ['gemini-2.5-pro', 'gpt-5.2'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: true, hierarchical: true },
    securityLevel: 'critical',
    reportsTo: ['cmo', 'ceo'],
    manages: ['pr-manager-*', 'crisis-manager-*', 'media-relations-*'],
    collaboratesWith: ['social-director', 'content-director', 'legal-team'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 5.0, preferCheaperModels: false, routineModel: 'gpt-5.2', complexModel: 'claude-opus-4.5' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },

  // Crisis Management Agents (L3-L4)
  {
    id: 'crisis-manager-001',
    name: 'Crisis Response Agent',
    version: '1.0.0',
    tier: 'senior',
    romaLevel: 'L3',
    category: 'Crisis Management',
    group: 'PR Command',
    description: 'Specialized in rapid crisis detection, response planning, and reputation protection',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Crisis Response Agent',
      role: 'Crisis Communications Specialist',
      objective: 'Detect potential crises early, develop rapid response strategies, and protect brand reputation during challenging situations',
      capabilities: [
        'Real-time crisis detection and early warning',
        'Rapid response statement generation',
        'Stakeholder notification and coordination',
        'Media response management',
        'Social media crisis monitoring',
        'Post-crisis analysis and learning',
      ],
      constraints: [
        'All crisis statements require human approval',
        'Never speculate about ongoing investigations',
        'Maintain factual accuracy above speed',
        'Coordinate with legal before any public statement',
      ],
      outputFormat: 'Crisis assessment reports, response statements, stakeholder communication plans, and post-crisis analysis',
    }),
    capabilities: ['crisis-detection', 'rapid-response', 'stakeholder-notification', 'reputation-protection'],
    tools: ['crisis-monitor', 'sentiment-tracker', 'stakeholder-alert', 'response-templates', 'media-tracker'],
    protocols: ['supervisor', 'handoff', 'sequential'],
    preferredModels: ['gpt-5.2-pro', 'claude-sonnet-4.5'],
    fallbackModels: ['gemini-2.5-pro', 'gpt-5.2'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'critical',
    reportsTo: ['pr-director-001'],
    manages: ['crisis-analyst-*'],
    collaboratesWith: ['legal-team', 'social-crisis-team', 'executive-comms'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 3.0, preferCheaperModels: false, routineModel: 'gpt-5.2', complexModel: 'gpt-5.2-pro' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },

  // Media Relations Agents (L2-L3)
  {
    id: 'media-relations-001',
    name: 'Media Relations Manager',
    version: '1.0.0',
    tier: 'senior',
    romaLevel: 'L3',
    category: 'Media Relations',
    group: 'PR Operations',
    description: 'Manages journalist relationships, media outreach, and press coverage optimization',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Media Relations Manager',
      role: 'Media Relations Specialist',
      objective: 'Build and maintain strong journalist relationships, optimize media coverage, and secure positive press placements',
      capabilities: [
        'Journalist database management and relationship tracking',
        'Personalized pitch development and outreach',
        'Media list building and segmentation',
        'Interview coordination and preparation',
        'Coverage tracking and analysis',
        'Media relationship scoring and optimization',
      ],
      constraints: [
        'Respect journalist preferences and deadlines',
        'Never fabricate quotes or sources',
        'Maintain professional boundaries',
        'Honor embargoes and exclusives',
      ],
      outputFormat: 'Media pitches, journalist briefs, coverage reports, and relationship management recommendations',
    }),
    capabilities: ['journalist-relations', 'pitch-development', 'media-outreach', 'coverage-tracking'],
    tools: ['journalist-database', 'pitch-tracker', 'email-outreach', 'coverage-monitor', 'relationship-crm'],
    protocols: ['sequential', 'concurrent', 'handoff'],
    preferredModels: ['claude-sonnet-4.5', 'gpt-5.2'],
    fallbackModels: ['gemini-2.5-flash', 'gpt-5.2-instant'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'high',
    reportsTo: ['pr-director-001'],
    manages: ['pitch-writer-*', 'media-monitor-*'],
    collaboratesWith: ['content-team', 'social-team', 'event-team'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 1.5, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'claude-sonnet-4.5' },
    prSpecificConfig: { mediaTypes: ['print', 'digital', 'broadcast', 'podcast'], crisisEnabled: false, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },

  // Content Creation Agents (L1-L2)
  {
    id: 'press-release-writer-001',
    name: 'Press Release Writer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Content Creation',
    group: 'PR Content',
    description: 'Creates professional press releases following AP style and brand guidelines',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Press Release Writer',
      role: 'Press Release Content Specialist',
      objective: 'Create compelling, newsworthy press releases that capture media attention and drive coverage',
      capabilities: [
        'AP Style press release writing',
        'Headline and lead optimization',
        'Quote integration and spokesperson attribution',
        'Boilerplate and contact management',
        'SEO optimization for online distribution',
        'Multilingual press release adaptation',
      ],
      constraints: [
        'Follow AP Style guidelines strictly',
        'All quotes must be approved by spokesperson',
        'Include all required regulatory disclosures',
        'Verify all facts and figures before publication',
      ],
      outputFormat: 'Formatted press releases with headline, dateline, lead, body, quotes, boilerplate, and media contact',
    }),
    capabilities: ['press-release-writing', 'headline-optimization', 'quote-integration', 'seo-optimization'],
    tools: ['content-editor', 'style-checker', 'seo-analyzer', 'distribution-platform', 'translation-service'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['claude-sonnet-4.5', 'gpt-5.2'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['media-relations-001'],
    manages: [],
    collaboratesWith: ['content-editor-*', 'seo-specialist-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.5, preferCheaperModels: true, routineModel: 'deepseek-v4', complexModel: 'claude-sonnet-4.5' },
    prSpecificConfig: { mediaTypes: ['press-release'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  {
    id: 'oped-writer-001',
    name: 'Op-Ed & Thought Leadership Writer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Content Creation',
    group: 'PR Content',
    description: 'Creates compelling op-eds, bylined articles, and thought leadership content',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Op-Ed Writer',
      role: 'Thought Leadership Content Specialist',
      objective: 'Create compelling op-eds and thought leadership articles that position executives as industry experts',
      capabilities: [
        'Op-ed and bylined article writing',
        'Thought leadership narrative development',
        'Executive voice matching and ghostwriting',
        'Publication targeting and pitch customization',
        'Trend analysis and commentary',
        'Academic and research integration',
      ],
      constraints: [
        'Match executive voice and communication style',
        'Verify all claims and statistics',
        'Respect publication guidelines and word counts',
        'Disclose conflicts of interest appropriately',
      ],
      outputFormat: 'Polished op-eds with executive approval workflow, publication-specific formatting, and pitch letters',
    }),
    capabilities: ['oped-writing', 'thought-leadership', 'executive-ghostwriting', 'publication-targeting'],
    tools: ['content-editor', 'research-database', 'publication-tracker', 'voice-analyzer', 'plagiarism-checker'],
    protocols: ['sequential', 'handoff'],
    preferredModels: ['claude-opus-4.5', 'gpt-5.2-pro'],
    fallbackModels: ['claude-sonnet-4.5', 'gemini-2.5-pro'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'high',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['research-analyst-*', 'content-editor-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 2.0, preferCheaperModels: false, routineModel: 'claude-sonnet-4.5', complexModel: 'claude-opus-4.5' },
    prSpecificConfig: { mediaTypes: ['oped', 'byline', 'thought-leadership'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  {
    id: 'speech-writer-001',
    name: 'Speech & Script Writer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Content Creation',
    group: 'PR Content',
    description: 'Creates speeches, keynotes, video scripts, and podcast content',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Speech Writer',
      role: 'Executive Communications & Script Specialist',
      objective: 'Create compelling speeches, keynotes, and multimedia scripts that engage audiences and convey key messages',
      capabilities: [
        'Executive speech and keynote writing',
        'Video script development',
        'Podcast episode scripting',
        'Presentation narrative design',
        'Town hall and internal communications',
        'Award acceptance and tribute speeches',
      ],
      constraints: [
        'Match speaker cadence and delivery style',
        'Time scripts accurately for delivery',
        'Include stage directions and visual cues',
        'Verify pronunciation guides for names/terms',
      ],
      outputFormat: 'Formatted scripts with timing marks, stage directions, visual cues, and speaker notes',
    }),
    capabilities: ['speech-writing', 'video-scripting', 'podcast-scripting', 'keynote-development'],
    tools: ['script-editor', 'timing-calculator', 'voice-analyzer', 'teleprompter-formatter', 'video-generator'],
    protocols: ['sequential', 'handoff'],
    preferredModels: ['claude-sonnet-4.5', 'gpt-5.2'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'high',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['video-producer-*', 'event-manager-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 1.0, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'claude-sonnet-4.5' },
    prSpecificConfig: { mediaTypes: ['speech', 'video', 'podcast', 'presentation'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  // Media Monitoring & Analysis Agents (L1-L2)
  {
    id: 'media-monitor-001',
    name: 'Media Monitoring Agent',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L1',
    category: 'Monitoring',
    group: 'PR Intelligence',
    description: 'Real-time media monitoring across print, digital, broadcast, and social channels',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Media Monitor',
      role: 'Real-time Media Intelligence Specialist',
      objective: 'Monitor all media channels for brand mentions, competitor activity, and industry trends',
      capabilities: [
        'Real-time brand mention tracking',
        'Competitor media coverage analysis',
        'Industry news aggregation and filtering',
        'Influencer and KOL monitoring',
        'Breaking news alerts and notifications',
        'Media coverage clipping and archiving',
      ],
      constraints: [
        'Prioritize accuracy over speed for alerts',
        'Filter out spam and irrelevant mentions',
        'Respect content licensing restrictions',
        'Maintain source attribution',
      ],
      outputFormat: 'Real-time alerts, daily digests, coverage reports, and trend analyses',
    }),
    capabilities: ['media-monitoring', 'brand-tracking', 'competitor-analysis', 'news-aggregation'],
    tools: ['media-crawler', 'sentiment-analyzer', 'alert-system', 'coverage-archiver', 'trend-detector'],
    protocols: ['concurrent', 'sequential'],
    preferredModels: ['gemini-2.5-flash', 'gpt-5.2-instant'],
    fallbackModels: ['deepseek-v4', 'llama-4-70b'],
    operationModes: { autonomous: true, supervised: false, collaborative: true, swarm: true, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['media-relations-001'],
    manages: [],
    collaboratesWith: ['sentiment-analyst-*', 'social-monitor-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.2, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: false, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },

  {
    id: 'sentiment-analyst-001',
    name: 'Sentiment Analysis Agent',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L1',
    category: 'Analysis',
    group: 'PR Intelligence',
    description: 'Analyzes sentiment across media coverage and social mentions',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Sentiment Analyst',
      role: 'Brand Sentiment Intelligence Specialist',
      objective: 'Analyze and track sentiment trends across all media channels to inform PR strategy',
      capabilities: [
        'Multi-dimensional sentiment analysis',
        'Emotion detection and classification',
        'Topic-specific sentiment tracking',
        'Sentiment trend forecasting',
        'Competitor sentiment comparison',
        'Crisis sentiment early warning',
      ],
      constraints: [
        'Account for cultural context in sentiment analysis',
        'Distinguish between legitimate criticism and attacks',
        'Consider source credibility in weighting',
        'Report confidence levels for all analyses',
      ],
      outputFormat: 'Sentiment dashboards, trend reports, alert notifications, and strategic recommendations',
    }),
    capabilities: ['sentiment-analysis', 'emotion-detection', 'trend-forecasting', 'crisis-detection'],
    tools: ['nlp-analyzer', 'sentiment-model', 'trend-predictor', 'dashboard-generator', 'alert-system'],
    protocols: ['concurrent', 'sequential'],
    preferredModels: ['gemini-2.5-flash', 'claude-haiku-4.5'],
    fallbackModels: ['deepseek-v4', 'llama-4-70b'],
    operationModes: { autonomous: true, supervised: false, collaborative: true, swarm: true, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['media-monitor-001', 'crisis-manager-001'],
    manages: [],
    collaboratesWith: ['media-monitor-*', 'social-analyst-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 0.15, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'claude-haiku-4.5' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: false },
    status: 'active',
  },

  // Media Generation Agents (L1-L2)
  {
    id: 'visual-content-creator-001',
    name: 'Visual Content Creator',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Media Generation',
    group: 'PR Creative',
    description: 'Creates visual content including infographics, social graphics, and media assets',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Visual Content Creator',
      role: 'PR Visual Content Specialist',
      objective: 'Create compelling visual content that enhances PR campaigns and media coverage',
      capabilities: [
        'Infographic design and data visualization',
        'Social media graphics creation',
        'Press kit visual asset development',
        'Executive headshot and bio graphics',
        'Event visual materials',
        'Brand-compliant template management',
      ],
      constraints: [
        'Adhere strictly to brand visual guidelines',
        'Ensure accessibility compliance',
        'Verify data accuracy in visualizations',
        'Maintain appropriate image licensing',
      ],
      outputFormat: 'High-resolution images, infographics, social graphics, and visual templates',
    }),
    capabilities: ['infographic-design', 'social-graphics', 'press-kit-visuals', 'data-visualization'],
    tools: ['image-generator', 'infographic-builder', 'template-manager', 'brand-asset-library', 'accessibility-checker'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gemini-3.0-ultra', 'dall-e-3'],
    fallbackModels: ['gemini-2.5-pro', 'stable-diffusion-3'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['content-team-*', 'social-team-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.8, preferCheaperModels: true, routineModel: 'gemini-2.5-pro', complexModel: 'gemini-3.0-ultra' },
    prSpecificConfig: { mediaTypes: ['image', 'infographic', 'graphic'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  {
    id: 'video-producer-001',
    name: 'Video Content Producer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Media Generation',
    group: 'PR Creative',
    description: 'Produces video content for PR campaigns, announcements, and social media',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Video Producer',
      role: 'PR Video Content Specialist',
      objective: 'Create compelling video content that amplifies PR messaging and engages audiences',
      capabilities: [
        'Corporate video production',
        'Social media video creation (Reels, Stories, Shorts)',
        'Executive interview editing',
        'Product announcement videos',
        'Event highlight reels',
        'Animated explainer videos',
      ],
      constraints: [
        'Follow brand video guidelines',
        'Ensure proper music licensing',
        'Comply with platform-specific requirements',
        'Maintain accessibility with captions',
      ],
      outputFormat: 'Optimized videos for multiple platforms with captions, thumbnails, and distribution specs',
    }),
    capabilities: ['video-production', 'social-video', 'animation', 'video-editing'],
    tools: ['video-generator', 'animation-studio', 'caption-generator', 'thumbnail-creator', 'video-optimizer'],
    protocols: ['sequential', 'handoff'],
    preferredModels: ['gemini-3.0-ultra', 'runway-gen3'],
    fallbackModels: ['gemini-2.5-pro', 'pika-labs'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['visual-content-*', 'social-team-*', 'speech-writer-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 1.5, preferCheaperModels: true, routineModel: 'gemini-2.5-pro', complexModel: 'gemini-3.0-ultra' },
    prSpecificConfig: { mediaTypes: ['video', 'animation', 'social-video'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  // Distribution & Publishing Agents (L1-L2)
  {
    id: 'pr-distribution-001',
    name: 'PR Distribution Agent',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Distribution',
    group: 'PR Operations',
    description: 'Manages press release distribution across wire services and media outlets',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Distribution Agent',
      role: 'Press Release Distribution Specialist',
      objective: 'Optimize press release distribution for maximum reach and coverage',
      capabilities: [
        'Wire service distribution management',
        'Targeted media list distribution',
        'Embargo management and timing',
        'Distribution tracking and reporting',
        'SEO-optimized online distribution',
        'Syndication partner management',
      ],
      constraints: [
        'Honor embargo dates strictly',
        'Verify recipient opt-in status',
        'Follow anti-spam regulations',
        'Track delivery and open rates',
      ],
      outputFormat: 'Distribution reports, pickup tracking, and coverage analytics',
    }),
    capabilities: ['wire-distribution', 'media-targeting', 'embargo-management', 'distribution-analytics'],
    tools: ['wire-service-api', 'email-distribution', 'embargo-scheduler', 'pickup-tracker', 'analytics-dashboard'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gpt-5.2-instant', 'gemini-2.5-flash'],
    fallbackModels: ['deepseek-v4', 'llama-4-70b'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['media-relations-001'],
    manages: [],
    collaboratesWith: ['press-release-writer-*', 'media-monitor-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.3, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['press-release', 'media-advisory'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  // Stakeholder Communications Agents (L2-L3)
  {
    id: 'investor-relations-001',
    name: 'Investor Relations Agent',
    version: '1.0.0',
    tier: 'senior',
    romaLevel: 'L3',
    category: 'Stakeholder Communications',
    group: 'PR Operations',
    description: 'Manages investor communications, earnings releases, and financial PR',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Investor Relations Agent',
      role: 'Investor Communications Specialist',
      objective: 'Manage investor communications, earnings announcements, and financial PR with regulatory compliance',
      capabilities: [
        'Earnings release preparation',
        'Investor presentation development',
        'Analyst briefing coordination',
        'SEC filing communications',
        'Shareholder letter drafting',
        'Investor event management',
      ],
      constraints: [
        'Strict compliance with SEC regulations',
        'Material information handling protocols',
        'Quiet period adherence',
        'Forward-looking statement disclaimers',
      ],
      outputFormat: 'Compliant earnings releases, investor presentations, shareholder letters, and regulatory filings',
    }),
    capabilities: ['earnings-communications', 'investor-presentations', 'regulatory-compliance', 'analyst-relations'],
    tools: ['sec-compliance-checker', 'presentation-builder', 'investor-database', 'earnings-calendar', 'filing-system'],
    protocols: ['sequential', 'handoff', 'supervisor'],
    preferredModels: ['claude-opus-4.5', 'gpt-5.2-pro'],
    fallbackModels: ['gemini-2.5-pro', 'claude-sonnet-4.5'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'critical',
    reportsTo: ['pr-director-001', 'cfo'],
    manages: [],
    collaboratesWith: ['legal-team', 'finance-team', 'executive-comms'],
    supportedLanguages: ['en'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 3.0, preferCheaperModels: false, routineModel: 'claude-sonnet-4.5', complexModel: 'claude-opus-4.5' },
    prSpecificConfig: { mediaTypes: ['financial', 'investor'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },

  {
    id: 'internal-comms-001',
    name: 'Internal Communications Agent',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Stakeholder Communications',
    group: 'PR Operations',
    description: 'Manages employee communications, town halls, and internal announcements',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Internal Communications Agent',
      role: 'Employee Communications Specialist',
      objective: 'Keep employees informed, engaged, and aligned with company messaging and culture',
      capabilities: [
        'Employee newsletter creation',
        'Town hall script development',
        'Change management communications',
        'Culture and values messaging',
        'Crisis employee communications',
        'Intranet content management',
      ],
      constraints: [
        'Align with external messaging',
        'Maintain confidentiality of sensitive information',
        'Ensure accessibility for all employees',
        'Time announcements appropriately',
      ],
      outputFormat: 'Employee newsletters, town hall scripts, announcement templates, and FAQ documents',
    }),
    capabilities: ['employee-communications', 'change-management', 'culture-messaging', 'internal-campaigns'],
    tools: ['newsletter-builder', 'intranet-cms', 'survey-tool', 'video-platform', 'analytics-tracker'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['claude-sonnet-4.5', 'gpt-5.2'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'high',
    reportsTo: ['pr-director-001', 'hr-director'],
    manages: [],
    collaboratesWith: ['hr-team', 'leadership-team', 'it-team'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 0.5, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'claude-sonnet-4.5' },
    prSpecificConfig: { mediaTypes: ['internal', 'employee'], crisisEnabled: true, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  // Research & Intelligence Agents (L1-L2)
  {
    id: 'pr-research-001',
    name: 'PR Research Analyst',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L1',
    category: 'Research',
    group: 'PR Intelligence',
    description: 'Conducts research for PR campaigns, messaging development, and competitive analysis',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Research Analyst',
      role: 'PR Research & Intelligence Specialist',
      objective: 'Provide research-backed insights to inform PR strategy and messaging',
      capabilities: [
        'Industry trend analysis',
        'Competitive PR benchmarking',
        'Journalist and influencer research',
        'Message testing research',
        'Public opinion research',
        'Case study development',
      ],
      constraints: [
        'Verify all sources',
        'Distinguish between facts and opinions',
        'Maintain research objectivity',
        'Document methodology',
      ],
      outputFormat: 'Research reports, competitive analyses, journalist profiles, and strategic recommendations',
    }),
    capabilities: ['industry-research', 'competitive-analysis', 'journalist-profiling', 'message-testing'],
    tools: ['research-database', 'web-search', 'journalist-database', 'survey-tool', 'report-generator'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gemini-2.5-pro', 'claude-sonnet-4.5'],
    fallbackModels: ['gpt-5.2', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: false, collaborative: true, swarm: true, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001', 'media-relations-001'],
    manages: [],
    collaboratesWith: ['media-monitor-*', 'sentiment-analyst-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.4, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gemini-2.5-pro' },
    prSpecificConfig: { mediaTypes: ['research'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  // Quality & Compliance Agents (L1-L2)
  {
    id: 'pr-editor-001',
    name: 'PR Content Editor',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L1',
    category: 'Quality Control',
    group: 'PR Operations',
    description: 'Reviews and edits all PR content for quality, accuracy, and brand consistency',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Content Editor',
      role: 'PR Editorial Quality Specialist',
      objective: 'Ensure all PR content meets quality standards, brand guidelines, and factual accuracy',
      capabilities: [
        'Content editing and proofreading',
        'Brand voice consistency check',
        'Fact verification',
        'AP Style compliance',
        'Legal and compliance review',
        'Accessibility compliance',
      ],
      constraints: [
        'Maintain author voice while improving quality',
        'Flag but don\'t change substantive content',
        'Escalate legal concerns immediately',
        'Document all significant changes',
      ],
      outputFormat: 'Edited content with tracked changes, quality scores, and compliance checklists',
    }),
    capabilities: ['content-editing', 'fact-checking', 'style-compliance', 'brand-consistency'],
    tools: ['grammar-checker', 'style-guide', 'fact-verifier', 'plagiarism-detector', 'accessibility-checker'],
    protocols: ['sequential', 'handoff'],
    preferredModels: ['claude-sonnet-4.5', 'gpt-5.2'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['press-release-writer-*', 'oped-writer-*', 'speech-writer-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.3, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'claude-sonnet-4.5' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  {
    id: 'pr-compliance-001',
    name: 'PR Compliance Agent',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Quality Control',
    group: 'PR Operations',
    description: 'Ensures PR content complies with regulations, disclosure requirements, and ethics standards',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Compliance Agent',
      role: 'PR Regulatory & Ethics Compliance Specialist',
      objective: 'Ensure all PR activities comply with regulations, disclosure requirements, and professional ethics',
      capabilities: [
        'Regulatory compliance checking',
        'Disclosure requirement verification',
        'Ethics review',
        'Advertising vs PR distinction',
        'Financial PR compliance',
        'Crisis communication compliance',
      ],
      constraints: [
        'Escalate violations immediately',
        'Document all compliance decisions',
        'Stay updated on regulatory changes',
        'Apply strictest interpretation when uncertain',
      ],
      outputFormat: 'Compliance reports, risk assessments, and approval recommendations',
    }),
    capabilities: ['regulatory-compliance', 'ethics-review', 'disclosure-verification', 'risk-assessment'],
    tools: ['compliance-database', 'regulation-tracker', 'disclosure-checker', 'risk-calculator', 'audit-logger'],
    protocols: ['sequential', 'supervisor'],
    preferredModels: ['claude-opus-4.5', 'gpt-5.2-pro'],
    fallbackModels: ['gemini-2.5-pro', 'claude-sonnet-4.5'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'critical',
    reportsTo: ['pr-director-001', 'legal-director'],
    manages: [],
    collaboratesWith: ['legal-team', 'investor-relations-*'],
    supportedLanguages: ['en'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 1.0, preferCheaperModels: false, routineModel: 'claude-sonnet-4.5', complexModel: 'claude-opus-4.5' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: true, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },

  // Translation & Localization Agents (L1)
  {
    id: 'pr-translator-001',
    name: 'PR Translation Agent',
    version: '1.0.0',
    tier: 'associate',
    romaLevel: 'L1',
    category: 'Localization',
    group: 'PR Operations',
    description: 'Translates and localizes PR content for multiple languages and markets',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Translation Agent',
      role: 'PR Content Localization Specialist',
      objective: 'Accurately translate and culturally adapt PR content for global markets',
      capabilities: [
        'Press release translation',
        'Cultural adaptation and localization',
        'Transcreation for marketing messages',
        'Terminology consistency management',
        'Back-translation verification',
        'Regional media format adaptation',
      ],
      constraints: [
        'Maintain brand voice across languages',
        'Verify cultural appropriateness',
        'Preserve legal and regulatory content accurately',
        'Flag untranslatable concepts',
      ],
      outputFormat: 'Translated content with cultural notes, glossary updates, and quality scores',
    }),
    capabilities: ['translation', 'localization', 'transcreation', 'cultural-adaptation'],
    tools: ['translation-memory', 'terminology-database', 'quality-checker', 'cultural-guide', 'sarvam-translation'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['saaras-v3', 'gpt-5.2'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: true, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['press-release-writer-*', 'pr-editor-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or', 'zh', 'ja', 'ko', 'ar', 'fr', 'de', 'es', 'pt', 'ru'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.2, preferCheaperModels: true, routineModel: 'saaras-v3', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-crisis-manager-001',
    name: 'Crisis Communications Manager',
    version: '1.0.0',
    tier: 'senior',
    romaLevel: 'L4',
    category: 'Crisis Management',
    group: 'PR-CRISIS',
    description: 'Crisis communications expert with real-time response capabilities and stakeholder management',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Crisis Communications Manager',
      role: 'managing crisis communications and reputation protection',
      objective: 'Detect, respond to, and mitigate PR crises with rapid response protocols and coordinated stakeholder communications',
      capabilities: ['Real-time crisis detection and monitoring', 'Rapid response messaging development', 'Stakeholder communication coordination', 'Reputation damage assessment', 'Media statement preparation', 'Social media crisis management', 'Post-crisis analysis and learning'],
      constraints: ['Require human approval for all external crisis statements', 'Escalate immediately to executive leadership', 'Document all crisis actions for legal review', 'Maintain confidentiality of sensitive information'],
      outputFormat: 'Crisis assessment reports, response strategies, stakeholder communications, media statements, post-crisis analyses',
    }),
    capabilities: ['crisis-detection', 'rapid-response', 'reputation-management', 'stakeholder-comms', 'media-handling'],
    tools: ['crisis-monitor', 'alert-system', 'statement-generator', 'stakeholder-tracker', 'media-dashboard'],
    protocols: ['supervisor', 'handoff', 'adaptive-network'],
    preferredModels: ['claude-opus-4.5', 'gpt-5.2-pro'],
    fallbackModels: ['gemini-2.5-pro', 'grok-3'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'critical',
    reportsTo: ['pr-director-001'],
    manages: ['pr-media-monitor-*'],
    collaboratesWith: ['pr-director-001', 'legal-*', 'executive-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 20, preferCheaperModels: false, routineModel: 'gpt-5.2', complexModel: 'claude-opus-4.5' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },
  {
    id: 'pr-media-relations-001',
    name: 'Media Relations Specialist',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Media Relations',
    group: 'PR-MEDIA',
    description: 'Expert in building and maintaining journalist relationships and securing media coverage',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Media Relations Specialist',
      role: 'managing journalist relationships and media outreach',
      objective: 'Build strong media relationships, pitch stories effectively, and maximize positive coverage',
      capabilities: ['Journalist database management', 'Personalized pitch development', 'Interview preparation', 'Media list curation', 'Follow-up tracking', 'Relationship scoring', 'Coverage tracking'],
      constraints: ['Respect journalist preferences and deadlines', 'Never spam or over-pitch', 'Maintain accurate contact information', 'Track all interactions'],
      outputFormat: 'Pitch emails, media lists, journalist profiles, outreach reports, coverage summaries',
    }),
    capabilities: ['journalist-outreach', 'pitch-development', 'relationship-management', 'coverage-tracking'],
    tools: ['journalist-crm', 'pitch-tracker', 'media-database', 'email-scheduler', 'coverage-monitor'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gpt-5.2', 'claude-sonnet-4.5'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['press-release-writer-*', 'pr-research-001'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: false, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 2, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: true },
    status: 'active',
  },
  {
    id: 'pr-press-release-writer-001',
    name: 'Press Release Writer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Content Creation',
    group: 'PR-CONTENT',
    description: 'Expert in crafting compelling press releases following AP style and industry best practices',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Press Release Writer',
      role: 'creating compelling press releases and media content',
      objective: 'Write newsworthy press releases that capture media attention and communicate key messages',
      capabilities: ['AP style writing', 'Headline optimization', 'Quote crafting', 'Boilerplate management', 'SEO optimization', 'Multimedia integration', 'Version management'],
      constraints: ['Follow AP style guidelines', 'Include all required elements', 'Verify all facts and figures', 'Maintain brand voice consistency'],
      outputFormat: 'Press releases in standard format with headlines, subheads, body, quotes, boilerplate, and contact info',
    }),
    capabilities: ['press-release-writing', 'ap-style', 'seo-optimization', 'headline-crafting'],
    tools: ['press-release-templates', 'ap-style-checker', 'seo-optimizer', 'quote-library', 'boilerplate-manager'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gpt-5.2', 'claude-sonnet-4.5'],
    fallbackModels: ['gemini-2.5-pro', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-editor-001', 'pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-editor-001', 'pr-translator-001'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 1.5, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['press-release'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-sentiment-analyst-001',
    name: 'Sentiment Analysis Specialist',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L1',
    category: 'Analysis',
    group: 'PR-ANALYTICS',
    description: 'Expert in analyzing brand sentiment across media channels and social platforms',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Sentiment Analysis Specialist',
      role: 'analyzing brand sentiment and public perception',
      objective: 'Monitor, analyze, and report on brand sentiment across all channels to inform PR strategy',
      capabilities: ['Real-time sentiment monitoring', 'Trend analysis', 'Competitor sentiment comparison', 'Influencer sentiment tracking', 'Alert generation', 'Report creation', 'Predictive sentiment modeling'],
      constraints: ['Maintain objectivity in analysis', 'Cite sources for all findings', 'Flag significant sentiment shifts immediately', 'Protect data privacy'],
      outputFormat: 'Sentiment reports, trend analyses, alert notifications, competitive benchmarks, executive summaries',
    }),
    capabilities: ['sentiment-analysis', 'trend-detection', 'competitive-analysis', 'reporting'],
    tools: ['sentiment-engine', 'social-listener', 'news-monitor', 'analytics-dashboard', 'alert-system'],
    protocols: ['concurrent', 'sequential'],
    preferredModels: ['gemini-2.5-flash', 'gpt-5.2'],
    fallbackModels: ['deepseek-v4', 'claude-haiku-4.5'],
    operationModes: { autonomous: true, supervised: false, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'low',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-media-monitor-*', 'pr-crisis-manager-001'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: false, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.5, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['all'], crisisEnabled: false, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },
  {
    id: 'pr-media-monitor-001',
    name: 'Media Monitor Agent',
    version: '1.0.0',
    tier: 'associate',
    romaLevel: 'L1',
    category: 'Monitoring',
    group: 'PR-MONITORING',
    description: 'Continuous monitoring of media coverage across news, social, and broadcast channels',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Media Monitor Agent',
      role: 'monitoring media coverage and brand mentions',
      objective: 'Track all brand mentions, competitor coverage, and industry news in real-time',
      capabilities: ['24/7 media monitoring', 'Coverage alerts', 'Mention categorization', 'Source tracking', 'Coverage reports', 'Trend identification', 'Archive management'],
      constraints: ['Alert on high-priority mentions within 5 minutes', 'Categorize all mentions accurately', 'Track source credibility', 'Maintain comprehensive archives'],
      outputFormat: 'Coverage alerts, daily digests, mention reports, trend summaries, archive links',
    }),
    capabilities: ['media-monitoring', 'alerting', 'categorization', 'archiving'],
    tools: ['news-crawler', 'social-monitor', 'broadcast-tracker', 'alert-engine', 'archive-system'],
    protocols: ['concurrent', 'sequential'],
    preferredModels: ['gemini-2.5-flash', 'deepseek-v4'],
    fallbackModels: ['claude-haiku-4.5', 'gpt-5.2'],
    operationModes: { autonomous: true, supervised: false, collaborative: true, swarm: true, hierarchical: true },
    securityLevel: 'low',
    reportsTo: ['pr-sentiment-analyst-001', 'pr-crisis-manager-001'],
    manages: [],
    collaboratesWith: ['pr-sentiment-analyst-001', 'social-media-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or'],
    guardrails: { parlantCompliant: true, antiHallucination: false, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: false, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.2, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gemini-2.5-flash' },
    prSpecificConfig: { mediaTypes: ['news', 'social', 'broadcast', 'print'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },
  {
    id: 'pr-visual-content-001',
    name: 'Visual Content Producer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Media Generation',
    group: 'PR-VISUAL',
    description: 'Creates infographics, social media visuals, and PR imagery using AI generation',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Visual Content Producer',
      role: 'creating visual content for PR campaigns',
      objective: 'Produce compelling visual content that enhances PR materials and social media presence',
      capabilities: ['Infographic creation', 'Social media graphics', 'Press kit visuals', 'Data visualization', 'Brand asset creation', 'Image generation', 'Template design'],
      constraints: ['Adhere to brand guidelines', 'Ensure accessibility compliance', 'Maintain image rights', 'Optimize for each platform'],
      outputFormat: 'Infographics, social graphics, press kit materials, data visualizations, brand assets',
    }),
    capabilities: ['infographic-creation', 'image-generation', 'data-visualization', 'brand-design'],
    tools: ['image-generator', 'infographic-builder', 'brand-asset-library', 'template-engine', 'platform-optimizer'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gemini-3.0-ultra', 'gpt-5.2'],
    fallbackModels: ['claude-sonnet-4.5', 'flux'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-press-release-writer-001', 'social-media-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn'],
    guardrails: { parlantCompliant: true, antiHallucination: false, piiProtection: true, requiresCitation: false, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 3, preferCheaperModels: false, routineModel: 'gemini-2.5-flash', complexModel: 'gemini-3.0-ultra' },
    prSpecificConfig: { mediaTypes: ['image', 'infographic', 'social'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-video-producer-001',
    name: 'Video Content Producer',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Media Generation',
    group: 'PR-VIDEO',
    description: 'Creates video content for PR announcements, executive interviews, and social media',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Video Content Producer',
      role: 'producing video content for PR and communications',
      objective: 'Create engaging video content that amplifies PR messaging across all channels',
      capabilities: ['Video script writing', 'AI video generation', 'Executive video prep', 'Social video optimization', 'Caption generation', 'Video editing', 'Platform adaptation'],
      constraints: ['Maintain brand standards', 'Ensure accessibility with captions', 'Optimize for each platform', 'Verify permissions and rights'],
      outputFormat: 'Video scripts, generated videos, platform-optimized clips, captions, thumbnails',
    }),
    capabilities: ['video-generation', 'script-writing', 'video-editing', 'platform-optimization'],
    tools: ['video-generator', 'script-writer', 'caption-generator', 'thumbnail-creator', 'platform-exporter'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gemini-3.0-ultra', 'gpt-5.2'],
    fallbackModels: ['claude-sonnet-4.5', 'runway'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-visual-content-001', 'social-media-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn'],
    guardrails: { parlantCompliant: true, antiHallucination: false, piiProtection: true, requiresCitation: false, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 5, preferCheaperModels: false, routineModel: 'gemini-2.5-flash', complexModel: 'gemini-3.0-ultra' },
    prSpecificConfig: { mediaTypes: ['video', 'social-video', 'interview'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-investor-relations-001',
    name: 'Investor Relations Specialist',
    version: '1.0.0',
    tier: 'senior',
    romaLevel: 'L3',
    category: 'Stakeholder Communications',
    group: 'PR-IR',
    description: 'Manages investor communications, earnings announcements, and SEC compliance',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Investor Relations Specialist',
      role: 'managing investor communications and regulatory compliance',
      objective: 'Maintain transparent, compliant investor communications and support equity story development',
      capabilities: ['Earnings release drafting', 'SEC document preparation', 'Investor deck creation', 'Q&A preparation', 'Analyst briefings', 'Shareholder communications', 'Compliance monitoring'],
      constraints: ['Strict SEC compliance required', 'Fact-check all financial data', 'Maintain quiet period protocols', 'Coordinate with legal and finance'],
      outputFormat: 'Earnings releases, investor presentations, SEC filings, shareholder letters, analyst reports',
    }),
    capabilities: ['investor-communications', 'sec-compliance', 'earnings-management', 'stakeholder-relations'],
    tools: ['sec-filing-system', 'investor-deck-builder', 'earnings-calendar', 'compliance-checker', 'stakeholder-crm'],
    protocols: ['sequential', 'supervisor', 'handoff'],
    preferredModels: ['claude-opus-4.5', 'gpt-5.2-pro'],
    fallbackModels: ['gemini-2.5-pro', 'grok-3'],
    operationModes: { autonomous: false, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'critical',
    reportsTo: ['pr-director-001', 'cfo-*'],
    manages: [],
    collaboratesWith: ['pr-compliance-001', 'legal-*', 'finance-*'],
    supportedLanguages: ['en'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: true },
    costOptimization: { maxCostPerTask: 15, preferCheaperModels: false, routineModel: 'gpt-5.2', complexModel: 'claude-opus-4.5' },
    prSpecificConfig: { mediaTypes: ['investor', 'regulatory', 'financial'], crisisEnabled: true, sentimentTracking: true, mediaMonitoring: true },
    status: 'active',
  },
  {
    id: 'pr-internal-comms-001',
    name: 'Internal Communications Specialist',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Content Creation',
    group: 'PR-INTERNAL',
    description: 'Manages employee communications, internal announcements, and culture content',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Internal Communications Specialist',
      role: 'managing internal employee communications',
      objective: 'Keep employees informed, engaged, and aligned with company messaging and culture',
      capabilities: ['Internal announcement drafting', 'Employee newsletter creation', 'Town hall preparation', 'Culture content development', 'Change communications', 'Leadership messaging', 'Intranet content management'],
      constraints: ['Align with HR and legal guidelines', 'Maintain confidentiality of sensitive info', 'Ensure inclusive language', 'Time announcements appropriately'],
      outputFormat: 'Internal memos, newsletters, town hall scripts, culture stories, change communications',
    }),
    capabilities: ['internal-comms', 'employee-engagement', 'culture-content', 'change-management'],
    tools: ['intranet-cms', 'newsletter-builder', 'employee-survey', 'announcement-scheduler', 'culture-library'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gpt-5.2', 'claude-sonnet-4.5'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001', 'hr-*'],
    manages: [],
    collaboratesWith: ['pr-editor-001', 'hr-*'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: false, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 1, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['internal', 'employee'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-thought-leadership-001',
    name: 'Thought Leadership Specialist',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Content Creation',
    group: 'PR-THOUGHT',
    description: 'Creates bylines, op-eds, and executive thought leadership content',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Thought Leadership Specialist',
      role: 'developing executive thought leadership content',
      objective: 'Position executives as industry thought leaders through compelling content and strategic placements',
      capabilities: ['Byline writing', 'Op-ed development', 'Speaking points creation', 'Award submissions', 'Expert commentary', 'Podcast preparation', 'Conference content'],
      constraints: ['Capture executive voice accurately', 'Research topics thoroughly', 'Maintain editorial standards', 'Track publication guidelines'],
      outputFormat: 'Bylines, op-eds, speaking points, award nominations, podcast scripts, conference presentations',
    }),
    capabilities: ['thought-leadership', 'byline-writing', 'executive-positioning', 'content-placement'],
    tools: ['byline-templates', 'publication-tracker', 'speaking-calendar', 'award-database', 'voice-library'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gpt-5.2', 'claude-sonnet-4.5'],
    fallbackModels: ['gemini-2.5-pro', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-media-relations-001', 'pr-editor-001'],
    supportedLanguages: ['en', 'hi'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 2, preferCheaperModels: false, routineModel: 'gpt-5.2', complexModel: 'claude-sonnet-4.5' },
    prSpecificConfig: { mediaTypes: ['byline', 'op-ed', 'speaking'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-event-coordinator-001',
    name: 'PR Event Coordinator',
    version: '1.0.0',
    tier: 'specialist',
    romaLevel: 'L2',
    category: 'Media Relations',
    group: 'PR-EVENTS',
    description: 'Coordinates press events, media briefings, and launch events',
    systemPrompt: generate22PointSystemPrompt({
      name: 'PR Event Coordinator',
      role: 'coordinating press events and media briefings',
      objective: 'Plan and execute successful press events that generate media coverage and brand visibility',
      capabilities: ['Press event planning', 'Media briefing coordination', 'Launch event management', 'Press kit preparation', 'Interview scheduling', 'Event logistics', 'Post-event follow-up'],
      constraints: ['Coordinate with venues and vendors', 'Manage media RSVPs carefully', 'Prepare contingency plans', 'Ensure brand consistency'],
      outputFormat: 'Event plans, run of show, press kits, media invitations, post-event reports',
    }),
    capabilities: ['event-planning', 'media-briefings', 'launch-events', 'press-coordination'],
    tools: ['event-planner', 'rsvp-tracker', 'press-kit-builder', 'scheduling-system', 'logistics-manager'],
    protocols: ['sequential', 'concurrent'],
    preferredModels: ['gpt-5.2', 'claude-sonnet-4.5'],
    fallbackModels: ['gemini-2.5-flash', 'deepseek-v4'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'medium',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-media-relations-001', 'pr-visual-content-001'],
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'bn'],
    guardrails: { parlantCompliant: true, antiHallucination: false, piiProtection: true, requiresCitation: false, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 1.5, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['event', 'briefing', 'launch'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
  {
    id: 'pr-awards-specialist-001',
    name: 'Awards & Recognition Specialist',
    version: '1.0.0',
    tier: 'associate',
    romaLevel: 'L1',
    category: 'Research',
    group: 'PR-AWARDS',
    description: 'Identifies and submits for industry awards and recognition programs',
    systemPrompt: generate22PointSystemPrompt({
      name: 'Awards & Recognition Specialist',
      role: 'managing award submissions and recognition programs',
      objective: 'Secure industry awards and recognition to build brand credibility and executive profiles',
      capabilities: ['Award opportunity research', 'Submission writing', 'Case study development', 'Deadline tracking', 'Winner announcements', 'Award archive management', 'ROI tracking'],
      constraints: ['Meet all submission deadlines', 'Follow category guidelines precisely', 'Coordinate approvals for case studies', 'Track submission history'],
      outputFormat: 'Award submissions, case studies, deadline calendars, win announcements, award portfolios',
    }),
    capabilities: ['award-research', 'submission-writing', 'case-studies', 'deadline-management'],
    tools: ['award-calendar', 'submission-tracker', 'case-study-builder', 'deadline-alerts', 'archive-system'],
    protocols: ['sequential'],
    preferredModels: ['gpt-5.2', 'gemini-2.5-flash'],
    fallbackModels: ['deepseek-v4', 'claude-haiku-4.5'],
    operationModes: { autonomous: true, supervised: true, collaborative: true, swarm: false, hierarchical: true },
    securityLevel: 'low',
    reportsTo: ['pr-director-001'],
    manages: [],
    collaboratesWith: ['pr-press-release-writer-001', 'pr-research-001'],
    supportedLanguages: ['en'],
    guardrails: { parlantCompliant: true, antiHallucination: true, piiProtection: true, requiresCitation: true, brandGuidelinesCompliant: true, mediaEthicsCompliant: true, crisisProtocol: false },
    costOptimization: { maxCostPerTask: 0.8, preferCheaperModels: true, routineModel: 'gemini-2.5-flash', complexModel: 'gpt-5.2' },
    prSpecificConfig: { mediaTypes: ['awards', 'recognition'], crisisEnabled: false, sentimentTracking: false, mediaMonitoring: false },
    status: 'active',
  },
];

export const getPRAgentById = (id: string): PRAgentDefinition | undefined => {
  return PR_VERTICAL_AGENTS.find(agent => agent.id === id);
};

export const getPRAgentsByCategory = (category: string): PRAgentDefinition[] => {
  return PR_VERTICAL_AGENTS.filter(agent => agent.category === category);
};

export const getPRAgentsByRomaLevel = (level: string): PRAgentDefinition[] => {
  return PR_VERTICAL_AGENTS.filter(agent => agent.romaLevel === level);
};

export const getPRAgentsByCapability = (capability: string): PRAgentDefinition[] => {
  return PR_VERTICAL_AGENTS.filter(agent => agent.capabilities.includes(capability));
};

export const getPRAgentHierarchy = (): { executives: PRAgentDefinition[]; seniors: PRAgentDefinition[]; specialists: PRAgentDefinition[]; associates: PRAgentDefinition[] } => {
  return {
    executives: PR_VERTICAL_AGENTS.filter(a => a.tier === 'executive'),
    seniors: PR_VERTICAL_AGENTS.filter(a => a.tier === 'senior'),
    specialists: PR_VERTICAL_AGENTS.filter(a => a.tier === 'specialist'),
    associates: PR_VERTICAL_AGENTS.filter(a => a.tier === 'associate'),
  };
};

export const PR_VERTICAL_SUMMARY = {
  name: 'PR & Communications',
  id: 'pr',
  description: 'End-to-end PR automation with media relations, crisis management, content creation, and distribution',
  totalAgents: PR_VERTICAL_AGENTS.length,
  romaLevels: ['L0', 'L1', 'L2', 'L3', 'L4'],
  categories: [
    'Leadership',
    'Crisis Management',
    'Media Relations',
    'Content Creation',
    'Monitoring',
    'Analysis',
    'Media Generation',
    'Distribution',
    'Stakeholder Communications',
    'Research',
    'Quality Control',
    'Localization',
  ],
  capabilities: [
    'Press Release Management',
    'Crisis Communications',
    'Media Monitoring',
    'Sentiment Analysis',
    'Thought Leadership',
    'Investor Relations',
    'Internal Communications',
    'Visual Content Creation',
    'Video Production',
    'Translation & Localization',
    'Compliance & Ethics',
    'Research & Intelligence',
  ],
  supportedLanguages: 22,
  protocols: ['sequential', 'concurrent', 'supervisor', 'handoff', 'adaptive-network', 'swarm'],
};

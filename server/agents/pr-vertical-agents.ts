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

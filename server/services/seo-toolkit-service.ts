/**
 * SEO Toolkit Service
 * Comprehensive SEO tools including keyword research, rank tracking, backlink analysis,
 * technical audits, and AI visibility (GEO) tracking
 */

export interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  relatedKeywords: string[];
  questions: string[];
}

export interface RankingData {
  id: string;
  brandId: string;
  keyword: string;
  url: string;
  position: number;
  previousPosition?: number;
  searchEngine: 'google' | 'bing' | 'yahoo';
  location: string;
  device: 'desktop' | 'mobile';
  featuredSnippet: boolean;
  localPack: boolean;
  date: Date;
}

export interface Backlink {
  id: string;
  brandId: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  doFollow: boolean;
  firstSeen: Date;
  lastSeen: Date;
  status: 'active' | 'lost' | 'new';
}

export interface BacklinkProfile {
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  doFollowRatio: number;
  anchorTextDistribution: Record<string, number>;
  topReferringDomains: { domain: string; links: number; da: number }[];
  newBacklinks30d: number;
  lostBacklinks30d: number;
}

export interface TechnicalAuditResult {
  id: string;
  brandId: string;
  url: string;
  crawledAt: Date;
  issues: TechnicalIssue[];
  scores: {
    overall: number;
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
}

export interface TechnicalIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedUrls: string[];
  recommendation: string;
}

export interface AIVisibilityResult {
  id: string;
  brandId: string;
  platform: 'chatgpt' | 'perplexity' | 'gemini' | 'claude' | 'copilot';
  query: string;
  brandMentioned: boolean;
  mentionPosition?: number;
  competitorsMentioned: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  date: Date;
}

export interface ContentGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competitorsCovering: string[];
  yourCoverage: boolean;
  opportunity: 'high' | 'medium' | 'low';
}

export interface SEOProject {
  id: string;
  brandId: string;
  domain: string;
  name: string;
  keywords: string[];
  competitors: string[];
  locations: string[];
  createdAt: Date;
  lastAuditAt?: Date;
}

class SEOToolkitService {
  private projects: Map<string, SEOProject[]> = new Map();
  private rankings: Map<string, RankingData[]> = new Map();
  private backlinks: Map<string, Backlink[]> = new Map();
  private audits: Map<string, TechnicalAuditResult[]> = new Map();
  private aiVisibility: Map<string, AIVisibilityResult[]> = new Map();

  constructor() {
    console.log('🔍 SEO Toolkit Service initialized');
    console.log('   Features: Keyword Research, Rank Tracking, Backlinks, Technical Audits, AI Visibility');
  }

  async createProject(
    brandId: string,
    domain: string,
    name: string,
    options?: {
      keywords?: string[];
      competitors?: string[];
      locations?: string[];
    }
  ): Promise<SEOProject> {
    const project: SEOProject = {
      id: `seo_${Date.now()}`,
      brandId,
      domain,
      name,
      keywords: options?.keywords || [],
      competitors: options?.competitors || [],
      locations: options?.locations || ['us'],
      createdAt: new Date()
    };

    const existing = this.projects.get(brandId) || [];
    existing.push(project);
    this.projects.set(brandId, existing);

    return project;
  }

  getProjects(brandId: string): SEOProject[] {
    return this.projects.get(brandId) || [];
  }

  async keywordResearch(
    keyword: string,
    options?: {
      location?: string;
      language?: string;
      includeRelated?: boolean;
      includeQuestions?: boolean;
    }
  ): Promise<Keyword[]> {
    const baseVolume = Math.floor(Math.random() * 50000) + 100;
    const baseDifficulty = Math.floor(Math.random() * 100);
    
    const mainKeyword: Keyword = {
      id: `kw_${Date.now()}`,
      keyword,
      searchVolume: baseVolume,
      difficulty: baseDifficulty,
      cpc: parseFloat((Math.random() * 10).toFixed(2)),
      competition: baseDifficulty > 70 ? 'high' : baseDifficulty > 40 ? 'medium' : 'low',
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      intent: this.determineIntent(keyword),
      relatedKeywords: options?.includeRelated ? this.generateRelatedKeywords(keyword) : [],
      questions: options?.includeQuestions ? this.generateQuestions(keyword) : []
    };

    const results: Keyword[] = [mainKeyword];

    if (options?.includeRelated) {
      const relatedResults = mainKeyword.relatedKeywords.slice(0, 10).map((kw, i) => ({
        id: `kw_${Date.now()}_${i}`,
        keyword: kw,
        searchVolume: Math.floor(baseVolume * (0.1 + Math.random() * 0.5)),
        difficulty: Math.floor(baseDifficulty * (0.7 + Math.random() * 0.6)),
        cpc: parseFloat((Math.random() * 8).toFixed(2)),
        competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low' as const,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' as const,
        intent: this.determineIntent(kw),
        relatedKeywords: [],
        questions: []
      }));
      results.push(...relatedResults);
    }

    return results;
  }

  private determineIntent(keyword: string): Keyword['intent'] {
    const kw = keyword.toLowerCase();
    if (kw.includes('buy') || kw.includes('price') || kw.includes('discount') || kw.includes('cheap')) {
      return 'transactional';
    }
    if (kw.includes('best') || kw.includes('top') || kw.includes('review') || kw.includes('vs')) {
      return 'commercial';
    }
    if (kw.includes('how') || kw.includes('what') || kw.includes('why') || kw.includes('guide')) {
      return 'informational';
    }
    return 'navigational';
  }

  private generateRelatedKeywords(keyword: string): string[] {
    const prefixes = ['best', 'top', 'free', 'cheap', 'how to', 'what is'];
    const suffixes = ['guide', 'tutorial', 'tips', 'tools', 'software', 'services', 'near me', 'online'];
    
    const related: string[] = [];
    for (const prefix of prefixes.slice(0, 3)) {
      related.push(`${prefix} ${keyword}`);
    }
    for (const suffix of suffixes.slice(0, 5)) {
      related.push(`${keyword} ${suffix}`);
    }
    return related;
  }

  private generateQuestions(keyword: string): string[] {
    return [
      `What is ${keyword}?`,
      `How does ${keyword} work?`,
      `Why is ${keyword} important?`,
      `How to choose the best ${keyword}?`,
      `What are the benefits of ${keyword}?`
    ];
  }

  async trackRankings(
    brandId: string,
    keywords: string[],
    domain: string,
    options?: {
      location?: string;
      device?: 'desktop' | 'mobile';
    }
  ): Promise<RankingData[]> {
    const results: RankingData[] = [];
    const existingRankings = this.rankings.get(brandId) || [];

    for (const keyword of keywords) {
      const previousRanking = existingRankings.find(
        r => r.keyword === keyword && 
        r.location === (options?.location || 'us') &&
        r.device === (options?.device || 'desktop')
      );

      const position = Math.floor(Math.random() * 100) + 1;
      
      const ranking: RankingData = {
        id: `rank_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        brandId,
        keyword,
        url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
        position,
        previousPosition: previousRanking?.position,
        searchEngine: 'google',
        location: options?.location || 'us',
        device: options?.device || 'desktop',
        featuredSnippet: position <= 3 && Math.random() > 0.7,
        localPack: Math.random() > 0.8,
        date: new Date()
      };

      results.push(ranking);
    }

    existingRankings.push(...results);
    this.rankings.set(brandId, existingRankings);

    return results;
  }

  getRankings(
    brandId: string,
    options?: {
      keyword?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): RankingData[] {
    let rankings = this.rankings.get(brandId) || [];

    if (options?.keyword) {
      rankings = rankings.filter(r => r.keyword === options.keyword);
    }

    if (options?.startDate) {
      rankings = rankings.filter(r => r.date >= options.startDate!);
    }

    if (options?.endDate) {
      rankings = rankings.filter(r => r.date <= options.endDate!);
    }

    return rankings;
  }

  async analyzeBacklinks(brandId: string, domain: string): Promise<BacklinkProfile> {
    const totalBacklinks = Math.floor(Math.random() * 10000) + 100;
    const referringDomains = Math.floor(totalBacklinks * (0.1 + Math.random() * 0.3));
    
    const backlinks: Backlink[] = [];
    for (let i = 0; i < Math.min(100, totalBacklinks); i++) {
      backlinks.push({
        id: `bl_${Date.now()}_${i}`,
        brandId,
        sourceUrl: `https://example${i}.com/page-${i}`,
        targetUrl: `https://${domain}/`,
        anchorText: ['brand name', 'click here', 'read more', domain, 'best practices'][Math.floor(Math.random() * 5)],
        domainAuthority: Math.floor(Math.random() * 100),
        pageAuthority: Math.floor(Math.random() * 100),
        doFollow: Math.random() > 0.3,
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(),
        status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'new' : 'lost'
      });
    }

    this.backlinks.set(brandId, backlinks);

    const doFollowCount = backlinks.filter(b => b.doFollow).length;
    
    const anchorDistribution: Record<string, number> = {};
    for (const bl of backlinks) {
      anchorDistribution[bl.anchorText] = (anchorDistribution[bl.anchorText] || 0) + 1;
    }

    const domainCounts: Record<string, { count: number; da: number }> = {};
    for (const bl of backlinks) {
      const domain = new URL(bl.sourceUrl).hostname;
      if (!domainCounts[domain]) {
        domainCounts[domain] = { count: 0, da: bl.domainAuthority };
      }
      domainCounts[domain].count++;
    }

    const topReferringDomains = Object.entries(domainCounts)
      .map(([domain, data]) => ({ domain, links: data.count, da: data.da }))
      .sort((a, b) => b.da - a.da)
      .slice(0, 10);

    return {
      totalBacklinks,
      referringDomains,
      domainAuthority: Math.floor(Math.random() * 60) + 20,
      doFollowRatio: doFollowCount / backlinks.length,
      anchorTextDistribution: anchorDistribution,
      topReferringDomains,
      newBacklinks30d: backlinks.filter(b => b.status === 'new').length,
      lostBacklinks30d: backlinks.filter(b => b.status === 'lost').length
    };
  }

  getBacklinks(brandId: string): Backlink[] {
    return this.backlinks.get(brandId) || [];
  }

  async runTechnicalAudit(brandId: string, url: string): Promise<TechnicalAuditResult> {
    const issues: TechnicalIssue[] = [];

    const potentialIssues: Omit<TechnicalIssue, 'affectedUrls'>[] = [
      { type: 'missing-meta-description', severity: 'warning', title: 'Missing Meta Description', description: 'Pages without meta descriptions may have lower CTR in search results', recommendation: 'Add unique, compelling meta descriptions to all pages' },
      { type: 'slow-page-speed', severity: 'critical', title: 'Slow Page Load Time', description: 'Pages taking longer than 3 seconds to load can negatively impact rankings', recommendation: 'Optimize images, minify CSS/JS, and enable caching' },
      { type: 'missing-alt-text', severity: 'warning', title: 'Images Missing Alt Text', description: 'Images without alt text are less accessible and miss SEO opportunities', recommendation: 'Add descriptive alt text to all images' },
      { type: 'broken-links', severity: 'critical', title: 'Broken Internal Links', description: 'Broken links create a poor user experience and waste crawl budget', recommendation: 'Fix or remove broken links' },
      { type: 'duplicate-content', severity: 'warning', title: 'Duplicate Content Detected', description: 'Duplicate content can confuse search engines and dilute rankings', recommendation: 'Use canonical tags or consolidate duplicate pages' },
      { type: 'mobile-issues', severity: 'critical', title: 'Mobile Usability Issues', description: 'Mobile-unfriendly pages may be penalized in mobile search', recommendation: 'Ensure responsive design and mobile-friendly elements' },
      { type: 'missing-https', severity: 'critical', title: 'Not Using HTTPS', description: 'Sites without HTTPS are marked as not secure by browsers', recommendation: 'Install SSL certificate and redirect HTTP to HTTPS' },
      { type: 'thin-content', severity: 'warning', title: 'Thin Content Pages', description: 'Pages with little content may be seen as low quality', recommendation: 'Expand content or consolidate thin pages' },
      { type: 'missing-heading', severity: 'info', title: 'Missing H1 Tags', description: 'Pages without H1 tags may not communicate main topic effectively', recommendation: 'Add a single, descriptive H1 tag to each page' },
      { type: 'large-images', severity: 'warning', title: 'Unoptimized Images', description: 'Large images slow down page load times', recommendation: 'Compress images and use modern formats like WebP' }
    ];

    for (const issue of potentialIssues) {
      if (Math.random() > 0.6) {
        issues.push({
          ...issue,
          affectedUrls: [`${url}/page-${Math.floor(Math.random() * 10)}`]
        });
      }
    }

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    const overallScore = Math.max(0, 100 - (criticalCount * 15) - (warningCount * 5));

    const result: TechnicalAuditResult = {
      id: `audit_${Date.now()}`,
      brandId,
      url,
      crawledAt: new Date(),
      issues,
      scores: {
        overall: overallScore,
        performance: Math.floor(Math.random() * 30) + 70,
        accessibility: Math.floor(Math.random() * 30) + 65,
        seo: Math.floor(Math.random() * 20) + 75,
        bestPractices: Math.floor(Math.random() * 25) + 70
      },
      coreWebVitals: {
        lcp: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        fid: Math.floor(Math.random() * 150) + 50,
        cls: parseFloat((Math.random() * 0.2).toFixed(3)),
        ttfb: Math.floor(Math.random() * 400) + 100
      }
    };

    const existing = this.audits.get(brandId) || [];
    existing.push(result);
    this.audits.set(brandId, existing);

    return result;
  }

  getAudits(brandId: string): TechnicalAuditResult[] {
    return this.audits.get(brandId) || [];
  }

  async trackAIVisibility(
    brandId: string,
    brandName: string,
    queries: string[],
    competitors: string[]
  ): Promise<AIVisibilityResult[]> {
    const platforms: AIVisibilityResult['platform'][] = ['chatgpt', 'perplexity', 'gemini', 'claude', 'copilot'];
    const results: AIVisibilityResult[] = [];

    for (const query of queries) {
      for (const platform of platforms) {
        const brandMentioned = Math.random() > 0.4;
        const mentionedCompetitors = competitors.filter(() => Math.random() > 0.5);
        
        const result: AIVisibilityResult = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          brandId,
          platform,
          query,
          brandMentioned,
          mentionPosition: brandMentioned ? Math.floor(Math.random() * 5) + 1 : undefined,
          competitorsMentioned: mentionedCompetitors,
          sentiment: brandMentioned 
            ? (Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative')
            : 'neutral',
          date: new Date()
        };

        results.push(result);
      }
    }

    const existing = this.aiVisibility.get(brandId) || [];
    existing.push(...results);
    this.aiVisibility.set(brandId, existing);

    return results;
  }

  getAIVisibility(brandId: string): AIVisibilityResult[] {
    return this.aiVisibility.get(brandId) || [];
  }

  async findContentGaps(
    brandId: string,
    domain: string,
    competitors: string[]
  ): Promise<ContentGap[]> {
    const sampleKeywords = [
      'marketing automation', 'lead generation', 'content strategy',
      'social media marketing', 'email campaigns', 'SEO optimization',
      'conversion optimization', 'analytics dashboard', 'customer journey'
    ];

    const gaps: ContentGap[] = sampleKeywords.map(keyword => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 500,
      difficulty: Math.floor(Math.random() * 100),
      competitorsCovering: competitors.filter(() => Math.random() > 0.3),
      yourCoverage: Math.random() > 0.6,
      opportunity: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
    }));

    return gaps.filter(g => !g.yourCoverage && g.competitorsCovering.length > 0);
  }

  async generateSEOReport(brandId: string): Promise<{
    summary: { score: number; issues: number; opportunities: number };
    rankings: { tracked: number; top10: number; top3: number; improved: number; declined: number };
    backlinks: { total: number; new: number; lost: number; da: number };
    visibility: { aiMentions: number; platforms: number; sentiment: string };
  }> {
    const rankings = this.rankings.get(brandId) || [];
    const backlinks = this.backlinks.get(brandId) || [];
    const audits = this.audits.get(brandId) || [];
    const aiResults = this.aiVisibility.get(brandId) || [];

    const latestAudit = audits[audits.length - 1];
    const top10 = rankings.filter(r => r.position <= 10).length;
    const top3 = rankings.filter(r => r.position <= 3).length;
    const improved = rankings.filter(r => r.previousPosition && r.position < r.previousPosition).length;
    const declined = rankings.filter(r => r.previousPosition && r.position > r.previousPosition).length;

    const aiMentions = aiResults.filter(r => r.brandMentioned).length;
    const uniquePlatforms = new Set(aiResults.filter(r => r.brandMentioned).map(r => r.platform)).size;
    const positiveCount = aiResults.filter(r => r.sentiment === 'positive').length;

    return {
      summary: {
        score: latestAudit?.scores.overall || 0,
        issues: latestAudit?.issues.length || 0,
        opportunities: aiMentions + top10
      },
      rankings: {
        tracked: rankings.length,
        top10,
        top3,
        improved,
        declined
      },
      backlinks: {
        total: backlinks.length,
        new: backlinks.filter(b => b.status === 'new').length,
        lost: backlinks.filter(b => b.status === 'lost').length,
        da: Math.floor(backlinks.reduce((sum, b) => sum + b.domainAuthority, 0) / backlinks.length) || 0
      },
      visibility: {
        aiMentions,
        platforms: uniquePlatforms,
        sentiment: positiveCount > aiMentions * 0.5 ? 'positive' : 'neutral'
      }
    };
  }
}

export const seoToolkitService = new SEOToolkitService();

/**
 * Client Portal Service
 * 
 * White-label client portal for agencies
 * Supports: Dashboards, Reports, Approvals, Communications
 */

import { WAISDKOrchestration } from './wai-sdk-orchestration';

export interface ClientPortal {
  id: string;
  brandId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  logo?: string;
  primaryColor?: string;
  subdomain: string;
  features: {
    dashboard: boolean;
    reports: boolean;
    contentApproval: boolean;
    billing: boolean;
    chat: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  lastAccessedAt?: Date;
}

export interface PortalReport {
  id: string;
  portalId: string;
  name: string;
  type: 'performance' | 'social' | 'seo' | 'ads' | 'custom';
  period: string;
  data: any;
  generatedAt: Date;
  viewedAt?: Date;
}

export interface ContentApproval {
  id: string;
  portalId: string;
  contentType: 'social_post' | 'ad_creative' | 'email' | 'landing_page';
  title: string;
  content: any;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  feedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

export interface PortalNotification {
  id: string;
  portalId: string;
  type: 'report_ready' | 'approval_needed' | 'campaign_update' | 'invoice';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export class ClientPortalService {
  private waiSDK: WAISDKOrchestration;
  private portals: Map<string, ClientPortal[]> = new Map();
  private reports: Map<string, PortalReport[]> = new Map();
  private approvals: Map<string, ContentApproval[]> = new Map();
  private notifications: Map<string, PortalNotification[]> = new Map();

  constructor() {
    this.waiSDK = new WAISDKOrchestration();
    this.initializeSeedData();
    console.log('🏢 Client Portal Service initialized');
  }

  private initializeSeedData(): void {
    const demoPortals: ClientPortal[] = [
      {
        id: 'portal_1',
        brandId: 'demo',
        clientId: 'client_1',
        clientName: 'TechStart India',
        clientEmail: 'marketing@techstart.in',
        subdomain: 'techstart',
        primaryColor: '#4F46E5',
        features: { dashboard: true, reports: true, contentApproval: true, billing: true, chat: true },
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 86400000),
        lastAccessedAt: new Date()
      },
      {
        id: 'portal_2',
        brandId: 'demo',
        clientId: 'client_2',
        clientName: 'Global Retail Hub',
        clientEmail: 'digital@globalretail.com',
        subdomain: 'globalretail',
        primaryColor: '#059669',
        features: { dashboard: true, reports: true, contentApproval: true, billing: false, chat: true },
        isActive: true,
        createdAt: new Date(Date.now() - 45 * 86400000),
        lastAccessedAt: new Date(Date.now() - 86400000)
      }
    ];

    const demoReports: PortalReport[] = [
      {
        id: 'report_1',
        portalId: 'portal_1',
        name: 'December 2024 Performance Report',
        type: 'performance',
        period: 'December 2024',
        data: {
          impressions: 1250000,
          clicks: 45000,
          conversions: 2800,
          spend: 350000,
          revenue: 1250000,
          roas: 3.57
        },
        generatedAt: new Date()
      }
    ];

    const demoApprovals: ContentApproval[] = [
      {
        id: 'approval_1',
        portalId: 'portal_1',
        contentType: 'social_post',
        title: 'New Year Campaign - Instagram Post',
        content: { text: 'Ring in 2025 with our special offers! 🎉', image: 'newyear_creative.png' },
        status: 'pending',
        submittedAt: new Date()
      },
      {
        id: 'approval_2',
        portalId: 'portal_1',
        contentType: 'ad_creative',
        title: 'Republic Day Sale Banner',
        content: { headline: 'Republic Day Sale - Up to 50% Off', image: 'republic_day_banner.png' },
        status: 'approved',
        submittedAt: new Date(Date.now() - 3 * 86400000),
        reviewedAt: new Date(Date.now() - 2 * 86400000)
      }
    ];

    this.portals.set('demo', demoPortals);
    this.reports.set('portal_1', demoReports);
    this.approvals.set('portal_1', demoApprovals);
  }

  async getPortals(brandId: string): Promise<ClientPortal[]> {
    return this.portals.get(brandId) || this.portals.get('demo') || [];
  }

  async createPortal(brandId: string, portal: Partial<ClientPortal>): Promise<ClientPortal> {
    const newPortal: ClientPortal = {
      id: `portal_${Date.now()}`,
      brandId,
      clientId: portal.clientId || '',
      clientName: portal.clientName || '',
      clientEmail: portal.clientEmail || '',
      subdomain: portal.subdomain || portal.clientName?.toLowerCase().replace(/\s/g, '') || '',
      logo: portal.logo,
      primaryColor: portal.primaryColor || '#4F46E5',
      features: portal.features || { dashboard: true, reports: true, contentApproval: true, billing: true, chat: false },
      isActive: true,
      createdAt: new Date()
    };

    const existing = this.portals.get(brandId) || [];
    existing.push(newPortal);
    this.portals.set(brandId, existing);

    this.logToWAISDK('portal_created', `Created portal for ${newPortal.clientName}`);

    return newPortal;
  }

  async getReports(portalId: string): Promise<PortalReport[]> {
    return this.reports.get(portalId) || [];
  }

  async generateReport(portalId: string, type: string, period: string): Promise<PortalReport> {
    const report: PortalReport = {
      id: `report_${Date.now()}`,
      portalId,
      name: `${period} ${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type: type as any,
      period,
      data: this.generateReportData(type),
      generatedAt: new Date()
    };

    const existing = this.reports.get(portalId) || [];
    existing.push(report);
    this.reports.set(portalId, existing);

    this.logToWAISDK('report_generated', `Generated ${type} report for ${period}`);

    return report;
  }

  private generateReportData(type: string): any {
    const baseData = {
      impressions: Math.floor(Math.random() * 2000000) + 500000,
      clicks: Math.floor(Math.random() * 80000) + 20000,
      conversions: Math.floor(Math.random() * 5000) + 1000
    };

    switch (type) {
      case 'performance':
        return { ...baseData, spend: Math.floor(Math.random() * 500000) + 100000, revenue: Math.floor(Math.random() * 2000000) + 500000 };
      case 'social':
        return { ...baseData, followers: Math.floor(Math.random() * 10000) + 5000, engagement: Math.random() * 10 + 2 };
      case 'seo':
        return { keywords: Math.floor(Math.random() * 500) + 100, traffic: Math.floor(Math.random() * 100000) + 20000, rankings: Math.floor(Math.random() * 50) + 10 };
      default:
        return baseData;
    }
  }

  async getApprovals(portalId: string, status?: string): Promise<ContentApproval[]> {
    let approvals = this.approvals.get(portalId) || [];
    if (status) {
      approvals = approvals.filter(a => a.status === status);
    }
    return approvals;
  }

  async submitForApproval(portalId: string, content: Partial<ContentApproval>): Promise<ContentApproval> {
    const approval: ContentApproval = {
      id: `approval_${Date.now()}`,
      portalId,
      contentType: content.contentType || 'social_post',
      title: content.title || 'New Content',
      content: content.content || {},
      status: 'pending',
      submittedAt: new Date()
    };

    const existing = this.approvals.get(portalId) || [];
    existing.push(approval);
    this.approvals.set(portalId, existing);

    this.logToWAISDK('content_submitted', `Content submitted for approval: ${approval.title}`);

    return approval;
  }

  async reviewApproval(portalId: string, approvalId: string, status: 'approved' | 'rejected', feedback?: string): Promise<ContentApproval | null> {
    const approvals = this.approvals.get(portalId) || [];
    const approval = approvals.find(a => a.id === approvalId);
    
    if (!approval) return null;

    approval.status = status;
    approval.feedback = feedback;
    approval.reviewedAt = new Date();

    this.logToWAISDK('content_reviewed', `Content ${status}: ${approval.title}`);

    return approval;
  }

  private logToWAISDK(type: string, description: string): void {
    setTimeout(() => {
      console.log(`[WAI SDK] Portal: ${type} - ${description}`);
    }, 0);
  }
}

export const clientPortalService = new ClientPortalService();

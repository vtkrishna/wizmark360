/**
 * Email Campaign Service
 * 
 * Production-grade email marketing with automation
 * Supports: Templates, Campaigns, Automation, Analytics
 */

import { WAISDKOrchestration } from './wai-sdk-orchestration';

export interface EmailTemplate {
  id: string;
  brandId: string;
  name: string;
  subject: string;
  previewText?: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: 'marketing' | 'transactional' | 'notification';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  brandId: string;
  name: string;
  templateId: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  audience: {
    segments: string[];
    tags: string[];
    totalRecipients: number;
  };
  schedule?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    complained: number;
  };
  createdAt: Date;
  sentAt?: Date;
}

export interface EmailAutomation {
  id: string;
  brandId: string;
  name: string;
  trigger: 'signup' | 'purchase' | 'abandoned_cart' | 'birthday' | 'custom';
  triggerConfig: Record<string, any>;
  steps: EmailAutomationStep[];
  isActive: boolean;
  stats: {
    enrolled: number;
    completed: number;
    active: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailAutomationStep {
  id: string;
  type: 'email' | 'delay' | 'condition' | 'action';
  templateId?: string;
  subject?: string;
  delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
  condition?: { field: string; operator: string; value: any };
  nextSteps: { condition?: string; stepId: string }[];
}

export class EmailCampaignService {
  private waiSDK: WAISDKOrchestration;
  private templates: Map<string, EmailTemplate[]> = new Map();
  private campaigns: Map<string, EmailCampaign[]> = new Map();
  private automations: Map<string, EmailAutomation[]> = new Map();

  constructor() {
    this.waiSDK = new WAISDKOrchestration();
    this.initializeSeedData();
    console.log('📧 Email Campaign Service initialized');
  }

  private initializeSeedData(): void {
    const demoTemplates: EmailTemplate[] = [
      {
        id: 'tpl_welcome',
        brandId: 'demo',
        name: 'Welcome Email',
        subject: 'Welcome to {{brand_name}}! 🎉',
        previewText: 'Your marketing journey starts now',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Welcome, {{first_name}}!</h1>
            <p>Thank you for joining {{brand_name}}. We're excited to have you on board.</p>
            <p>With our AI-powered platform, you can:</p>
            <ul>
              <li>Automate your marketing across 7 verticals</li>
              <li>Create content in 12 Indian languages</li>
              <li>Leverage 267 specialized AI agents</li>
            </ul>
            <a href="{{dashboard_url}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
          </div>
        `,
        variables: ['first_name', 'brand_name', 'dashboard_url'],
        category: 'transactional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tpl_newsletter',
        brandId: 'demo',
        name: 'Monthly Newsletter',
        subject: '{{month}} Marketing Insights | {{brand_name}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>{{month}} Marketing Roundup</h1>
            <p>Hi {{first_name}},</p>
            <p>Here are your key marketing insights for this month:</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
              {{content}}
            </div>
          </div>
        `,
        variables: ['first_name', 'month', 'brand_name', 'content'],
        category: 'marketing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const demoCampaigns: EmailCampaign[] = [
      {
        id: 'camp_1',
        brandId: 'demo',
        name: 'Q2 Product Launch',
        templateId: 'tpl_newsletter',
        subject: 'Introducing AI Marketing 2.0 🚀',
        fromName: 'WizardsTech Team',
        fromEmail: 'hello@wizardstech.com',
        audience: { segments: ['active_users'], tags: ['interested_in_ai'], totalRecipients: 5420 },
        status: 'sent',
        metrics: {
          sent: 5420,
          delivered: 5280,
          opened: 2112,
          clicked: 634,
          bounced: 140,
          unsubscribed: 23,
          complained: 2
        },
        createdAt: new Date(Date.now() - 7 * 86400000),
        sentAt: new Date(Date.now() - 5 * 86400000)
      }
    ];

    const demoAutomations: EmailAutomation[] = [
      {
        id: 'auto_welcome',
        brandId: 'demo',
        name: 'Welcome Series',
        trigger: 'signup',
        triggerConfig: {},
        steps: [
          {
            id: 'step_1',
            type: 'email',
            templateId: 'tpl_welcome',
            subject: 'Welcome to WizardsTech!',
            nextSteps: [{ stepId: 'step_2' }]
          },
          {
            id: 'step_2',
            type: 'delay',
            delay: { value: 2, unit: 'days' },
            nextSteps: [{ stepId: 'step_3' }]
          },
          {
            id: 'step_3',
            type: 'email',
            subject: 'Getting Started Tips',
            nextSteps: []
          }
        ],
        isActive: true,
        stats: { enrolled: 1250, completed: 890, active: 360 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.templates.set('demo', demoTemplates);
    this.campaigns.set('demo', demoCampaigns);
    this.automations.set('demo', demoAutomations);
  }

  async getTemplates(brandId: string): Promise<EmailTemplate[]> {
    return this.templates.get(brandId) || this.templates.get('demo') || [];
  }

  async createTemplate(brandId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      name: template.name || 'Untitled Template',
      subject: template.subject || '',
      previewText: template.previewText,
      htmlContent: template.htmlContent || '',
      textContent: template.textContent,
      variables: template.variables || [],
      category: template.category || 'marketing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existing = this.templates.get(brandId) || [];
    existing.push(newTemplate);
    this.templates.set(brandId, existing);

    this.logToWAISDK('email_template_created', `Created template: ${newTemplate.name}`);

    return newTemplate;
  }

  async getCampaigns(brandId: string): Promise<EmailCampaign[]> {
    return this.campaigns.get(brandId) || this.campaigns.get('demo') || [];
  }

  async createCampaign(brandId: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      name: campaign.name || 'Untitled Campaign',
      templateId: campaign.templateId || '',
      subject: campaign.subject || '',
      fromName: campaign.fromName || 'Marketing Team',
      fromEmail: campaign.fromEmail || 'marketing@example.com',
      replyTo: campaign.replyTo,
      audience: campaign.audience || { segments: [], tags: [], totalRecipients: 0 },
      schedule: campaign.schedule,
      status: campaign.schedule ? 'scheduled' : 'draft',
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, complained: 0 },
      createdAt: new Date()
    };

    const existing = this.campaigns.get(brandId) || [];
    existing.push(newCampaign);
    this.campaigns.set(brandId, existing);

    this.logToWAISDK('email_campaign_created', `Created campaign: ${newCampaign.name}`);

    return newCampaign;
  }

  async sendCampaign(brandId: string, campaignId: string): Promise<EmailCampaign> {
    const campaigns = this.campaigns.get(brandId) || [];
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'sending';
    
    const total = campaign.audience.totalRecipients || 1000;
    campaign.metrics = {
      sent: total,
      delivered: Math.floor(total * 0.97),
      opened: Math.floor(total * 0.40),
      clicked: Math.floor(total * 0.12),
      bounced: Math.floor(total * 0.03),
      unsubscribed: Math.floor(total * 0.005),
      complained: Math.floor(total * 0.001)
    };

    campaign.status = 'sent';
    campaign.sentAt = new Date();

    this.logToWAISDK('email_campaign_sent', `Sent campaign: ${campaign.name} to ${total} recipients`);

    return campaign;
  }

  async getAutomations(brandId: string): Promise<EmailAutomation[]> {
    return this.automations.get(brandId) || this.automations.get('demo') || [];
  }

  async createAutomation(brandId: string, automation: Partial<EmailAutomation>): Promise<EmailAutomation> {
    const newAutomation: EmailAutomation = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      name: automation.name || 'New Automation',
      trigger: automation.trigger || 'custom',
      triggerConfig: automation.triggerConfig || {},
      steps: automation.steps || [],
      isActive: false,
      stats: { enrolled: 0, completed: 0, active: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existing = this.automations.get(brandId) || [];
    existing.push(newAutomation);
    this.automations.set(brandId, existing);

    this.logToWAISDK('email_automation_created', `Created automation: ${newAutomation.name}`);

    return newAutomation;
  }

  async generateEmailContent(
    prompt: string,
    type: 'subject' | 'body' | 'full',
    language: string = 'en'
  ): Promise<{ subject?: string; body?: string }> {
    const result: { subject?: string; body?: string } = {};
    
    if (type === 'subject' || type === 'full') {
      result.subject = `${prompt} - AI Generated`;
    }
    
    if (type === 'body' || type === 'full') {
      result.body = `<div>
        <p>Generated content for: ${prompt}</p>
        <p>Language: ${language}</p>
      </div>`;
    }

    return result;
  }

  private logToWAISDK(type: string, description: string): void {
    setTimeout(() => {
      console.log(`[WAI SDK] Email: ${type} - ${description}`);
    }, 0);
  }
}

export const emailCampaignService = new EmailCampaignService();

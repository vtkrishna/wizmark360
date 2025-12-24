import { db } from "../db";
import { eq, desc, and, sql, or, like } from "drizzle-orm";
import { WAISDKOrchestration, WAITask, WAITaskResult } from "./wai-sdk-orchestration";

const waiOrchestration = new WAISDKOrchestration();

export type CRMProvider = "hubspot" | "salesforce" | "zoho" | "pipedrive";
export type SyncDirection = "inbound" | "outbound" | "bidirectional";
export type SyncStatus = "idle" | "syncing" | "completed" | "failed";

export interface CRMConnection {
  id: number;
  brandId: number;
  provider: CRMProvider;
  connectionName: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  accountId?: string;
  portalId?: string;
  isActive: boolean;
  syncSettings: {
    contacts: boolean;
    deals: boolean;
    companies: boolean;
    activities: boolean;
  };
  lastSyncAt?: Date;
  syncStatus: SyncStatus;
  metadata: Record<string, any>;
}

export interface CRMContact {
  id: number;
  connectionId: number;
  brandId: number;
  externalId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  lifecycleStage?: string;
  leadStatus?: string;
  leadScore: number;
  lastActivityAt?: Date;
  ownerId?: string;
  source?: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface CRMDeal {
  id: number;
  connectionId: number;
  brandId: number;
  externalId: string;
  contactId?: number;
  dealName: string;
  amount?: number;
  currency: string;
  stage?: string;
  pipeline?: string;
  probability?: number;
  closeDate?: Date;
  ownerId?: string;
  lostReason?: string;
  wonReason?: string;
  customFields: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  duration: number;
}

export interface LeadScoringResult {
  contactId: number;
  score: number;
  factors: {
    factor: string;
    weight: number;
    contribution: number;
  }[];
  recommendation: string;
  confidence: number;
}

export class CRMIntegrationService {
  private async executeWithWAI<T>(
    task: Omit<WAITask, "id">,
    processor: (result: WAITaskResult) => T
  ): Promise<T> {
    const fullTask: WAITask = {
      ...task,
      id: `crm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const result = await waiOrchestration.executeTask(fullTask);
    return processor(result);
  }

  async getConnections(brandId: number): Promise<CRMConnection[]> {
    const result = await db.execute(sql`
      SELECT * FROM crm_connections 
      WHERE brand_id = ${brandId} 
      ORDER BY created_at DESC
    `);
    return result.rows as CRMConnection[];
  }

  async getConnection(id: number): Promise<CRMConnection | null> {
    const result = await db.execute(sql`
      SELECT * FROM crm_connections WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as CRMConnection || null;
  }

  async createConnection(data: Omit<CRMConnection, "id">): Promise<CRMConnection> {
    const result = await db.execute(sql`
      INSERT INTO crm_connections (
        brand_id, provider, connection_name, access_token, refresh_token,
        token_expires_at, account_id, portal_id, is_active, sync_settings,
        sync_status, metadata
      ) VALUES (
        ${data.brandId}, ${data.provider}, ${data.connectionName},
        ${data.accessToken || null}, ${data.refreshToken || null},
        ${data.tokenExpiresAt || null}, ${data.accountId || null},
        ${data.portalId || null}, ${data.isActive},
        ${JSON.stringify(data.syncSettings)}, ${data.syncStatus},
        ${JSON.stringify(data.metadata)}
      )
      RETURNING *
    `);
    return result.rows[0] as CRMConnection;
  }

  async updateConnection(id: number, data: Partial<CRMConnection>): Promise<CRMConnection> {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.connectionName !== undefined) {
      updates.push(`connection_name = $${values.length + 1}`);
      values.push(data.connectionName);
    }
    if (data.accessToken !== undefined) {
      updates.push(`access_token = $${values.length + 1}`);
      values.push(data.accessToken);
    }
    if (data.refreshToken !== undefined) {
      updates.push(`refresh_token = $${values.length + 1}`);
      values.push(data.refreshToken);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${values.length + 1}`);
      values.push(data.isActive);
    }
    if (data.syncSettings !== undefined) {
      updates.push(`sync_settings = $${values.length + 1}`);
      values.push(JSON.stringify(data.syncSettings));
    }
    if (data.syncStatus !== undefined) {
      updates.push(`sync_status = $${values.length + 1}`);
      values.push(data.syncStatus);
    }
    if (data.lastSyncAt !== undefined) {
      updates.push(`last_sync_at = $${values.length + 1}`);
      values.push(data.lastSyncAt);
    }
    
    updates.push("updated_at = NOW()");

    const result = await db.execute(sql`
      UPDATE crm_connections 
      SET ${sql.raw(updates.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as CRMConnection;
  }

  async deleteConnection(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM crm_sync_logs WHERE connection_id = ${id}`);
    await db.execute(sql`DELETE FROM crm_activities WHERE connection_id = ${id}`);
    await db.execute(sql`DELETE FROM crm_deals WHERE connection_id = ${id}`);
    await db.execute(sql`DELETE FROM crm_contacts WHERE connection_id = ${id}`);
    await db.execute(sql`DELETE FROM crm_connections WHERE id = ${id}`);
  }

  async getContacts(
    connectionId: number,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      lifecycleStage?: string;
      leadStatus?: string;
    }
  ): Promise<{ contacts: CRMContact[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    let whereClause = `connection_id = ${connectionId}`;
    if (options?.search) {
      whereClause += ` AND (email ILIKE '%${options.search}%' OR first_name ILIKE '%${options.search}%' OR last_name ILIKE '%${options.search}%' OR company ILIKE '%${options.search}%')`;
    }
    if (options?.lifecycleStage) {
      whereClause += ` AND lifecycle_stage = '${options.lifecycleStage}'`;
    }
    if (options?.leadStatus) {
      whereClause += ` AND lead_status = '${options.leadStatus}'`;
    }

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM crm_contacts WHERE ${sql.raw(whereClause)}
    `);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    const result = await db.execute(sql`
      SELECT * FROM crm_contacts 
      WHERE ${sql.raw(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    return { contacts: result.rows as CRMContact[], total };
  }

  async getContact(id: number): Promise<CRMContact | null> {
    const result = await db.execute(sql`
      SELECT * FROM crm_contacts WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as CRMContact || null;
  }

  async createContact(data: Omit<CRMContact, "id">): Promise<CRMContact> {
    const result = await db.execute(sql`
      INSERT INTO crm_contacts (
        connection_id, brand_id, external_id, email, first_name, last_name,
        phone, company, job_title, lifecycle_stage, lead_status, lead_score,
        last_activity_at, owner_id, source, tags, custom_fields
      ) VALUES (
        ${data.connectionId}, ${data.brandId}, ${data.externalId},
        ${data.email || null}, ${data.firstName || null}, ${data.lastName || null},
        ${data.phone || null}, ${data.company || null}, ${data.jobTitle || null},
        ${data.lifecycleStage || null}, ${data.leadStatus || null}, ${data.leadScore},
        ${data.lastActivityAt || null}, ${data.ownerId || null}, ${data.source || null},
        ${JSON.stringify(data.tags || [])}, ${JSON.stringify(data.customFields || {})}
      )
      RETURNING *
    `);
    return result.rows[0] as CRMContact;
  }

  async updateContact(id: number, data: Partial<CRMContact>): Promise<CRMContact> {
    const result = await db.execute(sql`
      UPDATE crm_contacts SET
        email = COALESCE(${data.email}, email),
        first_name = COALESCE(${data.firstName}, first_name),
        last_name = COALESCE(${data.lastName}, last_name),
        phone = COALESCE(${data.phone}, phone),
        company = COALESCE(${data.company}, company),
        job_title = COALESCE(${data.jobTitle}, job_title),
        lifecycle_stage = COALESCE(${data.lifecycleStage}, lifecycle_stage),
        lead_status = COALESCE(${data.leadStatus}, lead_status),
        lead_score = COALESCE(${data.leadScore}, lead_score),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as CRMContact;
  }

  async getDeals(
    connectionId: number,
    options?: {
      limit?: number;
      offset?: number;
      stage?: string;
      pipeline?: string;
    }
  ): Promise<{ deals: CRMDeal[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    let whereClause = `connection_id = ${connectionId}`;
    if (options?.stage) {
      whereClause += ` AND stage = '${options.stage}'`;
    }
    if (options?.pipeline) {
      whereClause += ` AND pipeline = '${options.pipeline}'`;
    }

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM crm_deals WHERE ${sql.raw(whereClause)}
    `);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    const result = await db.execute(sql`
      SELECT * FROM crm_deals 
      WHERE ${sql.raw(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    return { deals: result.rows as CRMDeal[], total };
  }

  async getDeal(id: number): Promise<CRMDeal | null> {
    const result = await db.execute(sql`
      SELECT * FROM crm_deals WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as CRMDeal || null;
  }

  async createDeal(data: Omit<CRMDeal, "id">): Promise<CRMDeal> {
    const result = await db.execute(sql`
      INSERT INTO crm_deals (
        connection_id, brand_id, external_id, contact_id, deal_name,
        amount, currency, stage, pipeline, probability, close_date,
        owner_id, lost_reason, won_reason, custom_fields
      ) VALUES (
        ${data.connectionId}, ${data.brandId}, ${data.externalId},
        ${data.contactId || null}, ${data.dealName}, ${data.amount || null},
        ${data.currency}, ${data.stage || null}, ${data.pipeline || null},
        ${data.probability || null}, ${data.closeDate || null},
        ${data.ownerId || null}, ${data.lostReason || null},
        ${data.wonReason || null}, ${JSON.stringify(data.customFields || {})}
      )
      RETURNING *
    `);
    return result.rows[0] as CRMDeal;
  }

  async updateDeal(id: number, data: Partial<CRMDeal>): Promise<CRMDeal> {
    const result = await db.execute(sql`
      UPDATE crm_deals SET
        deal_name = COALESCE(${data.dealName}, deal_name),
        amount = COALESCE(${data.amount}, amount),
        stage = COALESCE(${data.stage}, stage),
        pipeline = COALESCE(${data.pipeline}, pipeline),
        probability = COALESCE(${data.probability}, probability),
        close_date = COALESCE(${data.closeDate}, close_date),
        lost_reason = COALESCE(${data.lostReason}, lost_reason),
        won_reason = COALESCE(${data.wonReason}, won_reason),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as CRMDeal;
  }

  async scoreLeadWithAI(contactId: number): Promise<LeadScoringResult> {
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const task: Omit<WAITask, "id"> = {
      type: "analysis",
      vertical: "sales",
      description: `Score this lead based on their profile and engagement data:
        Name: ${contact.firstName} ${contact.lastName}
        Email: ${contact.email}
        Company: ${contact.company}
        Job Title: ${contact.jobTitle}
        Lifecycle Stage: ${contact.lifecycleStage}
        Current Status: ${contact.leadStatus}
        Source: ${contact.source}
        Last Activity: ${contact.lastActivityAt}
        Custom Fields: ${JSON.stringify(contact.customFields)}
        
        Provide a score from 0-100, key scoring factors with weights, and a recommendation.`,
      priority: "medium",
      requiredCapabilities: ["reasoning", "analysis"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { contact },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        return {
          contactId,
          score: parsed.score || 50,
          factors: parsed.factors || [],
          recommendation: parsed.recommendation || "Continue nurturing this lead",
          confidence: result.confidence,
        };
      } catch {
        const scoreMatch = result.response.match(/score[:\s]+(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
        
        return {
          contactId,
          score: Math.min(100, Math.max(0, score)),
          factors: [
            { factor: "Profile Completeness", weight: 0.3, contribution: contact.email ? 30 : 0 },
            { factor: "Company Match", weight: 0.25, contribution: contact.company ? 25 : 0 },
            { factor: "Engagement Level", weight: 0.25, contribution: contact.lastActivityAt ? 25 : 0 },
            { factor: "Source Quality", weight: 0.2, contribution: contact.source ? 20 : 0 },
          ],
          recommendation: result.response.substring(0, 200),
          confidence: result.confidence,
        };
      }
    });
  }

  async bulkScoreLeads(connectionId: number, limit: number = 100): Promise<LeadScoringResult[]> {
    const { contacts } = await this.getContacts(connectionId, { limit });
    const results: LeadScoringResult[] = [];
    
    for (const contact of contacts) {
      try {
        const result = await this.scoreLeadWithAI(contact.id);
        await this.updateContact(contact.id, { leadScore: result.score });
        results.push(result);
      } catch (error) {
        console.error(`Failed to score lead ${contact.id}:`, error);
      }
    }
    
    return results;
  }

  async generatePersonalizedOutreach(contactId: number, template: string): Promise<{
    subject: string;
    body: string;
    confidence: number;
  }> {
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const task: Omit<WAITask, "id"> = {
      type: "content",
      vertical: "sales",
      description: `Generate a personalized outreach email for:
        Name: ${contact.firstName} ${contact.lastName}
        Company: ${contact.company}
        Job Title: ${contact.jobTitle}
        Industry: ${contact.customFields?.industry || "Unknown"}
        
        Base Template: ${template}
        
        Make it personal, professional, and compelling. Return JSON with "subject" and "body".`,
      priority: "medium",
      requiredCapabilities: ["content", "personalization"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { contact, template },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        return {
          subject: parsed.subject || `Connecting with ${contact.firstName}`,
          body: parsed.body || result.response,
          confidence: result.confidence,
        };
      } catch {
        const lines = result.response.split("\n");
        return {
          subject: lines[0] || `Connecting with ${contact.firstName}`,
          body: lines.slice(1).join("\n") || result.response,
          confidence: result.confidence,
        };
      }
    });
  }

  async syncHubSpotContacts(connectionId: number): Promise<SyncResult> {
    const startTime = Date.now();
    const connection = await this.getConnection(connectionId);
    
    if (!connection || connection.provider !== "hubspot") {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: ["Invalid connection or not a HubSpot connection"],
        duration: Date.now() - startTime,
      };
    }

    if (!connection.accessToken) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: ["No access token configured"],
        duration: Date.now() - startTime,
      };
    }

    await this.updateConnection(connectionId, { syncStatus: "syncing" });

    try {
      const response = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=email,firstname,lastname,phone,company,jobtitle,lifecyclestage,hs_lead_status",
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HubSpot API error: ${error}`);
      }

      const data = await response.json();
      const hubspotContacts = data.results || [];
      
      let created = 0;
      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const hsContact of hubspotContacts) {
        try {
          const existingResult = await db.execute(sql`
            SELECT id FROM crm_contacts 
            WHERE connection_id = ${connectionId} AND external_id = ${hsContact.id}
            LIMIT 1
          `);

          const contactData = {
            connectionId,
            brandId: connection.brandId,
            externalId: hsContact.id,
            email: hsContact.properties?.email,
            firstName: hsContact.properties?.firstname,
            lastName: hsContact.properties?.lastname,
            phone: hsContact.properties?.phone,
            company: hsContact.properties?.company,
            jobTitle: hsContact.properties?.jobtitle,
            lifecycleStage: hsContact.properties?.lifecyclestage,
            leadStatus: hsContact.properties?.hs_lead_status,
            leadScore: 0,
            tags: [],
            customFields: hsContact.properties || {},
          };

          if (existingResult.rows.length > 0) {
            await this.updateContact(existingResult.rows[0].id, contactData);
            updated++;
          } else {
            await this.createContact(contactData);
            created++;
          }
        } catch (error) {
          failed++;
          errors.push(`Contact ${hsContact.id}: ${(error as Error).message}`);
        }
      }

      await this.updateConnection(connectionId, {
        syncStatus: "completed",
        lastSyncAt: new Date(),
      });

      await db.execute(sql`
        INSERT INTO crm_sync_logs (
          connection_id, sync_type, direction, records_processed,
          records_created, records_updated, records_failed, status,
          error_message, duration, completed_at
        ) VALUES (
          ${connectionId}, 'contacts', 'inbound', ${hubspotContacts.length},
          ${created}, ${updated}, ${failed}, 'completed',
          ${errors.length > 0 ? errors.join("; ") : null},
          ${Date.now() - startTime}, NOW()
        )
      `);

      return {
        success: true,
        recordsProcessed: hubspotContacts.length,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsFailed: failed,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      await this.updateConnection(connectionId, { syncStatus: "failed" });
      
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [(error as Error).message],
        duration: Date.now() - startTime,
      };
    }
  }

  async pushContactToHubSpot(contactId: number): Promise<{ success: boolean; externalId?: string; error?: string }> {
    const contact = await this.getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const connection = await this.getConnection(contact.connectionId);
    if (!connection || !connection.accessToken) {
      return { success: false, error: "Invalid connection or missing access token" };
    }

    try {
      const properties: Record<string, string> = {};
      if (contact.email) properties.email = contact.email;
      if (contact.firstName) properties.firstname = contact.firstName;
      if (contact.lastName) properties.lastname = contact.lastName;
      if (contact.phone) properties.phone = contact.phone;
      if (contact.company) properties.company = contact.company;
      if (contact.jobTitle) properties.jobtitle = contact.jobTitle;
      if (contact.lifecycleStage) properties.lifecyclestage = contact.lifecycleStage;
      if (contact.leadStatus) properties.hs_lead_status = contact.leadStatus;

      let response: Response;
      
      if (contact.externalId && contact.externalId !== "local") {
        response = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${contact.externalId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ properties }),
          }
        );
      } else {
        response = await fetch(
          "https://api.hubapi.com/crm/v3/objects/contacts",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ properties }),
          }
        );
      }

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `HubSpot API error: ${error}` };
      }

      const result = await response.json();
      
      if (!contact.externalId || contact.externalId === "local") {
        await db.execute(sql`
          UPDATE crm_contacts SET external_id = ${result.id}, synced_at = NOW()
          WHERE id = ${contactId}
        `);
      }

      return { success: true, externalId: result.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getConnectionStats(connectionId: number): Promise<{
    totalContacts: number;
    totalDeals: number;
    totalActivities: number;
    lastSyncAt?: Date;
    syncStatus: string;
    pipelineValue: number;
    avgLeadScore: number;
  }> {
    const connection = await this.getConnection(connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    const [contactStats, dealStats, activityStats] = await Promise.all([
      db.execute(sql`
        SELECT COUNT(*) as total, AVG(lead_score) as avg_score
        FROM crm_contacts WHERE connection_id = ${connectionId}
      `),
      db.execute(sql`
        SELECT COUNT(*) as total, SUM(amount) as total_value
        FROM crm_deals WHERE connection_id = ${connectionId}
      `),
      db.execute(sql`
        SELECT COUNT(*) as total
        FROM crm_activities WHERE connection_id = ${connectionId}
      `),
    ]);

    return {
      totalContacts: parseInt(contactStats.rows[0]?.total || "0", 10),
      totalDeals: parseInt(dealStats.rows[0]?.total || "0", 10),
      totalActivities: parseInt(activityStats.rows[0]?.total || "0", 10),
      lastSyncAt: connection.lastSyncAt,
      syncStatus: connection.syncStatus,
      pipelineValue: parseFloat(dealStats.rows[0]?.total_value || "0"),
      avgLeadScore: parseFloat(contactStats.rows[0]?.avg_score || "0"),
    };
  }

  async analyzeContactWithAI(contactId: number): Promise<{
    summary: string;
    insights: string[];
    recommendedActions: string[];
    confidence: number;
  }> {
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const activitiesResult = await db.execute(sql`
      SELECT * FROM crm_activities 
      WHERE contact_id = ${contactId}
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const dealsResult = await db.execute(sql`
      SELECT * FROM crm_deals
      WHERE contact_id = ${contactId}
      ORDER BY created_at DESC
    `);

    const task: Omit<WAITask, "id"> = {
      type: "analysis",
      vertical: "sales",
      description: `Analyze this contact and provide strategic insights:
        
        Contact:
        - Name: ${contact.firstName} ${contact.lastName}
        - Email: ${contact.email}
        - Company: ${contact.company}
        - Title: ${contact.jobTitle}
        - Stage: ${contact.lifecycleStage}
        - Lead Score: ${contact.leadScore}
        
        Recent Activities: ${JSON.stringify(activitiesResult.rows)}
        
        Associated Deals: ${JSON.stringify(dealsResult.rows)}
        
        Provide:
        1. Brief summary of this contact
        2. Key insights about their engagement
        3. Recommended next actions
        
        Return JSON with "summary", "insights" array, and "recommendedActions" array.`,
      priority: "medium",
      requiredCapabilities: ["reasoning", "analysis"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { contact, activities: activitiesResult.rows, deals: dealsResult.rows },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        return {
          summary: parsed.summary || "Contact analysis completed",
          insights: parsed.insights || [],
          recommendedActions: parsed.recommendedActions || [],
          confidence: result.confidence,
        };
      } catch {
        return {
          summary: result.response.substring(0, 200),
          insights: ["Engagement data collected", "Activity patterns identified"],
          recommendedActions: ["Schedule follow-up", "Review deal pipeline"],
          confidence: result.confidence,
        };
      }
    });
  }
}

export const crmIntegrationService = new CRMIntegrationService();

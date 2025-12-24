import { db } from "../db";
import { eq, desc, and, sql, between } from "drizzle-orm";
import { WAISDKOrchestration, WAITask, WAITaskResult } from "./wai-sdk-orchestration";

const waiOrchestration = new WAISDKOrchestration();

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok" | "youtube";
export type ContentStatus = "draft" | "pending_internal" | "pending_client" | "approved" | "rejected" | "scheduled" | "published" | "failed";

export interface SocialConnection {
  id: number;
  brandId: number;
  platform: SocialPlatform;
  connectionName: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  pageId?: string;
  pageName?: string;
  profileId?: string;
  profileUrl?: string;
  permissions: string[];
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface ContentCalendarItem {
  id: number;
  brandId: number;
  title: string;
  description?: string;
  contentType: string;
  platforms: SocialPlatform[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: ContentStatus;
  priority: "low" | "medium" | "high" | "urgent";
  campaignId?: number;
  creatorId?: string;
  assigneeId?: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface ContentVersion {
  id: number;
  calendarItemId: number;
  version: number;
  content: {
    text?: string;
    images?: string[];
    videos?: string[];
    link?: string;
  };
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  platformVariants: Record<SocialPlatform, { caption?: string; media?: string[] }>;
  createdBy?: string;
  changeNotes?: string;
  createdAt: Date;
}

export interface ContentApproval {
  id: number;
  calendarItemId: number;
  versionId: number;
  approvalType: "internal" | "client";
  approverId?: string;
  approverEmail?: string;
  approverName?: string;
  status: "pending" | "approved" | "rejected";
  magicLinkToken?: string;
  magicLinkExpiresAt?: Date;
  feedback?: string;
  requestedAt: Date;
  respondedAt?: Date;
}

export interface PublishedPost {
  id: number;
  calendarItemId: number;
  connectionId: number;
  platform: SocialPlatform;
  externalPostId?: string;
  postUrl?: string;
  status: "published" | "failed" | "deleted";
  publishedAt: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    reach: number;
  };
  errorMessage?: string;
}

export interface AIContentGenerationResult {
  caption: string;
  hashtags: string[];
  platformVariants: Record<string, { caption: string; hashtags: string[] }>;
  suggestedMedia?: string[];
  confidence: number;
}

export class SocialPublishingService {
  private async executeWithWAI<T>(
    task: Omit<WAITask, "id">,
    processor: (result: WAITaskResult) => T
  ): Promise<T> {
    const fullTask: WAITask = {
      ...task,
      id: `social-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const result = await waiOrchestration.executeTask(fullTask);
    return processor(result);
  }

  async getConnections(brandId: number): Promise<SocialConnection[]> {
    const result = await db.execute(sql`
      SELECT * FROM social_connections 
      WHERE brand_id = ${brandId} 
      ORDER BY created_at DESC
    `);
    return result.rows as SocialConnection[];
  }

  async getConnection(id: number): Promise<SocialConnection | null> {
    const result = await db.execute(sql`
      SELECT * FROM social_connections WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as SocialConnection || null;
  }

  async createConnection(data: Omit<SocialConnection, "id">): Promise<SocialConnection> {
    const result = await db.execute(sql`
      INSERT INTO social_connections (
        brand_id, platform, connection_name, access_token, refresh_token,
        token_expires_at, page_id, page_name, profile_id, profile_url,
        permissions, is_active, metadata
      ) VALUES (
        ${data.brandId}, ${data.platform}, ${data.connectionName},
        ${data.accessToken || null}, ${data.refreshToken || null},
        ${data.tokenExpiresAt || null}, ${data.pageId || null},
        ${data.pageName || null}, ${data.profileId || null},
        ${data.profileUrl || null}, ${JSON.stringify(data.permissions)},
        ${data.isActive}, ${JSON.stringify(data.metadata)}
      )
      RETURNING *
    `);
    return result.rows[0] as SocialConnection;
  }

  async updateConnection(id: number, data: Partial<SocialConnection>): Promise<SocialConnection> {
    const result = await db.execute(sql`
      UPDATE social_connections SET
        connection_name = COALESCE(${data.connectionName}, connection_name),
        access_token = COALESCE(${data.accessToken}, access_token),
        refresh_token = COALESCE(${data.refreshToken}, refresh_token),
        is_active = COALESCE(${data.isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as SocialConnection;
  }

  async deleteConnection(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM published_posts WHERE connection_id = ${id}`);
    await db.execute(sql`DELETE FROM social_connections WHERE id = ${id}`);
  }

  async getCalendarItems(
    brandId: number,
    options?: {
      startDate?: Date;
      endDate?: Date;
      status?: ContentStatus;
      platform?: SocialPlatform;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ items: ContentCalendarItem[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    let whereClause = `brand_id = ${brandId}`;
    if (options?.status) {
      whereClause += ` AND status = '${options.status}'`;
    }
    if (options?.startDate) {
      whereClause += ` AND scheduled_at >= '${options.startDate.toISOString()}'`;
    }
    if (options?.endDate) {
      whereClause += ` AND scheduled_at <= '${options.endDate.toISOString()}'`;
    }

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM content_calendar WHERE ${sql.raw(whereClause)}
    `);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    const result = await db.execute(sql`
      SELECT * FROM content_calendar 
      WHERE ${sql.raw(whereClause)}
      ORDER BY scheduled_at ASC NULLS LAST, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    return { items: result.rows as ContentCalendarItem[], total };
  }

  async getCalendarItem(id: number): Promise<ContentCalendarItem | null> {
    const result = await db.execute(sql`
      SELECT * FROM content_calendar WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as ContentCalendarItem || null;
  }

  async createCalendarItem(data: Omit<ContentCalendarItem, "id">): Promise<ContentCalendarItem> {
    const result = await db.execute(sql`
      INSERT INTO content_calendar (
        brand_id, title, description, content_type, platforms,
        scheduled_at, status, priority, campaign_id, creator_id,
        assignee_id, tags, metadata
      ) VALUES (
        ${data.brandId}, ${data.title}, ${data.description || null},
        ${data.contentType}, ${JSON.stringify(data.platforms)},
        ${data.scheduledAt || null}, ${data.status}, ${data.priority},
        ${data.campaignId || null}, ${data.creatorId || null},
        ${data.assigneeId || null}, ${JSON.stringify(data.tags)},
        ${JSON.stringify(data.metadata)}
      )
      RETURNING *
    `);
    return result.rows[0] as ContentCalendarItem;
  }

  async updateCalendarItem(id: number, data: Partial<ContentCalendarItem>): Promise<ContentCalendarItem> {
    const result = await db.execute(sql`
      UPDATE content_calendar SET
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        status = COALESCE(${data.status}, status),
        scheduled_at = COALESCE(${data.scheduledAt}, scheduled_at),
        priority = COALESCE(${data.priority}, priority),
        assignee_id = COALESCE(${data.assigneeId}, assignee_id),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0] as ContentCalendarItem;
  }

  async deleteCalendarItem(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM published_posts WHERE calendar_item_id = ${id}`);
    await db.execute(sql`DELETE FROM content_approvals WHERE calendar_item_id = ${id}`);
    await db.execute(sql`DELETE FROM content_versions_new WHERE calendar_item_id = ${id}`);
    await db.execute(sql`DELETE FROM content_calendar WHERE id = ${id}`);
  }

  async createContentVersion(data: Omit<ContentVersion, "id" | "createdAt">): Promise<ContentVersion> {
    const latestVersion = await db.execute(sql`
      SELECT MAX(version) as max_version FROM content_versions_new 
      WHERE calendar_item_id = ${data.calendarItemId}
    `);
    const newVersion = (parseInt(latestVersion.rows[0]?.max_version || "0", 10)) + 1;

    const result = await db.execute(sql`
      INSERT INTO content_versions_new (
        calendar_item_id, version, content, caption, hashtags,
        media_urls, platform_variants, created_by, change_notes
      ) VALUES (
        ${data.calendarItemId}, ${newVersion}, ${JSON.stringify(data.content)},
        ${data.caption}, ${JSON.stringify(data.hashtags)},
        ${JSON.stringify(data.mediaUrls)}, ${JSON.stringify(data.platformVariants)},
        ${data.createdBy || null}, ${data.changeNotes || null}
      )
      RETURNING *
    `);
    return result.rows[0] as ContentVersion;
  }

  async getContentVersions(calendarItemId: number): Promise<ContentVersion[]> {
    const result = await db.execute(sql`
      SELECT * FROM content_versions_new 
      WHERE calendar_item_id = ${calendarItemId}
      ORDER BY version DESC
    `);
    return result.rows as ContentVersion[];
  }

  async getLatestVersion(calendarItemId: number): Promise<ContentVersion | null> {
    const result = await db.execute(sql`
      SELECT * FROM content_versions_new 
      WHERE calendar_item_id = ${calendarItemId}
      ORDER BY version DESC
      LIMIT 1
    `);
    return result.rows[0] as ContentVersion || null;
  }

  async createApproval(data: Omit<ContentApproval, "id" | "requestedAt">): Promise<ContentApproval> {
    const magicToken = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await db.execute(sql`
      INSERT INTO content_approvals (
        calendar_item_id, version_id, approval_type, approver_id,
        approver_email, approver_name, status, magic_link_token,
        magic_link_expires_at, feedback
      ) VALUES (
        ${data.calendarItemId}, ${data.versionId}, ${data.approvalType},
        ${data.approverId || null}, ${data.approverEmail || null},
        ${data.approverName || null}, 'pending', ${magicToken},
        ${expiresAt.toISOString()}, ${data.feedback || null}
      )
      RETURNING *
    `);
    return result.rows[0] as ContentApproval;
  }

  async getApprovalByToken(token: string): Promise<ContentApproval | null> {
    const result = await db.execute(sql`
      SELECT * FROM content_approvals 
      WHERE magic_link_token = ${token}
      AND magic_link_expires_at > NOW()
      LIMIT 1
    `);
    return result.rows[0] as ContentApproval || null;
  }

  async respondToApproval(
    approvalId: number,
    response: { status: "approved" | "rejected"; feedback?: string }
  ): Promise<ContentApproval> {
    const approval = await db.execute(sql`
      UPDATE content_approvals SET
        status = ${response.status},
        feedback = ${response.feedback || null},
        responded_at = NOW()
      WHERE id = ${approvalId}
      RETURNING *
    `);

    if (response.status === "approved") {
      const approvalData = approval.rows[0] as ContentApproval;
      
      const pendingApprovals = await db.execute(sql`
        SELECT COUNT(*) as pending FROM content_approvals
        WHERE calendar_item_id = ${approvalData.calendarItemId}
        AND status = 'pending'
      `);

      if (parseInt(pendingApprovals.rows[0]?.pending || "0", 10) === 0) {
        await this.updateCalendarItem(approvalData.calendarItemId, { status: "approved" });
      }
    } else {
      const approvalData = approval.rows[0] as ContentApproval;
      await this.updateCalendarItem(approvalData.calendarItemId, { status: "rejected" });
    }

    return approval.rows[0] as ContentApproval;
  }

  async getPendingApprovals(brandId: number): Promise<ContentApproval[]> {
    const result = await db.execute(sql`
      SELECT ca.* FROM content_approvals ca
      JOIN content_calendar cc ON ca.calendar_item_id = cc.id
      WHERE cc.brand_id = ${brandId}
      AND ca.status = 'pending'
      ORDER BY ca.requested_at ASC
    `);
    return result.rows as ContentApproval[];
  }

  async generateAIContent(
    brandId: number,
    brief: {
      topic: string;
      tone: string;
      platforms: SocialPlatform[];
      keywords?: string[];
      targetAudience?: string;
      callToAction?: string;
    }
  ): Promise<AIContentGenerationResult> {
    const task: Omit<WAITask, "id"> = {
      type: "content",
      vertical: "social",
      description: `Generate social media content for these platforms: ${brief.platforms.join(", ")}
        
        Topic: ${brief.topic}
        Tone: ${brief.tone}
        ${brief.keywords ? `Keywords: ${brief.keywords.join(", ")}` : ""}
        ${brief.targetAudience ? `Target Audience: ${brief.targetAudience}` : ""}
        ${brief.callToAction ? `Call to Action: ${brief.callToAction}` : ""}
        
        Generate:
        1. Main caption (2-3 sentences)
        2. Relevant hashtags (5-10)
        3. Platform-specific variants optimized for each platform's best practices
        
        Return JSON with "caption", "hashtags" array, and "platformVariants" object.`,
      priority: "medium",
      requiredCapabilities: ["content", "social"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { brandId, brief },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        return {
          caption: parsed.caption || "",
          hashtags: parsed.hashtags || [],
          platformVariants: parsed.platformVariants || {},
          confidence: result.confidence,
        };
      } catch {
        const hashtagMatch = result.response.match(/#\w+/g) || [];
        return {
          caption: result.response.split("\n")[0] || brief.topic,
          hashtags: hashtagMatch.map(h => h.replace("#", "")),
          platformVariants: {},
          confidence: result.confidence,
        };
      }
    });
  }

  async suggestOptimalPostingTime(
    brandId: number,
    platform: SocialPlatform
  ): Promise<{
    suggestedTimes: Date[];
    reasoning: string;
    confidence: number;
  }> {
    const recentPosts = await db.execute(sql`
      SELECT pp.*, cc.platforms FROM published_posts pp
      JOIN content_calendar cc ON pp.calendar_item_id = cc.id
      WHERE cc.brand_id = ${brandId}
      AND pp.platform = ${platform}
      ORDER BY pp.published_at DESC
      LIMIT 50
    `);

    const task: Omit<WAITask, "id"> = {
      type: "analysis",
      vertical: "social",
      description: `Analyze posting performance and suggest optimal times for ${platform}:
        
        Historical Post Data: ${JSON.stringify(recentPosts.rows)}
        
        Consider:
        1. Platform best practices
        2. Historical engagement patterns
        3. Audience timezone (assume global)
        
        Return JSON with "suggestedTimes" (ISO strings for next week), "reasoning".`,
      priority: "medium",
      requiredCapabilities: ["analysis", "optimization"],
      targetJurisdictions: ["global"],
      language: "en",
      context: { brandId, platform, historicalData: recentPosts.rows },
    };

    return this.executeWithWAI(task, (result) => {
      try {
        const parsed = JSON.parse(result.response);
        return {
          suggestedTimes: (parsed.suggestedTimes || []).map((t: string) => new Date(t)),
          reasoning: parsed.reasoning || "Based on platform best practices",
          confidence: result.confidence,
        };
      } catch {
        const now = new Date();
        const suggestions: Date[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          date.setHours(10, 0, 0, 0);
          suggestions.push(date);
        }
        return {
          suggestedTimes: suggestions,
          reasoning: "Default optimal times based on industry standards",
          confidence: result.confidence,
        };
      }
    });
  }

  async publishToInstagram(calendarItemId: number, connectionId: number): Promise<PublishedPost> {
    const item = await this.getCalendarItem(calendarItemId);
    const connection = await this.getConnection(connectionId);
    const version = await this.getLatestVersion(calendarItemId);

    if (!item || !connection || !version) {
      throw new Error("Missing required data for publishing");
    }

    if (!connection.accessToken) {
      throw new Error("Instagram connection missing access token");
    }

    try {
      const mediaContainerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${connection.pageId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: connection.accessToken,
            image_url: version.mediaUrls[0] || "https://via.placeholder.com/1080",
            caption: `${version.caption} ${version.hashtags.map(h => `#${h}`).join(" ")}`,
          }),
        }
      );

      if (!mediaContainerResponse.ok) {
        throw new Error(`Instagram API error: ${await mediaContainerResponse.text()}`);
      }

      const containerData = await mediaContainerResponse.json();
      
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${connection.pageId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: connection.accessToken,
            creation_id: containerData.id,
          }),
        }
      );

      if (!publishResponse.ok) {
        throw new Error(`Instagram publish error: ${await publishResponse.text()}`);
      }

      const publishData = await publishResponse.json();

      const result = await db.execute(sql`
        INSERT INTO published_posts (
          calendar_item_id, connection_id, platform, external_post_id,
          post_url, status, published_at
        ) VALUES (
          ${calendarItemId}, ${connectionId}, 'instagram',
          ${publishData.id}, ${`https://instagram.com/p/${publishData.id}`},
          'published', NOW()
        )
        RETURNING *
      `);

      await this.updateCalendarItem(calendarItemId, { 
        status: "published", 
        publishedAt: new Date() 
      });

      return result.rows[0] as PublishedPost;
    } catch (error) {
      const result = await db.execute(sql`
        INSERT INTO published_posts (
          calendar_item_id, connection_id, platform, status,
          error_message, published_at
        ) VALUES (
          ${calendarItemId}, ${connectionId}, 'instagram',
          'failed', ${(error as Error).message}, NOW()
        )
        RETURNING *
      `);

      await this.updateCalendarItem(calendarItemId, { status: "failed" });

      return result.rows[0] as PublishedPost;
    }
  }

  async publishToFacebook(calendarItemId: number, connectionId: number): Promise<PublishedPost> {
    const item = await this.getCalendarItem(calendarItemId);
    const connection = await this.getConnection(connectionId);
    const version = await this.getLatestVersion(calendarItemId);

    if (!item || !connection || !version) {
      throw new Error("Missing required data for publishing");
    }

    if (!connection.accessToken) {
      throw new Error("Facebook connection missing access token");
    }

    try {
      const postData: Record<string, any> = {
        access_token: connection.accessToken,
        message: `${version.caption} ${version.hashtags.map(h => `#${h}`).join(" ")}`,
      };

      if (version.mediaUrls.length > 0) {
        postData.link = version.mediaUrls[0];
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${connection.pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${await response.text()}`);
      }

      const data = await response.json();

      const result = await db.execute(sql`
        INSERT INTO published_posts (
          calendar_item_id, connection_id, platform, external_post_id,
          post_url, status, published_at
        ) VALUES (
          ${calendarItemId}, ${connectionId}, 'facebook',
          ${data.id}, ${`https://facebook.com/${data.id}`},
          'published', NOW()
        )
        RETURNING *
      `);

      await this.updateCalendarItem(calendarItemId, { 
        status: "published", 
        publishedAt: new Date() 
      });

      return result.rows[0] as PublishedPost;
    } catch (error) {
      const result = await db.execute(sql`
        INSERT INTO published_posts (
          calendar_item_id, connection_id, platform, status,
          error_message, published_at
        ) VALUES (
          ${calendarItemId}, ${connectionId}, 'facebook',
          'failed', ${(error as Error).message}, NOW()
        )
        RETURNING *
      `);

      await this.updateCalendarItem(calendarItemId, { status: "failed" });

      return result.rows[0] as PublishedPost;
    }
  }

  async publishToLinkedIn(calendarItemId: number, connectionId: number): Promise<PublishedPost> {
    const item = await this.getCalendarItem(calendarItemId);
    const connection = await this.getConnection(connectionId);
    const version = await this.getLatestVersion(calendarItemId);

    if (!item || !connection || !version) {
      throw new Error("Missing required data for publishing");
    }

    if (!connection.accessToken) {
      throw new Error("LinkedIn connection missing access token");
    }

    try {
      const linkedInCaption = version.platformVariants?.linkedin?.caption || version.caption;

      const postData = {
        author: `urn:li:person:${connection.profileId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: linkedInCaption,
            },
            shareMediaCategory: version.mediaUrls.length > 0 ? "ARTICLE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await fetch(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${await response.text()}`);
      }

      const data = await response.json();

      const result = await db.execute(sql`
        INSERT INTO published_posts (
          calendar_item_id, connection_id, platform, external_post_id,
          post_url, status, published_at
        ) VALUES (
          ${calendarItemId}, ${connectionId}, 'linkedin',
          ${data.id}, ${`https://linkedin.com/feed/update/${data.id}`},
          'published', NOW()
        )
        RETURNING *
      `);

      await this.updateCalendarItem(calendarItemId, { 
        status: "published", 
        publishedAt: new Date() 
      });

      return result.rows[0] as PublishedPost;
    } catch (error) {
      const result = await db.execute(sql`
        INSERT INTO published_posts (
          calendar_item_id, connection_id, platform, status,
          error_message, published_at
        ) VALUES (
          ${calendarItemId}, ${connectionId}, 'linkedin',
          'failed', ${(error as Error).message}, NOW()
        )
        RETURNING *
      `);

      await this.updateCalendarItem(calendarItemId, { status: "failed" });

      return result.rows[0] as PublishedPost;
    }
  }

  async getPublishedPosts(
    calendarItemId: number
  ): Promise<PublishedPost[]> {
    const result = await db.execute(sql`
      SELECT * FROM published_posts 
      WHERE calendar_item_id = ${calendarItemId}
      ORDER BY published_at DESC
    `);
    return result.rows as PublishedPost[];
  }

  async syncEngagement(postId: number): Promise<PublishedPost> {
    const post = await db.execute(sql`
      SELECT pp.*, sc.access_token FROM published_posts pp
      JOIN social_connections sc ON pp.connection_id = sc.id
      WHERE pp.id = ${postId}
      LIMIT 1
    `);

    if (!post.rows[0]) {
      throw new Error("Post not found");
    }

    const postData = post.rows[0] as any;

    let engagement = { likes: 0, comments: 0, shares: 0, impressions: 0, reach: 0 };

    try {
      if (postData.platform === "facebook" && postData.access_token && postData.external_post_id) {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${postData.external_post_id}?fields=likes.summary(true),comments.summary(true),shares&access_token=${postData.access_token}`
        );
        
        if (response.ok) {
          const data = await response.json();
          engagement = {
            likes: data.likes?.summary?.total_count || 0,
            comments: data.comments?.summary?.total_count || 0,
            shares: data.shares?.count || 0,
            impressions: 0,
            reach: 0,
          };
        }
      }
    } catch (error) {
      console.error("Failed to sync engagement:", error);
    }

    const result = await db.execute(sql`
      UPDATE published_posts SET
        engagement = ${JSON.stringify(engagement)},
        last_engagement_sync_at = NOW()
      WHERE id = ${postId}
      RETURNING *
    `);

    return result.rows[0] as PublishedPost;
  }

  async getCalendarStats(brandId: number): Promise<{
    totalPosts: number;
    published: number;
    scheduled: number;
    drafts: number;
    pendingApproval: number;
    totalEngagement: { likes: number; comments: number; shares: number };
  }> {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status IN ('pending_internal', 'pending_client') THEN 1 ELSE 0 END) as pending
      FROM content_calendar
      WHERE brand_id = ${brandId}
    `);

    const engagement = await db.execute(sql`
      SELECT 
        COALESCE(SUM((engagement->>'likes')::int), 0) as likes,
        COALESCE(SUM((engagement->>'comments')::int), 0) as comments,
        COALESCE(SUM((engagement->>'shares')::int), 0) as shares
      FROM published_posts pp
      JOIN content_calendar cc ON pp.calendar_item_id = cc.id
      WHERE cc.brand_id = ${brandId}
    `);

    return {
      totalPosts: parseInt(stats.rows[0]?.total || "0", 10),
      published: parseInt(stats.rows[0]?.published || "0", 10),
      scheduled: parseInt(stats.rows[0]?.scheduled || "0", 10),
      drafts: parseInt(stats.rows[0]?.drafts || "0", 10),
      pendingApproval: parseInt(stats.rows[0]?.pending || "0", 10),
      totalEngagement: {
        likes: parseInt(engagement.rows[0]?.likes || "0", 10),
        comments: parseInt(engagement.rows[0]?.comments || "0", 10),
        shares: parseInt(engagement.rows[0]?.shares || "0", 10),
      },
    };
  }
}

export const socialPublishingService = new SocialPublishingService();

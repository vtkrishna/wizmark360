import { Router, Request, Response } from "express";
import { db } from "../db";
import { contentItems, contentFolders, brandAssets } from "@shared/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/items", async (req: Request, res: Response) => {
  const { brandId, type, status, folder, search, limit = 50, offset = 0 } = req.query;

  try {
    const conditions: any[] = [];
    
    if (brandId) {
      conditions.push(sql`${contentItems.metadata}->>'brandId' = ${brandId}`);
    }
    
    if (type) {
      conditions.push(eq(contentItems.type, type as string));
    }
    
    if (status) {
      conditions.push(eq(contentItems.status, status as string));
    }
    
    if (folder) {
      conditions.push(eq(contentItems.folderId, folder as string));
    }
    
    if (search) {
      conditions.push(ilike(contentItems.name, `%${search}%`));
    }

    const items = await db.select()
      .from(contentItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(contentItems.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const total = await db.select({ count: sql<number>`count(*)` })
      .from(contentItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      items,
      total: total[0]?.count || 0,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error("Content library error:", error);
    res.status(500).json({ error: "Failed to fetch content items" });
  }
});

router.get("/items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [item] = await db.select()
      .from(contentItems)
      .where(eq(contentItems.id, id));

    if (!item) {
      return res.status(404).json({ error: "Content item not found" });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content item" });
  }
});

router.post("/items", async (req: Request, res: Response) => {
  const {
    name,
    type,
    content,
    url,
    brandId,
    vertical,
    folderId,
    tags = [],
    author = "system",
    language = "English",
    metadata = {}
  } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Missing required fields: name, type" });
  }

  try {
    const enrichedMetadata = {
      ...metadata,
      brandId: brandId || null,
      vertical: vertical || null,
      source: metadata.source || "ai-generated",
      createdVia: "content-library-api"
    };

    const [newItem] = await db.insert(contentItems).values({
      id: uuidv4(),
      name,
      type,
      content,
      url,
      folderId,
      status: "draft",
      author,
      tags,
      metadata: enrichedMetadata,
      language
    }).returning();

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error("Create content error:", error);
    res.status(500).json({ error: "Failed to create content item" });
  }
});

router.patch("/items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    
    if (!item) {
      return res.status(404).json({ error: "Content item not found" });
    }

    const [updated] = await db.update(contentItems)
      .set({
        ...updates,
        updatedAt: new Date(),
        metadata: updates.metadata ? { ...(item.metadata as object), ...updates.metadata } : item.metadata
      })
      .where(eq(contentItems.id, id))
      .returning();

    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update content item" });
  }
});

router.delete("/items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.delete(contentItems).where(eq(contentItems.id, id));
    res.json({ success: true, message: "Content item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete content item" });
  }
});

router.get("/folders", async (req: Request, res: Response) => {
  const { parentId } = req.query;

  try {
    const conditions = parentId ? eq(contentFolders.parentId, parentId as string) : undefined;
    
    const folders = await db.select()
      .from(contentFolders)
      .where(conditions)
      .orderBy(contentFolders.name);

    res.json({ success: true, folders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

router.post("/folders", async (req: Request, res: Response) => {
  const { name, parentId, brandId, metadata = {} } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  try {
    const [folder] = await db.insert(contentFolders).values({
      id: uuidv4(),
      name,
      parentId,
      path: parentId ? `${parentId}/${name}` : `/${name}`,
      metadata: { ...metadata, brandId }
    }).returning();

    res.status(201).json({ success: true, folder });
  } catch (error) {
    res.status(500).json({ error: "Failed to create folder" });
  }
});

router.get("/brand/:brandId/assets", async (req: Request, res: Response) => {
  const { brandId } = req.params;

  try {
    const [assets] = await db.select()
      .from(brandAssets)
      .where(eq(brandAssets.brandId, Number(brandId)));

    const contentCount = await db.select({ count: sql<number>`count(*)` })
      .from(contentItems)
      .where(sql`${contentItems.metadata}->>'brandId' = ${brandId}`);

    res.json({
      success: true,
      brandId,
      assets: assets || null,
      contentCount: contentCount[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brand assets" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  const { brandId } = req.query;

  try {
    const baseCondition = brandId 
      ? sql`${contentItems.metadata}->>'brandId' = ${brandId}` 
      : undefined;

    const byType = await db.select({
      type: contentItems.type,
      count: sql<number>`count(*)`
    })
      .from(contentItems)
      .where(baseCondition)
      .groupBy(contentItems.type);

    const byStatus = await db.select({
      status: contentItems.status,
      count: sql<number>`count(*)`
    })
      .from(contentItems)
      .where(baseCondition)
      .groupBy(contentItems.status);

    const total = await db.select({ count: sql<number>`count(*)` })
      .from(contentItems)
      .where(baseCondition);

    res.json({
      success: true,
      brandId: brandId || "all",
      stats: {
        total: total[0]?.count || 0,
        byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item.count }), {})
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content stats" });
  }
});

router.get("/types", (_req: Request, res: Response) => {
  res.json({
    contentTypes: [
      { id: "text", name: "Text Content", icon: "FileText" },
      { id: "image", name: "Image", icon: "Image" },
      { id: "video", name: "Video", icon: "Video" },
      { id: "audio", name: "Audio", icon: "Music" },
      { id: "presentation", name: "Presentation", icon: "Presentation" },
      { id: "document", name: "Document", icon: "File" },
      { id: "social_post", name: "Social Post", icon: "Share2" },
      { id: "email", name: "Email Template", icon: "Mail" },
      { id: "ad_copy", name: "Ad Copy", icon: "Megaphone" },
      { id: "landing_page", name: "Landing Page", icon: "Layout" }
    ],
    statuses: ["draft", "processing", "published", "archived", "scheduled"]
  });
});

export default router;

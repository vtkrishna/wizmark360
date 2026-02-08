import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  brands,
  brandGuidelines,
  brandContacts,
  servicePackages,
  insertBrandSchema,
  insertBrandGuidelinesSchema,
  insertBrandContactSchema,
  insertServicePackageSchema,
} from "../../shared/agency-erp-schema";
import { generateAllBrandDocuments, BrandData } from "../services/brand-document-generator";
import { listDocuments } from "../services/document-generator";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const allBrands = await db.select().from(brands).orderBy(desc(brands.createdAt));
    res.json(allBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
    
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const [guidelines] = await db.select().from(brandGuidelines).where(eq(brandGuidelines.brandId, brandId));
    const contacts = await db.select().from(brandContacts).where(eq(brandContacts.brandId, brandId));
    const packages = await db.select().from(servicePackages).where(eq(servicePackages.brandId, brandId));

    res.json({
      ...brand,
      guidelines,
      contacts,
      packages,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ error: "Failed to fetch brand" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { brand: brandData, guidelines: guidelinesData, contacts: contactsData, servicePackage: packageData } = req.body;

    const parsedBrand = insertBrandSchema.parse(brandData);
    const [newBrand] = await db.insert(brands).values(parsedBrand).returning();

    if (guidelinesData && newBrand.id) {
      const parsedGuidelines = insertBrandGuidelinesSchema.parse({
        ...guidelinesData,
        brandId: newBrand.id,
      });
      await db.insert(brandGuidelines).values(parsedGuidelines);
    }

    if (contactsData && Array.isArray(contactsData) && newBrand.id) {
      for (const contact of contactsData) {
        if (contact.name) {
          const parsedContact = insertBrandContactSchema.parse({
            ...contact,
            brandId: newBrand.id,
          });
          await db.insert(brandContacts).values(parsedContact);
        }
      }
    }

    if (packageData && newBrand.id) {
      const parsedPackage = insertServicePackageSchema.parse({
        ...packageData,
        brandId: newBrand.id,
      });
      await db.insert(servicePackages).values(parsedPackage);
    }

    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ error: "Failed to create brand", details: String(error) });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const updateData = req.body;

    const [updatedBrand] = await db
      .update(brands)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(brands.id, brandId))
      .returning();

    if (!updatedBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ error: "Failed to update brand" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    await db.delete(brandContacts).where(eq(brandContacts.brandId, brandId));
    await db.delete(servicePackages).where(eq(servicePackages.brandId, brandId));
    await db.delete(brandGuidelines).where(eq(brandGuidelines.brandId, brandId));
    const [deletedBrand] = await db.delete(brands).where(eq(brands.id, brandId)).returning();

    if (!deletedBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ error: "Failed to delete brand" });
  }
});

router.get("/:id/guidelines", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const [guidelines] = await db.select().from(brandGuidelines).where(eq(brandGuidelines.brandId, brandId));
    res.json(guidelines || null);
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    res.status(500).json({ error: "Failed to fetch guidelines" });
  }
});

router.put("/:id/guidelines", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const guidelinesData = req.body;

    const [existing] = await db.select().from(brandGuidelines).where(eq(brandGuidelines.brandId, brandId));

    if (existing) {
      const [updated] = await db
        .update(brandGuidelines)
        .set({ ...guidelinesData, updatedAt: new Date() })
        .where(eq(brandGuidelines.brandId, brandId))
        .returning();
      res.json(updated);
    } else {
      const parsed = insertBrandGuidelinesSchema.parse({ ...guidelinesData, brandId });
      const [created] = await db.insert(brandGuidelines).values(parsed).returning();
      res.status(201).json(created);
    }
  } catch (error) {
    console.error("Error updating guidelines:", error);
    res.status(500).json({ error: "Failed to update guidelines" });
  }
});

router.get("/:id/contacts", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const contacts = await db.select().from(brandContacts).where(eq(brandContacts.brandId, brandId));
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.post("/:id/contacts", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const parsed = insertBrandContactSchema.parse({ ...req.body, brandId });
    const [created] = await db.insert(brandContacts).values(parsed).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

router.post("/:id/generate-documents", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const [guidelines] = await db.select().from(brandGuidelines).where(eq(brandGuidelines.brandId, brandId));

    const brandData: BrandData = {
      name: brand.name,
      industry: brand.industry || undefined,
      description: (brand as any).description || undefined,
      colors: {
        primary: guidelines?.primaryColor || undefined,
        secondary: guidelines?.secondaryColor || undefined,
      },
      fonts: {
        primary: guidelines?.primaryFont || undefined,
      },
      tone: guidelines?.toneOfVoice || undefined,
      targetAudience: guidelines?.targetAudience || undefined,
      values: (brand as any).values || undefined,
      competitors: (brand as any).competitors || undefined,
      usp: (brand as any).usp || undefined,
    };

    const documents = await generateAllBrandDocuments(brandData);

    res.json({
      brandId,
      brandName: brand.name,
      documents: documents.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        format: doc.format,
        size: doc.size,
        downloadUrl: doc.downloadUrl,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error generating brand documents:", error);
    res.status(500).json({ error: "Failed to generate brand documents", details: String(error) });
  }
});

router.get("/:id/documents", async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const allDocuments = listDocuments();
    const brandDocuments = allDocuments.filter((doc) =>
      doc.filename.startsWith(doc.filename.split("_")[0]) &&
      doc.filename.toLowerCase().includes(brand.name.toLowerCase().replace(/\s+/g, "_"))
    );

    res.json({
      brandId,
      brandName: brand.name,
      documents: brandDocuments.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        format: doc.format,
        size: doc.size,
        downloadUrl: doc.downloadUrl,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching brand documents:", error);
    res.status(500).json({ error: "Failed to fetch brand documents" });
  }
});

export default router;

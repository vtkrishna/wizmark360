import { db } from "../db";
import { contentItems } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

export interface StockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl?: string;
  source: "pexels" | "unsplash" | "pixabay";
  width: number;
  height: number;
  alt?: string;
}

export interface StockImageSearchResult {
  images: StockImage[];
  totalResults: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface StockImageDownloadResult {
  success: boolean;
  localPath?: string;
  contentItemId?: string;
  error?: string;
}

class StockImageService {
  private pexelsApiKey: string | null = null;
  private unsplashApiKey: string | null = null;

  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY || null;
    this.unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY || null;
  }

  async searchImages(
    query: string,
    options: {
      page?: number;
      perPage?: number;
      orientation?: "landscape" | "portrait" | "square";
      color?: string;
    } = {}
  ): Promise<StockImageSearchResult> {
    const { page = 1, perPage = 20, orientation, color } = options;

    const results: StockImage[] = [];

    if (this.pexelsApiKey) {
      try {
        const pexelsResults = await this.searchPexels(query, { page, perPage, orientation, color });
        results.push(...pexelsResults);
      } catch (error) {
        console.error("Pexels search error:", error);
      }
    }

    if (this.unsplashApiKey && results.length < perPage) {
      try {
        const unsplashResults = await this.searchUnsplash(query, { page, perPage: perPage - results.length, orientation });
        results.push(...unsplashResults);
      } catch (error) {
        console.error("Unsplash search error:", error);
      }
    }

    if (results.length === 0) {
      const fallbackResults = await this.searchFallback(query, { page, perPage });
      results.push(...fallbackResults);
    }

    return {
      images: results,
      totalResults: results.length * 5,
      page,
      perPage,
      hasMore: results.length === perPage
    };
  }

  private async searchPexels(
    query: string,
    options: { page?: number; perPage?: number; orientation?: string; color?: string }
  ): Promise<StockImage[]> {
    if (!this.pexelsApiKey) return [];

    const params = new URLSearchParams({
      query,
      page: String(options.page || 1),
      per_page: String(options.perPage || 20)
    });

    if (options.orientation) {
      params.append("orientation", options.orientation);
    }
    if (options.color) {
      params.append("color", options.color);
    }

    const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: {
        Authorization: this.pexelsApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.photos || []).map((photo: any) => ({
      id: `pexels_${photo.id}`,
      url: photo.src.large2x || photo.src.large,
      thumbnailUrl: photo.src.medium,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: "pexels" as const,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || query
    }));
  }

  private async searchUnsplash(
    query: string,
    options: { page?: number; perPage?: number; orientation?: string }
  ): Promise<StockImage[]> {
    if (!this.unsplashApiKey) return [];

    const params = new URLSearchParams({
      query,
      page: String(options.page || 1),
      per_page: String(options.perPage || 20)
    });

    if (options.orientation) {
      params.append("orientation", options.orientation);
    }

    const response = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: {
        Authorization: `Client-ID ${this.unsplashApiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.results || []).map((photo: any) => ({
      id: `unsplash_${photo.id}`,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      source: "unsplash" as const,
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description || query
    }));
  }

  private async searchFallback(
    query: string,
    options: { page?: number; perPage?: number }
  ): Promise<StockImage[]> {
    const placeholderImages: StockImage[] = [];
    const count = options.perPage || 20;

    const categories = [
      { keyword: "business", images: ["meeting", "office", "team", "presentation", "laptop"] },
      { keyword: "technology", images: ["computer", "code", "smartphone", "data", "ai"] },
      { keyword: "marketing", images: ["social", "chart", "growth", "brand", "strategy"] },
      { keyword: "nature", images: ["landscape", "forest", "ocean", "mountain", "sunset"] },
      { keyword: "food", images: ["restaurant", "cooking", "healthy", "cuisine", "fresh"] }
    ];

    const queryLower = query.toLowerCase();
    let matchedCategory = categories.find(cat => 
      queryLower.includes(cat.keyword) || cat.images.some(img => queryLower.includes(img))
    );

    if (!matchedCategory) {
      matchedCategory = categories[0];
    }

    for (let i = 0; i < count; i++) {
      const seed = encodeURIComponent(`${query}_${i}_${Date.now()}`);
      const width = 800 + (i % 3) * 200;
      const height = 600 + (i % 2) * 150;

      placeholderImages.push({
        id: `placeholder_${i}_${Date.now()}`,
        url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}/400/300`,
        photographer: "Lorem Picsum",
        source: "pixabay" as const,
        width,
        height,
        alt: `${query} stock image ${i + 1}`
      });
    }

    return placeholderImages;
  }

  async downloadAndSaveImage(
    image: StockImage,
    brandId: number,
    brandName?: string,
    vertical?: string
  ): Promise<StockImageDownloadResult> {
    try {
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const extension = image.url.includes(".png") ? "png" : "jpg";
      const fileName = `stock_${image.source}_${Date.now()}.${extension}`;
      const filePath = `attached_assets/stock_images/${fileName}`;

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);

      const [inserted] = await db.insert(contentItems).values({
        name: image.alt || `Stock Image from ${image.source}`,
        type: "image",
        content: null,
        url: `/${filePath}`,
        status: "published",
        author: image.photographer || "Stock Library",
        language: "English",
        tags: [vertical, "stock", image.source].filter(Boolean),
        metadata: {
          brandId,
          source: image.source,
          photographer: image.photographer,
          photographerUrl: image.photographerUrl,
          originalUrl: image.url,
          width: image.width,
          height: image.height,
          downloadedAt: new Date().toISOString()
        }
      }).returning({ id: contentItems.id });

      return {
        success: true,
        localPath: `/${filePath}`,
        contentItemId: inserted?.id
      };
    } catch (error) {
      console.error("Error downloading stock image:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getPopularCategories(): Promise<string[]> {
    return [
      "business",
      "technology",
      "marketing",
      "social media",
      "office",
      "team",
      "abstract",
      "nature",
      "food",
      "lifestyle",
      "health",
      "finance"
    ];
  }

  async getCuratedCollections(): Promise<{ name: string; query: string; count: number }[]> {
    return [
      { name: "Business & Corporate", query: "business professional", count: 500 },
      { name: "Technology & Digital", query: "technology digital", count: 450 },
      { name: "Marketing & Branding", query: "marketing brand", count: 380 },
      { name: "Social Media", query: "social media content", count: 420 },
      { name: "Team & Collaboration", query: "team meeting collaboration", count: 320 },
      { name: "Abstract & Backgrounds", query: "abstract background gradient", count: 600 },
      { name: "Nature & Landscape", query: "nature landscape", count: 550 },
      { name: "Food & Lifestyle", query: "food lifestyle", count: 400 }
    ];
  }
}

export const stockImageService = new StockImageService();

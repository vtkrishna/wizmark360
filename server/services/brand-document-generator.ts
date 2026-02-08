import { generateResponse, LLMResponse } from "./unified-llm-service";
import { generatePDF, GeneratedDocument, DocumentRequest } from "./document-generator";

export interface BrandData {
  name: string;
  industry?: string;
  description?: string;
  colors?: { primary?: string; secondary?: string };
  fonts?: { primary?: string; secondary?: string };
  tone?: string;
  targetAudience?: string;
  values?: string;
  competitors?: string;
  usp?: string;
}

function buildBrandContext(brandData: BrandData): string {
  const parts: string[] = [];
  parts.push(`Brand Name: ${brandData.name}`);
  if (brandData.industry) parts.push(`Industry: ${brandData.industry}`);
  if (brandData.description) parts.push(`Description: ${brandData.description}`);
  if (brandData.colors?.primary) parts.push(`Primary Color: ${brandData.colors.primary}`);
  if (brandData.colors?.secondary) parts.push(`Secondary Color: ${brandData.colors.secondary}`);
  if (brandData.fonts?.primary) parts.push(`Primary Font: ${brandData.fonts.primary}`);
  if (brandData.fonts?.secondary) parts.push(`Secondary Font: ${brandData.fonts.secondary}`);
  if (brandData.tone) parts.push(`Tone of Voice: ${brandData.tone}`);
  if (brandData.targetAudience) parts.push(`Target Audience: ${brandData.targetAudience}`);
  if (brandData.values) parts.push(`Brand Values: ${brandData.values}`);
  if (brandData.competitors) parts.push(`Key Competitors: ${brandData.competitors}`);
  if (brandData.usp) parts.push(`Unique Selling Proposition: ${brandData.usp}`);
  return parts.join("\n");
}

async function generateLLMContent(systemPrompt: string, userPrompt: string): Promise<string> {
  const response: LLMResponse = await generateResponse({
    message: userPrompt,
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });
  return response.content;
}

export async function generateBrandBook(brandData: BrandData): Promise<GeneratedDocument> {
  const brandContext = buildBrandContext(brandData);

  const systemPrompt = `You are an expert brand strategist and identity consultant. Create comprehensive, professionally written brand books in Markdown format. Use proper Markdown headings (##, ###), bullet points, tables, and formatting. The output must be detailed, actionable, and ready for professional use.`;

  const userPrompt = `Create a comprehensive Brand Book for the following brand:\n\n${brandContext}\n\nThe brand book must include these sections with detailed content:\n\n1. Brand Overview & Mission - Mission statement, vision, brand story, and purpose\n2. Brand Values & Personality - Core values, brand personality traits, brand archetypes\n3. Visual Identity - Color palette usage (with hex codes), typography guidelines, logo usage rules, spacing and sizing guidelines\n4. Brand Voice & Tone Guide - Voice characteristics, tone variations by context, writing style rules, vocabulary preferences\n5. Target Audience Profiles - Detailed persona descriptions, demographics, psychographics, pain points, and motivations\n6. Messaging Framework - Key messages, value propositions, elevator pitches, tagline options\n7. Content Guidelines by Channel - Social media, email, website, advertising, PR guidelines\n8. Do's and Don'ts - Clear list of brand usage rules, common mistakes to avoid\n\nFormat the entire document in clean, professional Markdown.`;

  const content = await generateLLMContent(systemPrompt, userPrompt);

  const docRequest: DocumentRequest = {
    title: `${brandData.name} - Brand Book`,
    content,
    type: "pdf",
    brandContext: {
      brandName: brandData.name,
      primaryColor: brandData.colors?.primary,
      secondaryColor: brandData.colors?.secondary,
    },
  };

  return generatePDF(docRequest);
}

export async function generateStyleGuide(brandData: BrandData): Promise<GeneratedDocument> {
  const brandContext = buildBrandContext(brandData);

  const systemPrompt = `You are a visual design systems expert. Create detailed visual style guides in Markdown format with precise specifications for colors, typography, spacing, and design elements. Use tables, hex codes, and specific measurements throughout.`;

  const userPrompt = `Create a comprehensive Visual Style Guide for the following brand:\n\n${brandContext}\n\nThe style guide must include:\n\n1. Color System - Primary, secondary, accent, neutral palettes with hex codes, RGB values, usage percentages, and accessibility contrast ratios\n2. Typography System - Font families, weights, sizes for headings (H1-H6), body text, captions, and UI elements with line-height and letter-spacing specs\n3. Logo Specifications - Clear space requirements, minimum sizes, color variations, placement guidelines, and incorrect usage examples\n4. Iconography & Illustration Style - Icon style guidelines, stroke weights, grid system, illustration approach\n5. Photography & Imagery - Photo style direction, filters, treatments, composition guidelines, image dos and don'ts\n6. Layout & Grid System - Grid specifications, margins, gutters, breakpoints for responsive design\n7. Component Patterns - Button styles, form elements, card designs, navigation patterns with spacing specs\n8. Motion & Animation - Transition durations, easing curves, animation principles\n\nFormat everything in clean, professional Markdown with tables for specifications.`;

  const content = await generateLLMContent(systemPrompt, userPrompt);

  const docRequest: DocumentRequest = {
    title: `${brandData.name} - Visual Style Guide`,
    content,
    type: "pdf",
    brandContext: {
      brandName: brandData.name,
      primaryColor: brandData.colors?.primary,
      secondaryColor: brandData.colors?.secondary,
    },
  };

  return generatePDF(docRequest);
}

export async function generateBrandGuidelines(brandData: BrandData): Promise<GeneratedDocument> {
  const brandContext = buildBrandContext(brandData);

  const systemPrompt = `You are a senior brand consultant specializing in comprehensive brand governance documentation. Create thorough brand guidelines in Markdown format that serve as the definitive reference for all brand-related decisions across an organization.`;

  const userPrompt = `Create comprehensive Brand Guidelines for the following brand:\n\n${brandContext}\n\nThe guidelines must include:\n\n1. Introduction & Purpose - Why these guidelines exist, who should use them, how to use this document\n2. Brand Foundation - Brand history, mission, vision, values, brand promise, and positioning statement\n3. Brand Architecture - Brand hierarchy, sub-brands, co-branding rules, partner branding guidelines\n4. Verbal Identity - Brand name usage, taglines, boilerplate text, key terminology, glossary of brand terms\n5. Visual Identity Standards - Complete logo guide, color specifications, typography rules, imagery standards\n6. Digital Brand Standards - Website guidelines, social media profiles, email signatures, digital advertising specs\n7. Print & Physical Standards - Business cards, letterheads, signage, packaging, merchandise guidelines\n8. Internal Communications - Employee communications, presentations, internal documents, training materials\n9. External Communications - Press releases, media kits, investor communications, customer-facing materials\n10. Brand Governance - Approval processes, brand asset management, compliance monitoring, update procedures\n11. Templates & Resources - List of available templates, asset locations, contact information for brand team\n\nFormat everything in clean, professional Markdown.`;

  const content = await generateLLMContent(systemPrompt, userPrompt);

  const docRequest: DocumentRequest = {
    title: `${brandData.name} - Brand Guidelines`,
    content,
    type: "pdf",
    brandContext: {
      brandName: brandData.name,
      primaryColor: brandData.colors?.primary,
      secondaryColor: brandData.colors?.secondary,
    },
  };

  return generatePDF(docRequest);
}

export async function generateAllBrandDocuments(brandData: BrandData): Promise<GeneratedDocument[]> {
  const [brandBook, styleGuide, brandGuidelines] = await Promise.all([
    generateBrandBook(brandData),
    generateStyleGuide(brandData),
    generateBrandGuidelines(brandData),
  ]);

  return [brandBook, styleGuide, brandGuidelines];
}

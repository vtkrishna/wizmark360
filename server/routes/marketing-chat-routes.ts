import { Router, Request, Response } from 'express';
import { generateResponse, generateMarketingContent, getAvailableProviders } from '../services/unified-llm-service';
import { generateDocument } from '../services/document-generator';

const router = Router();

interface ChatRequest {
  message: string;
  model?: string;
  provider?: string;
  context?: {
    previousMessages?: any[];
    capabilities?: string[];
    brandContext?: any;
  };
}

interface GeneratedAsset {
  id: string;
  type: 'presentation' | 'proposal' | 'image' | 'document' | 'infographic' | 'video_script' | 'email_template' | 'social_post';
  title: string;
  description: string;
  downloadUrl?: string;
  previewUrl?: string;
  format?: string;
}

interface IntentMatch {
  type: string;
  agentName: string;
  documentType?: 'pdf' | 'docx' | 'pptx' | 'html';
  assetType: GeneratedAsset['type'];
  assetTitle: string;
  assetDescription: string;
  assetFormat: string;
}

function detectIntent(message: string): IntentMatch | null {
  const lower = message.toLowerCase();

  if (lower.includes('presentation') || lower.includes('pitch') || lower.includes('deck')) {
    return {
      type: 'presentation',
      agentName: 'Presentation Specialist',
      documentType: 'pptx',
      assetType: 'presentation',
      assetTitle: 'Marketing Pitch Deck',
      assetDescription: 'AI-generated professional presentation',
      assetFormat: 'PPTX',
    };
  }

  if (lower.includes('proposal') || lower.includes('rfp') || lower.includes('quote')) {
    return {
      type: 'proposal',
      agentName: 'Proposal Writer',
      documentType: 'docx',
      assetType: 'proposal',
      assetTitle: 'Business Proposal',
      assetDescription: 'AI-generated proposal document',
      assetFormat: 'DOCX',
    };
  }

  if (lower.includes('email') || lower.includes('campaign') || lower.includes('newsletter')) {
    return {
      type: 'email',
      agentName: 'Email Marketing Specialist',
      documentType: 'html',
      assetType: 'email_template',
      assetTitle: 'Email Campaign Templates',
      assetDescription: 'AI-generated email sequence',
      assetFormat: 'HTML',
    };
  }

  if (lower.includes('social') || lower.includes('post') || lower.includes('content')) {
    return {
      type: 'social',
      agentName: 'Social Media Strategist',
      assetType: 'social_post',
      assetTitle: 'Social Media Content Pack',
      assetDescription: 'AI-generated social media content',
      assetFormat: 'PDF',
    };
  }

  if (lower.includes('research') || lower.includes('analysis') || lower.includes('competitor') || lower.includes('market')) {
    return {
      type: 'research',
      agentName: 'Market Research Analyst',
      documentType: 'pdf',
      assetType: 'document',
      assetTitle: 'Market Research Report',
      assetDescription: 'AI-generated market analysis',
      assetFormat: 'PDF',
    };
  }

  if (lower.includes('strategy') || lower.includes('plan') || lower.includes('roadmap')) {
    return {
      type: 'strategy',
      agentName: 'Brand Strategist',
      assetType: 'document',
      assetTitle: 'Marketing Strategy Document',
      assetDescription: 'AI-generated strategic plan',
      assetFormat: 'PDF',
    };
  }

  if (lower.includes('image') || lower.includes('visual') || lower.includes('graphic') || lower.includes('design')) {
    return {
      type: 'social',
      agentName: 'Social Media Strategist',
      assetType: 'image',
      assetTitle: 'Marketing Visual Concepts',
      assetDescription: 'AI-generated visual content directions',
      assetFormat: 'PDF',
    };
  }

  if (lower.includes('video') || lower.includes('script') || lower.includes('reel')) {
    return {
      type: 'social',
      agentName: 'Video Content Creator',
      assetType: 'video_script',
      assetTitle: 'Video Script Package',
      assetDescription: 'AI-generated video production scripts',
      assetFormat: 'PDF',
    };
  }

  if (lower.includes('infographic') || lower.includes('chart') || lower.includes('data visual')) {
    return {
      type: 'social',
      agentName: 'SEO Analyst',
      assetType: 'infographic',
      assetTitle: 'Infographic Concepts',
      assetDescription: 'AI-generated data visualization concepts',
      assetFormat: 'PDF',
    };
  }

  if (lower.includes('brand') || lower.includes('guideline') || lower.includes('style guide')) {
    return {
      type: 'brand_guide',
      agentName: 'Brand Strategist',
      assetType: 'document',
      assetTitle: 'Brand Guidelines Document',
      assetDescription: 'AI-generated brand identity manual',
      assetFormat: 'PDF',
    };
  }

  return null;
}

router.post('/marketing', async (req: Request, res: Response) => {
  try {
    const { message, model, provider, context } = req.body as ChatRequest;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const intent = detectIntent(message);
    const agentName = intent?.agentName || 'Marketing AI Assistant';
    const contentType = intent?.type || 'strategy';

    const llmResponse = await generateMarketingContent(
      message,
      contentType,
      context?.brandContext
    );

    const generatedAssets: GeneratedAsset[] = [];

    if (intent?.documentType) {
      try {
        const doc = await generateDocument({
          title: intent.assetTitle,
          content: llmResponse.content,
          type: intent.documentType,
          brandContext: context?.brandContext,
        });

        generatedAssets.push({
          id: doc.id,
          type: intent.assetType,
          title: intent.assetTitle,
          description: intent.assetDescription,
          format: intent.assetFormat,
          downloadUrl: `/api/export/${doc.id}/download`,
        });
      } catch (docError: any) {
        console.error('Document generation failed:', docError.message);
      }
    }

    res.json({
      success: true,
      content: llmResponse.content,
      message: llmResponse.content,
      agentName,
      model: llmResponse.model,
      provider: llmResponse.provider,
      generatedAssets,
      usage: {
        tokensUsed: llmResponse.tokensUsed,
      },
      cost: llmResponse.cost,
    });
  } catch (error: any) {
    console.error('Marketing chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat request. No LLM providers are available.',
    });
  }
});

router.get('/capabilities', (_req: Request, res: Response) => {
  res.json({
    success: true,
    capabilities: [
      { id: 'presentation', name: 'Create Presentation', description: 'Generate professional pitch decks and presentations' },
      { id: 'proposal', name: 'Write Proposal', description: 'Draft business proposals and RFPs' },
      { id: 'image', name: 'Generate Image', description: 'Create marketing visuals and graphics' },
      { id: 'infographic', name: 'Design Infographic', description: 'Create data visualizations and infographics' },
      { id: 'email', name: 'Email Campaign', description: 'Create email sequences and templates' },
      { id: 'social', name: 'Social Content', description: 'Generate social media posts and carousels' },
      { id: 'research', name: 'Market Research', description: 'Conduct competitor and market analysis' },
      { id: 'strategy', name: 'Marketing Strategy', description: 'Develop marketing strategies and plans' },
      { id: 'video_script', name: 'Video Script', description: 'Write scripts for marketing videos' },
      { id: 'brand_guide', name: 'Brand Guidelines', description: 'Create brand style guides' },
    ],
  });
});

router.get('/models', (_req: Request, res: Response) => {
  const providers = getAvailableProviders();
  const models: Array<{ id: string; name: string; provider: string }> = [];

  for (const p of providers) {
    switch (p) {
      case 'openai':
        models.push({ id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' });
        models.push({ id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' });
        break;
      case 'anthropic':
        models.push({ id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' });
        break;
      case 'gemini':
        models.push({ id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' });
        break;
      case 'groq':
        models.push({ id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq' });
        break;
      case 'openrouter':
        models.push({ id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', provider: 'openrouter' });
        models.push({ id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', provider: 'openrouter' });
        break;
    }
  }

  res.json({ success: true, models, providers });
});

router.get('/providers', (_req: Request, res: Response) => {
  const providers = getAvailableProviders();
  res.json({
    success: true,
    providers,
    count: providers.length,
    configured: providers.length > 0,
  });
});

export default router;

/**
 * Conversion Tracking API Routes
 * Endpoints for pixel management, conversion events, and attribution
 */

import { Router, Request, Response } from 'express';
import { conversionTrackingService, PixelProvider } from '../services/conversion-tracking-service';

const router = Router();

router.post('/pixels', async (req: Request, res: Response) => {
  try {
    const { brandId, provider, pixelId, name, config } = req.body;
    
    if (!provider || !pixelId || !name) {
      return res.status(400).json({ success: false, error: 'Provider, pixelId, and name are required' });
    }
    
    const pixel = await conversionTrackingService.createPixel(
      brandId || 'default',
      provider as PixelProvider,
      pixelId,
      name,
      config
    );
    
    res.json({ success: true, data: pixel });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pixels', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const provider = req.query.provider as PixelProvider | undefined;
    
    let pixels;
    if (provider) {
      pixels = conversionTrackingService.getPixelsByProvider(brandId, provider);
    } else {
      pixels = conversionTrackingService.getPixels(brandId);
    }
    
    res.json({ success: true, data: pixels });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get pixels' });
  }
});

router.get('/pixels/:pixelId/code', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const pixels = conversionTrackingService.getPixels(brandId);
    const pixel = pixels.find(p => p.id === req.params.pixelId);
    
    if (!pixel) {
      return res.status(404).json({ success: false, error: 'Pixel not found' });
    }
    
    const code = conversionTrackingService.generatePixelCode(pixel);
    res.json({ success: true, data: { code, pixel } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate pixel code' });
  }
});

router.put('/pixels/:pixelId', async (req: Request, res: Response) => {
  try {
    const { name, isActive, config } = req.body;
    const pixel = await conversionTrackingService.updatePixel(req.params.pixelId, {
      name,
      isActive,
      config
    });
    
    if (!pixel) {
      return res.status(404).json({ success: false, error: 'Pixel not found' });
    }
    
    res.json({ success: true, data: pixel });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/pixels/:pixelId', async (req: Request, res: Response) => {
  try {
    const success = await conversionTrackingService.deletePixel(req.params.pixelId);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Pixel not found' });
    }
    
    res.json({ success: true, message: 'Pixel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete pixel' });
  }
});

router.post('/events', async (req: Request, res: Response) => {
  try {
    const { brandId, eventName, displayName, category, value, currency, parameters, pixelMappings } = req.body;
    
    if (!eventName || !displayName) {
      return res.status(400).json({ success: false, error: 'Event name and display name are required' });
    }
    
    const event = await conversionTrackingService.createConversionEvent(
      brandId || 'default',
      eventName,
      displayName,
      { category, value, currency, parameters, pixelMappings }
    );
    
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/events', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const events = conversionTrackingService.getConversionEvents(brandId);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get events' });
  }
});

router.get('/events/standard', async (req: Request, res: Response) => {
  try {
    const provider = req.query.provider as PixelProvider | undefined;
    const events = conversionTrackingService.getStandardEvents(provider);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get standard events' });
  }
});

router.post('/track', async (req: Request, res: Response) => {
  try {
    const { brandId, eventName, value, currency, metadata, sourceUrl, userId, sessionId } = req.body;
    
    if (!eventName) {
      return res.status(400).json({ success: false, error: 'Event name is required' });
    }
    
    const records = await conversionTrackingService.trackConversion(
      brandId || 'default',
      eventName,
      { value, currency, metadata, sourceUrl, userId, sessionId }
    );
    
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/attribution', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brandId as string || 'default';
    const startDate = new Date(req.query.startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(req.query.endDate as string || Date.now());
    
    const spendData = req.query.spend ? JSON.parse(req.query.spend as string) : undefined;
    
    const attribution = await conversionTrackingService.getAttributionData(
      brandId,
      startDate,
      endDate,
      spendData
    );
    
    res.json({ success: true, data: attribution });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/server-side-code', async (req: Request, res: Response) => {
  try {
    const { provider, eventName, pixelId, value, currency, measurementId } = req.query;
    
    if (!provider || !eventName) {
      return res.status(400).json({ success: false, error: 'Provider and eventName are required' });
    }
    
    const code = conversionTrackingService.getServerSideTrackingCode(
      provider as PixelProvider,
      eventName as string,
      { pixelId, value: parseFloat(value as string) || 0, currency: currency as string, measurementId }
    );
    
    res.json({ success: true, data: { code } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

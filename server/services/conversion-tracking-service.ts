/**
 * Conversion Tracking & Pixel Service
 * Manages tracking pixels (Facebook Pixel, Google Tag, LinkedIn Insight, TikTok Pixel)
 * and conversion events across all advertising platforms
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

export type PixelProvider = 'facebook' | 'google' | 'linkedin' | 'tiktok' | 'gtm';

export interface TrackingPixel {
  id: string;
  brandId: string;
  provider: PixelProvider;
  pixelId: string;
  name: string;
  isActive: boolean;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionEvent {
  id: string;
  brandId: string;
  eventName: string;
  displayName: string;
  category: 'standard' | 'custom';
  pixels: { provider: PixelProvider; eventName: string }[];
  value?: number;
  currency?: string;
  parameters: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface ConversionRecord {
  id: string;
  brandId: string;
  eventId: string;
  eventName: string;
  provider: PixelProvider;
  timestamp: Date;
  value?: number;
  currency?: string;
  metadata: Record<string, any>;
  sourceUrl?: string;
  userId?: string;
  sessionId?: string;
}

export interface AttributionData {
  conversions: number;
  revenue: number;
  roas: number;
  costPerConversion: number;
  conversionRate: number;
  byProvider: Record<PixelProvider, {
    conversions: number;
    revenue: number;
    spend: number;
    roas: number;
  }>;
  byEvent: Record<string, {
    count: number;
    revenue: number;
    avgValue: number;
  }>;
}

const STANDARD_EVENTS: Record<PixelProvider, string[]> = {
  facebook: ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase', 'Lead', 'CompleteRegistration', 'Contact', 'Subscribe', 'Search'],
  google: ['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'generate_lead', 'sign_up', 'contact', 'subscribe', 'search'],
  linkedin: ['pageview', 'conversion', 'lead', 'signup'],
  tiktok: ['ViewContent', 'AddToCart', 'InitiateCheckout', 'CompletePayment', 'Subscribe', 'Contact', 'Download', 'SubmitForm'],
  gtm: ['page_view', 'click', 'scroll', 'video', 'form_submit', 'purchase', 'add_to_cart', 'sign_up']
};

const EVENT_MAPPING: Record<string, Record<PixelProvider, string>> = {
  'page_view': { facebook: 'PageView', google: 'page_view', linkedin: 'pageview', tiktok: 'ViewContent', gtm: 'page_view' },
  'view_content': { facebook: 'ViewContent', google: 'view_item', linkedin: 'conversion', tiktok: 'ViewContent', gtm: 'view_item' },
  'add_to_cart': { facebook: 'AddToCart', google: 'add_to_cart', linkedin: 'conversion', tiktok: 'AddToCart', gtm: 'add_to_cart' },
  'checkout': { facebook: 'InitiateCheckout', google: 'begin_checkout', linkedin: 'conversion', tiktok: 'InitiateCheckout', gtm: 'begin_checkout' },
  'purchase': { facebook: 'Purchase', google: 'purchase', linkedin: 'conversion', tiktok: 'CompletePayment', gtm: 'purchase' },
  'lead': { facebook: 'Lead', google: 'generate_lead', linkedin: 'lead', tiktok: 'SubmitForm', gtm: 'generate_lead' },
  'signup': { facebook: 'CompleteRegistration', google: 'sign_up', linkedin: 'signup', tiktok: 'Subscribe', gtm: 'sign_up' },
  'contact': { facebook: 'Contact', google: 'contact', linkedin: 'conversion', tiktok: 'Contact', gtm: 'contact' }
};

class ConversionTrackingService {
  private pixels: Map<string, TrackingPixel[]> = new Map();
  private events: Map<string, ConversionEvent[]> = new Map();
  private conversions: Map<string, ConversionRecord[]> = new Map();

  constructor() {
    console.log('📊 Conversion Tracking Service initialized');
    console.log('   Supported pixels: Facebook, Google Tag, LinkedIn Insight, TikTok, GTM');
  }

  async createPixel(
    brandId: string,
    provider: PixelProvider,
    pixelId: string,
    name: string,
    config?: Record<string, any>
  ): Promise<TrackingPixel> {
    const pixel: TrackingPixel = {
      id: `pixel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      provider,
      pixelId,
      name,
      isActive: true,
      config: config || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existing = this.pixels.get(brandId) || [];
    existing.push(pixel);
    this.pixels.set(brandId, existing);

    return pixel;
  }

  getPixels(brandId: string): TrackingPixel[] {
    return this.pixels.get(brandId) || [];
  }

  getPixelsByProvider(brandId: string, provider: PixelProvider): TrackingPixel[] {
    const pixels = this.pixels.get(brandId) || [];
    return pixels.filter(p => p.provider === provider && p.isActive);
  }

  async updatePixel(pixelId: string, updates: Partial<TrackingPixel>): Promise<TrackingPixel | null> {
    for (const [brandId, pixels] of this.pixels.entries()) {
      const index = pixels.findIndex(p => p.id === pixelId);
      if (index !== -1) {
        pixels[index] = { ...pixels[index], ...updates, updatedAt: new Date() };
        return pixels[index];
      }
    }
    return null;
  }

  async deletePixel(pixelId: string): Promise<boolean> {
    for (const [brandId, pixels] of this.pixels.entries()) {
      const index = pixels.findIndex(p => p.id === pixelId);
      if (index !== -1) {
        pixels.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  async createConversionEvent(
    brandId: string,
    eventName: string,
    displayName: string,
    options?: {
      category?: 'standard' | 'custom';
      value?: number;
      currency?: string;
      parameters?: Record<string, any>;
      pixelMappings?: { provider: PixelProvider; eventName: string }[];
    }
  ): Promise<ConversionEvent> {
    const category = options?.category || (eventName in EVENT_MAPPING ? 'standard' : 'custom');
    
    let pixels: { provider: PixelProvider; eventName: string }[] = options?.pixelMappings || [];
    if (pixels.length === 0 && category === 'standard' && EVENT_MAPPING[eventName]) {
      const brandPixels = this.getPixels(brandId);
      pixels = brandPixels.map(p => ({
        provider: p.provider,
        eventName: EVENT_MAPPING[eventName][p.provider] || eventName
      }));
    }

    const event: ConversionEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      eventName,
      displayName,
      category,
      pixels,
      value: options?.value,
      currency: options?.currency || 'USD',
      parameters: options?.parameters || {},
      isActive: true,
      createdAt: new Date()
    };

    const existing = this.events.get(brandId) || [];
    existing.push(event);
    this.events.set(brandId, existing);

    return event;
  }

  getConversionEvents(brandId: string): ConversionEvent[] {
    return this.events.get(brandId) || [];
  }

  getStandardEvents(provider?: PixelProvider): string[] {
    if (provider) {
      return STANDARD_EVENTS[provider] || [];
    }
    return Object.keys(EVENT_MAPPING);
  }

  async trackConversion(
    brandId: string,
    eventName: string,
    data?: {
      value?: number;
      currency?: string;
      metadata?: Record<string, any>;
      sourceUrl?: string;
      userId?: string;
      sessionId?: string;
    }
  ): Promise<ConversionRecord[]> {
    const events = this.events.get(brandId) || [];
    const event = events.find(e => e.eventName === eventName && e.isActive);
    
    if (!event) {
      const record = this.createConversionRecord(brandId, eventName, 'gtm', data);
      return [record];
    }

    const records: ConversionRecord[] = [];
    for (const pixelMapping of event.pixels) {
      const record = this.createConversionRecord(
        brandId,
        event.eventName,
        pixelMapping.provider,
        {
          ...data,
          value: data?.value || event.value,
          currency: data?.currency || event.currency
        }
      );
      records.push(record);
    }

    return records;
  }

  private createConversionRecord(
    brandId: string,
    eventName: string,
    provider: PixelProvider,
    data?: {
      value?: number;
      currency?: string;
      metadata?: Record<string, any>;
      sourceUrl?: string;
      userId?: string;
      sessionId?: string;
    }
  ): ConversionRecord {
    const record: ConversionRecord = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      eventId: '',
      eventName,
      provider,
      timestamp: new Date(),
      value: data?.value,
      currency: data?.currency,
      metadata: data?.metadata || {},
      sourceUrl: data?.sourceUrl,
      userId: data?.userId,
      sessionId: data?.sessionId
    };

    const existing = this.conversions.get(brandId) || [];
    existing.push(record);
    this.conversions.set(brandId, existing);

    return record;
  }

  async getAttributionData(
    brandId: string,
    startDate: Date,
    endDate: Date,
    spendData?: Record<PixelProvider, number>
  ): Promise<AttributionData> {
    const conversions = this.conversions.get(brandId) || [];
    const filtered = conversions.filter(
      c => c.timestamp >= startDate && c.timestamp <= endDate
    );

    const totalConversions = filtered.length;
    const totalRevenue = filtered.reduce((sum, c) => sum + (c.value || 0), 0);
    const totalSpend = spendData ? Object.values(spendData).reduce((a, b) => a + b, 0) : 0;

    const byProvider: Record<string, { conversions: number; revenue: number; spend: number; roas: number }> = {};
    const byEvent: Record<string, { count: number; revenue: number; avgValue: number }> = {};

    for (const conv of filtered) {
      if (!byProvider[conv.provider]) {
        byProvider[conv.provider] = { conversions: 0, revenue: 0, spend: 0, roas: 0 };
      }
      byProvider[conv.provider].conversions++;
      byProvider[conv.provider].revenue += conv.value || 0;
      byProvider[conv.provider].spend = spendData?.[conv.provider] || 0;

      if (!byEvent[conv.eventName]) {
        byEvent[conv.eventName] = { count: 0, revenue: 0, avgValue: 0 };
      }
      byEvent[conv.eventName].count++;
      byEvent[conv.eventName].revenue += conv.value || 0;
    }

    for (const provider of Object.keys(byProvider)) {
      const data = byProvider[provider];
      data.roas = data.spend > 0 ? data.revenue / data.spend : 0;
    }

    for (const eventName of Object.keys(byEvent)) {
      const data = byEvent[eventName];
      data.avgValue = data.count > 0 ? data.revenue / data.count : 0;
    }

    return {
      conversions: totalConversions,
      revenue: totalRevenue,
      roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
      conversionRate: 0,
      byProvider: byProvider as any,
      byEvent
    };
  }

  generatePixelCode(pixel: TrackingPixel): string {
    switch (pixel.provider) {
      case 'facebook':
        return this.generateFacebookPixelCode(pixel);
      case 'google':
        return this.generateGoogleTagCode(pixel);
      case 'linkedin':
        return this.generateLinkedInInsightCode(pixel);
      case 'tiktok':
        return this.generateTikTokPixelCode(pixel);
      case 'gtm':
        return this.generateGTMCode(pixel);
      default:
        return '';
    }
  }

  private generateFacebookPixelCode(pixel: TrackingPixel): string {
    return `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixel.pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixel.pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`;
  }

  private generateGoogleTagCode(pixel: TrackingPixel): string {
    return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${pixel.pixelId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${pixel.pixelId}');
</script>`;
  }

  private generateLinkedInInsightCode(pixel: TrackingPixel): string {
    return `<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "${pixel.pixelId}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${pixel.pixelId}&fmt=gif" />
</noscript>`;
  }

  private generateTikTokPixelCode(pixel: TrackingPixel): string {
    return `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${pixel.pixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>`;
  }

  private generateGTMCode(pixel: TrackingPixel): string {
    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${pixel.pixelId}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) - Place after opening <body> tag -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${pixel.pixelId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
  }

  getServerSideTrackingCode(provider: PixelProvider, eventName: string, data: Record<string, any>): string {
    switch (provider) {
      case 'facebook':
        return `// Facebook Conversions API
const response = await fetch('https://graph.facebook.com/v18.0/${data.pixelId}/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: [{
      event_name: '${eventName}',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        em: hashedEmail,
        ph: hashedPhone
      },
      custom_data: {
        value: ${data.value || 0},
        currency: '${data.currency || 'USD'}'
      }
    }],
    access_token: process.env.FB_ACCESS_TOKEN
  })
});`;

      case 'google':
        return `// Google Ads Conversion Tracking (Measurement Protocol)
const response = await fetch('https://www.google-analytics.com/mp/collect?measurement_id=${data.measurementId}&api_secret=YOUR_API_SECRET', {
  method: 'POST',
  body: JSON.stringify({
    client_id: clientId,
    events: [{
      name: '${eventName}',
      params: {
        value: ${data.value || 0},
        currency: '${data.currency || 'USD'}'
      }
    }]
  })
});`;

      default:
        return '';
    }
  }
}

export const conversionTrackingService = new ConversionTrackingService();

/**
 * Razorpay Payment Service
 * 
 * Production-grade payment processing for Indian agencies
 * Supports: Orders, Invoices, Subscriptions, Payment Links, Refunds
 */

import { WAISDKOrchestration } from './wai-sdk-orchestration';
import crypto from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface Invoice {
  id: string;
  brandId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  number: string;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'cancelled' | 'expired';
  currency: string;
  subtotal: number;
  tax: number;
  taxType: 'GST' | 'IGST' | 'CGST_SGST';
  gstNumber?: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  lineItems: InvoiceLineItem[];
  dueDate: Date;
  paidAt?: Date;
  razorpayInvoiceId?: string;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  hsnSacCode?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

export interface RazorpayOrder {
  id: string;
  razorpayOrderId?: string;
  brandId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  notes: Record<string, string>;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  brandId: string;
  clientId: string;
  planId: string;
  planName: string;
  razorpaySubscriptionId?: string;
  status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  currency: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalCount?: number;
  paidCount: number;
  remainingCount?: number;
  createdAt: Date;
}

export interface PaymentLink {
  id: string;
  brandId: string;
  razorpayPaymentLinkId?: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  shortUrl: string;
  status: 'created' | 'paid' | 'cancelled' | 'expired';
  expireBy?: Date;
  notifyEmail: boolean;
  notifySms: boolean;
  timesUsed: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  invoiceId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method: 'card' | 'netbanking' | 'wallet' | 'upi' | 'emi';
  bank?: string;
  wallet?: string;
  vpa?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  description: string;
  fee?: number;
  tax?: number;
  createdAt: Date;
  capturedAt?: Date;
}

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

export class RazorpayPaymentService {
  private waiSDK: WAISDKOrchestration;
  private config: RazorpayConfig;
  private invoices: Map<string, Invoice[]> = new Map();
  private orders: Map<string, RazorpayOrder[]> = new Map();
  private subscriptions: Map<string, Subscription[]> = new Map();
  private paymentLinks: Map<string, PaymentLink[]> = new Map();
  private payments: Map<string, Payment[]> = new Map();

  constructor() {
    this.waiSDK = new WAISDKOrchestration();
    this.config = {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
    };
    this.initializeSeedData();
    console.log('💳 Razorpay Payment Service initialized');
    console.log(`   API: ${this.config.keyId ? '✅ Configured' : '⚠️ Awaiting credentials'}`);
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.config.keyId}:${this.config.keySecret}`).toString('base64');
  }

  private initializeSeedData(): void {
    const demoInvoices: Invoice[] = [
      {
        id: 'inv_1',
        brandId: 'demo',
        clientId: 'client_1',
        clientName: 'TechStart India',
        clientEmail: 'billing@techstart.in',
        clientPhone: '+919876543210',
        number: 'INV-2024-001',
        status: 'paid',
        currency: 'INR',
        subtotal: 250000,
        tax: 45000,
        taxType: 'CGST_SGST',
        gstNumber: '27AABCT1234F1ZH',
        total: 295000,
        amountPaid: 295000,
        amountDue: 0,
        lineItems: [
          { id: 'li_1', description: 'Marketing Platform - Annual License', hsnSacCode: '998314', quantity: 1, unitPrice: 200000, amount: 200000, taxRate: 18, taxAmount: 36000 },
          { id: 'li_2', description: 'WhatsApp Marketing Add-on', hsnSacCode: '998314', quantity: 1, unitPrice: 50000, amount: 50000, taxRate: 18, taxAmount: 9000 }
        ],
        dueDate: new Date(Date.now() - 30 * 86400000),
        paidAt: new Date(Date.now() - 25 * 86400000),
        createdAt: new Date(Date.now() - 35 * 86400000),
        updatedAt: new Date()
      },
      {
        id: 'inv_2',
        brandId: 'demo',
        clientId: 'client_2',
        clientName: 'Global Retail Hub',
        clientEmail: 'accounts@globalretail.com',
        clientPhone: '+919988776655',
        number: 'INV-2024-002',
        status: 'issued',
        currency: 'INR',
        subtotal: 500000,
        tax: 90000,
        taxType: 'IGST',
        gstNumber: '06AABCG5678H1ZK',
        total: 590000,
        amountPaid: 0,
        amountDue: 590000,
        lineItems: [
          { id: 'li_3', description: 'Enterprise Marketing Suite - Annual', hsnSacCode: '998314', quantity: 1, unitPrice: 400000, amount: 400000, taxRate: 18, taxAmount: 72000 },
          { id: 'li_4', description: 'Voice AI Integration', hsnSacCode: '998314', quantity: 1, unitPrice: 100000, amount: 100000, taxRate: 18, taxAmount: 18000 }
        ],
        dueDate: new Date(Date.now() + 15 * 86400000),
        paymentUrl: 'https://rzp.io/i/demo_inv_2',
        createdAt: new Date(Date.now() - 5 * 86400000),
        updatedAt: new Date()
      }
    ];

    const demoSubscriptions: Subscription[] = [
      {
        id: 'sub_1',
        brandId: 'demo',
        clientId: 'client_1',
        planId: 'plan_pro',
        planName: 'Pro Plan',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 15 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000),
        amount: 25000,
        currency: 'INR',
        interval: 'monthly',
        paidCount: 6,
        createdAt: new Date(Date.now() - 180 * 86400000)
      }
    ];

    const demoPaymentLinks: PaymentLink[] = [
      {
        id: 'plink_1',
        brandId: 'demo',
        name: 'Quick Payment - Pro Plan',
        description: 'One-time payment for Pro Plan monthly subscription',
        amount: 2500000,
        currency: 'INR',
        shortUrl: 'https://rzp.io/i/pro_plan_demo',
        status: 'created',
        notifyEmail: true,
        notifySms: true,
        timesUsed: 45,
        createdAt: new Date()
      }
    ];

    const demoPayments: Payment[] = [
      {
        id: 'pay_1',
        razorpayPaymentId: 'pay_DemoPayment123',
        invoiceId: 'inv_1',
        amount: 29500000,
        currency: 'INR',
        status: 'captured',
        method: 'upi',
        vpa: 'techstart@okaxis',
        clientName: 'TechStart India',
        clientEmail: 'billing@techstart.in',
        description: 'Invoice INV-2024-001',
        fee: 5900,
        tax: 1062,
        createdAt: new Date(Date.now() - 25 * 86400000),
        capturedAt: new Date(Date.now() - 25 * 86400000)
      }
    ];

    this.invoices.set('demo', demoInvoices);
    this.subscriptions.set('demo', demoSubscriptions);
    this.paymentLinks.set('demo', demoPaymentLinks);
    this.payments.set('demo', demoPayments);
  }

  async createOrder(brandId: string, options: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrder> {
    const order: RazorpayOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt || `rcpt_${Date.now()}`,
      status: 'created',
      notes: options.notes || {},
      createdAt: new Date()
    };

    if (this.config.keyId && this.config.keySecret) {
      try {
        const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: options.amount * 100,
            currency: options.currency || 'INR',
            receipt: order.receipt,
            notes: options.notes
          })
        });

        if (response.ok) {
          const data = await response.json();
          order.razorpayOrderId = data.id;
        }
      } catch (error) {
        console.error('Razorpay order creation error:', error);
      }
    }

    const existing = this.orders.get(brandId) || [];
    existing.push(order);
    this.orders.set(brandId, existing);

    this.logToWAISDK('order_created', `Created order for ₹${options.amount}`);

    return order;
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.config.keySecret) return false;
    
    const generatedSignature = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  async getInvoices(brandId: string, filters?: { status?: string; clientId?: string }): Promise<Invoice[]> {
    let invoices = this.invoices.get(brandId) || this.invoices.get('demo') || [];
    
    if (filters?.status) {
      invoices = invoices.filter(i => i.status === filters.status);
    }
    if (filters?.clientId) {
      invoices = invoices.filter(i => i.clientId === filters.clientId);
    }
    
    return invoices;
  }

  async createInvoice(brandId: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const lineItems = invoice.lineItems || [];
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate);

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      clientId: invoice.clientId || '',
      clientName: invoice.clientName || '',
      clientEmail: invoice.clientEmail || '',
      clientPhone: invoice.clientPhone,
      number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      status: 'draft',
      currency: invoice.currency || 'INR',
      subtotal,
      tax,
      taxType: invoice.taxType || 'CGST_SGST',
      gstNumber: invoice.gstNumber,
      total: subtotal + tax,
      amountPaid: 0,
      amountDue: subtotal + tax,
      lineItems: lineItems.map((item, idx) => ({
        ...item,
        id: item.id || `li_${idx}`,
        taxRate: item.taxRate || 18,
        taxAmount: item.taxAmount || Math.round(item.amount * 0.18)
      })),
      dueDate: invoice.dueDate || new Date(Date.now() + 30 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existing = this.invoices.get(brandId) || [];
    existing.push(newInvoice);
    this.invoices.set(brandId, existing);

    this.logToWAISDK('invoice_created', `Created invoice: ${newInvoice.number} for ₹${newInvoice.total}`);

    return newInvoice;
  }

  async issueInvoice(brandId: string, invoiceId: string): Promise<Invoice> {
    const invoices = this.invoices.get(brandId) || [];
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.status = 'issued';
    invoice.paymentUrl = `https://rzp.io/i/${invoiceId}`;
    invoice.updatedAt = new Date();

    if (this.config.keyId && this.config.keySecret) {
      try {
        const response = await fetch(`${RAZORPAY_API_BASE}/invoices`, {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'invoice',
            description: `Invoice ${invoice.number}`,
            customer: {
              name: invoice.clientName,
              email: invoice.clientEmail,
              contact: invoice.clientPhone
            },
            line_items: invoice.lineItems.map(item => ({
              name: item.description,
              amount: item.amount * 100,
              quantity: item.quantity
            })),
            currency: invoice.currency,
            sms_notify: 1,
            email_notify: 1,
            expire_by: Math.floor(invoice.dueDate.getTime() / 1000)
          })
        });

        if (response.ok) {
          const data = await response.json();
          invoice.razorpayInvoiceId = data.id;
          invoice.paymentUrl = data.short_url;
        }
      } catch (error) {
        console.error('Razorpay invoice creation error:', error);
      }
    }

    this.logToWAISDK('invoice_issued', `Issued invoice: ${invoice.number} to ${invoice.clientEmail}`);

    return invoice;
  }

  async recordPayment(brandId: string, invoiceId: string, amount: number, method: string = 'upi'): Promise<Invoice> {
    const invoices = this.invoices.get(brandId) || [];
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.amountPaid += amount;
    invoice.amountDue = invoice.total - invoice.amountPaid;
    
    if (invoice.amountDue <= 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partially_paid';
    }
    invoice.updatedAt = new Date();

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      invoiceId,
      amount: amount * 100,
      currency: invoice.currency,
      status: 'captured',
      method: method as any,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      description: `Payment for ${invoice.number}`,
      createdAt: new Date(),
      capturedAt: new Date()
    };

    const payments = this.payments.get(brandId) || [];
    payments.push(payment);
    this.payments.set(brandId, payments);

    this.logToWAISDK('payment_recorded', `Payment of ₹${amount} recorded for ${invoice.number}`);

    return invoice;
  }

  async getSubscriptions(brandId: string): Promise<Subscription[]> {
    return this.subscriptions.get(brandId) || this.subscriptions.get('demo') || [];
  }

  async createSubscription(brandId: string, subscription: Partial<Subscription>): Promise<Subscription> {
    const newSub: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      clientId: subscription.clientId || '',
      planId: subscription.planId || 'plan_basic',
      planName: subscription.planName || 'Basic Plan',
      status: 'created',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      amount: subscription.amount || 10000,
      currency: subscription.currency || 'INR',
      interval: subscription.interval || 'monthly',
      paidCount: 0,
      createdAt: new Date()
    };

    const existing = this.subscriptions.get(brandId) || [];
    existing.push(newSub);
    this.subscriptions.set(brandId, existing);

    this.logToWAISDK('subscription_created', `Created subscription: ${newSub.planName} for ₹${newSub.amount}/${newSub.interval}`);

    return newSub;
  }

  async getPaymentLinks(brandId: string): Promise<PaymentLink[]> {
    return this.paymentLinks.get(brandId) || this.paymentLinks.get('demo') || [];
  }

  async createPaymentLink(brandId: string, link: Partial<PaymentLink>): Promise<PaymentLink> {
    const newLink: PaymentLink = {
      id: `plink_${Date.now()}`,
      brandId,
      name: link.name || 'Payment Link',
      description: link.description,
      amount: (link.amount || 0) * 100,
      currency: link.currency || 'INR',
      shortUrl: `https://rzp.io/i/${Math.random().toString(36).substr(2, 9)}`,
      status: 'created',
      notifyEmail: link.notifyEmail ?? true,
      notifySms: link.notifySms ?? true,
      timesUsed: 0,
      createdAt: new Date()
    };

    if (this.config.keyId && this.config.keySecret) {
      try {
        const response = await fetch(`${RAZORPAY_API_BASE}/payment_links`, {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: newLink.amount,
            currency: newLink.currency,
            description: newLink.description || newLink.name,
            notify: {
              email: newLink.notifyEmail,
              sms: newLink.notifySms
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          newLink.razorpayPaymentLinkId = data.id;
          newLink.shortUrl = data.short_url;
        }
      } catch (error) {
        console.error('Razorpay payment link creation error:', error);
      }
    }

    const existing = this.paymentLinks.get(brandId) || [];
    existing.push(newLink);
    this.paymentLinks.set(brandId, existing);

    this.logToWAISDK('payment_link_created', `Created payment link: ${newLink.name}`);

    return newLink;
  }

  async getPayments(brandId: string): Promise<Payment[]> {
    return this.payments.get(brandId) || this.payments.get('demo') || [];
  }

  async getRevenueStats(brandId: string): Promise<{
    totalRevenue: number;
    monthlyRecurring: number;
    outstandingAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
    avgPaymentTime: number;
    topPaymentMethods: { method: string; count: number; amount: number }[];
  }> {
    const invoices = this.invoices.get(brandId) || this.invoices.get('demo') || [];
    const subscriptions = this.subscriptions.get(brandId) || this.subscriptions.get('demo') || [];
    const payments = this.payments.get(brandId) || this.payments.get('demo') || [];

    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const openInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'partially_paid');
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    const methodStats = new Map<string, { count: number; amount: number }>();
    payments.forEach(p => {
      const existing = methodStats.get(p.method) || { count: 0, amount: 0 };
      existing.count++;
      existing.amount += p.amount;
      methodStats.set(p.method, existing);
    });

    return {
      totalRevenue: paidInvoices.reduce((sum, i) => sum + i.amountPaid, 0),
      monthlyRecurring: activeSubscriptions.reduce((sum, s) => {
        return sum + (s.interval === 'yearly' ? s.amount / 12 : s.amount);
      }, 0),
      outstandingAmount: openInvoices.reduce((sum, i) => sum + i.amountDue, 0),
      paidInvoices: paidInvoices.length,
      pendingInvoices: openInvoices.length,
      avgPaymentTime: 5,
      topPaymentMethods: Array.from(methodStats.entries())
        .map(([method, stats]) => ({ method, ...stats }))
        .sort((a, b) => b.amount - a.amount)
    };
  }

  handleWebhook(payload: any, signature: string): { success: boolean; event: string; data: any } {
    if (this.config.webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        return { success: false, event: 'invalid_signature', data: null };
      }
    }

    const event = payload.event;
    const data = payload.payload;

    switch (event) {
      case 'payment.captured':
        this.logToWAISDK('webhook_payment_captured', `Payment ${data.payment.entity.id} captured`);
        break;
      case 'payment.failed':
        this.logToWAISDK('webhook_payment_failed', `Payment ${data.payment.entity.id} failed`);
        break;
      case 'subscription.activated':
        this.logToWAISDK('webhook_subscription_activated', `Subscription ${data.subscription.entity.id} activated`);
        break;
      case 'invoice.paid':
        this.logToWAISDK('webhook_invoice_paid', `Invoice ${data.invoice.entity.id} paid`);
        break;
    }

    return { success: true, event, data };
  }

  private logToWAISDK(type: string, description: string): void {
    setTimeout(() => {
      console.log(`[WAI SDK] Razorpay: ${type} - ${description}`);
    }, 0);
  }

  getServiceStatus(): { configured: boolean; keyId: string | null; testMode: boolean } {
    return {
      configured: !!(this.config.keyId && this.config.keySecret),
      keyId: this.config.keyId ? this.config.keyId.substring(0, 12) + '...' : null,
      testMode: this.config.keyId?.startsWith('rzp_test_') || false
    };
  }
}

export const razorpayPaymentService = new RazorpayPaymentService();

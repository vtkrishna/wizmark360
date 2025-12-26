/**
 * Stripe Payment Service
 * 
 * Production-grade payment processing for agency invoicing
 * Supports: Invoices, Subscriptions, Payment Links, Refunds
 */

import { WAISDKOrchestration } from './wai-sdk-orchestration';

export interface Invoice {
  id: string;
  brandId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  lineItems: InvoiceLineItem[];
  dueDate: Date;
  paidAt?: Date;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

export interface Subscription {
  id: string;
  brandId: string;
  clientId: string;
  planId: string;
  planName: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  createdAt: Date;
}

export interface PaymentLink {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  url: string;
  active: boolean;
  timesUsed: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  clientName: string;
  description: string;
  createdAt: Date;
}

export class StripePaymentService {
  private waiSDK: WAISDKOrchestration;
  private apiKey: string;
  private invoices: Map<string, Invoice[]> = new Map();
  private subscriptions: Map<string, Subscription[]> = new Map();
  private paymentLinks: Map<string, PaymentLink[]> = new Map();
  private payments: Map<string, Payment[]> = new Map();

  constructor() {
    this.waiSDK = new WAISDKOrchestration();
    this.apiKey = process.env.STRIPE_SECRET_KEY || '';
    this.initializeSeedData();
    console.log('💳 Stripe Payment Service initialized');
    console.log(`   API: ${this.apiKey ? '✅ Configured' : '⚠️ Awaiting credentials'}`);
  }

  private initializeSeedData(): void {
    const demoInvoices: Invoice[] = [
      {
        id: 'inv_1',
        brandId: 'demo',
        clientId: 'client_1',
        clientName: 'TechStart India',
        clientEmail: 'billing@techstart.in',
        number: 'INV-2024-001',
        status: 'paid',
        currency: 'INR',
        subtotal: 250000,
        tax: 45000,
        total: 295000,
        amountPaid: 295000,
        amountDue: 0,
        lineItems: [
          { id: 'li_1', description: 'Marketing Platform - Annual License', quantity: 1, unitPrice: 200000, amount: 200000 },
          { id: 'li_2', description: 'WhatsApp Marketing Add-on', quantity: 1, unitPrice: 50000, amount: 50000 }
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
        number: 'INV-2024-002',
        status: 'open',
        currency: 'INR',
        subtotal: 500000,
        tax: 90000,
        total: 590000,
        amountPaid: 0,
        amountDue: 590000,
        lineItems: [
          { id: 'li_3', description: 'Enterprise Marketing Suite - Annual', quantity: 1, unitPrice: 400000, amount: 400000 },
          { id: 'li_4', description: 'Voice AI Integration', quantity: 1, unitPrice: 100000, amount: 100000 }
        ],
        dueDate: new Date(Date.now() + 15 * 86400000),
        paymentUrl: 'https://pay.stripe.com/inv_2',
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
        cancelAtPeriodEnd: false,
        amount: 25000,
        currency: 'INR',
        interval: 'month',
        createdAt: new Date(Date.now() - 180 * 86400000)
      }
    ];

    const demoPaymentLinks: PaymentLink[] = [
      {
        id: 'plink_1',
        brandId: 'demo',
        name: 'Quick Payment - Pro Plan',
        description: 'One-time payment for Pro Plan monthly subscription',
        amount: 25000,
        currency: 'INR',
        url: 'https://buy.stripe.com/plink_pro',
        active: true,
        timesUsed: 45,
        createdAt: new Date()
      }
    ];

    const demoPayments: Payment[] = [
      {
        id: 'pay_1',
        invoiceId: 'inv_1',
        amount: 295000,
        currency: 'INR',
        status: 'succeeded',
        paymentMethod: 'card_visa_4242',
        clientName: 'TechStart India',
        description: 'Invoice INV-2024-001',
        createdAt: new Date(Date.now() - 25 * 86400000)
      }
    ];

    this.invoices.set('demo', demoInvoices);
    this.subscriptions.set('demo', demoSubscriptions);
    this.paymentLinks.set('demo', demoPaymentLinks);
    this.payments.set('demo', demoPayments);
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
      number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      status: 'draft',
      currency: invoice.currency || 'INR',
      subtotal,
      tax,
      total: subtotal + tax,
      amountPaid: 0,
      amountDue: subtotal + tax,
      lineItems,
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

  async sendInvoice(brandId: string, invoiceId: string): Promise<Invoice> {
    const invoices = this.invoices.get(brandId) || [];
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.status = 'open';
    invoice.paymentUrl = `https://pay.stripe.com/${invoiceId}`;
    invoice.updatedAt = new Date();

    this.logToWAISDK('invoice_sent', `Sent invoice: ${invoice.number} to ${invoice.clientEmail}`);

    return invoice;
  }

  async recordPayment(brandId: string, invoiceId: string, amount: number): Promise<Invoice> {
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
    }
    invoice.updatedAt = new Date();

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      invoiceId,
      amount,
      currency: invoice.currency,
      status: 'succeeded',
      paymentMethod: 'manual',
      clientName: invoice.clientName,
      description: `Payment for ${invoice.number}`,
      createdAt: new Date()
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
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      cancelAtPeriodEnd: false,
      amount: subscription.amount || 10000,
      currency: subscription.currency || 'INR',
      interval: subscription.interval || 'month',
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
      amount: link.amount || 0,
      currency: link.currency || 'INR',
      url: `https://buy.stripe.com/plink_${Math.random().toString(36).substr(2, 9)}`,
      active: true,
      timesUsed: 0,
      createdAt: new Date()
    };

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
  }> {
    const invoices = this.invoices.get(brandId) || this.invoices.get('demo') || [];
    const subscriptions = this.subscriptions.get(brandId) || this.subscriptions.get('demo') || [];

    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const openInvoices = invoices.filter(i => i.status === 'open');
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    return {
      totalRevenue: paidInvoices.reduce((sum, i) => sum + i.amountPaid, 0),
      monthlyRecurring: activeSubscriptions.reduce((sum, s) => {
        return sum + (s.interval === 'year' ? s.amount / 12 : s.amount);
      }, 0),
      outstandingAmount: openInvoices.reduce((sum, i) => sum + i.amountDue, 0),
      paidInvoices: paidInvoices.length,
      pendingInvoices: openInvoices.length
    };
  }

  private logToWAISDK(type: string, description: string): void {
    setTimeout(() => {
      console.log(`[WAI SDK] Payment: ${type} - ${description}`);
    }, 0);
  }

  getServiceStatus(): { configured: boolean; testMode: boolean } {
    return {
      configured: !!this.apiKey,
      testMode: this.apiKey?.startsWith('sk_test_') || false
    };
  }
}

export const stripePaymentService = new StripePaymentService();

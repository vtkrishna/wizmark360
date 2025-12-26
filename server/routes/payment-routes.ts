import { Router, Request, Response } from 'express';
import { stripePaymentService } from '../services/stripe-payment-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.get('/status', (_req: Request, res: Response) => {
  const status = stripePaymentService.getServiceStatus();
  res.json({
    success: true,
    data: status,
    message: status.configured ? 'Stripe is configured' : 'Stripe awaiting credentials'
  });
});

router.get('/invoices/:brandId', async (req: Request, res: Response) => {
  const { status, clientId } = req.query;
  try {
    const invoices = await stripePaymentService.getInvoices(req.params.brandId, {
      status: status as string,
      clientId: clientId as string
    });
    res.json({ success: true, data: invoices, count: invoices.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.post('/invoices/:brandId', async (req: Request, res: Response) => {
  try {
    const invoice = await stripePaymentService.createInvoice(req.params.brandId, req.body);
    res.json({ success: true, data: invoice, message: 'Invoice created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.post('/invoices/:brandId/:invoiceId/send', async (req: Request, res: Response) => {
  try {
    const invoice = await stripePaymentService.sendInvoice(
      req.params.brandId,
      req.params.invoiceId
    );
    res.json({ success: true, data: invoice, message: 'Invoice sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

router.post('/invoices/:brandId/:invoiceId/payment', async (req: Request, res: Response) => {
  const { amount } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }
  try {
    const invoice = await stripePaymentService.recordPayment(
      req.params.brandId,
      req.params.invoiceId,
      amount
    );
    res.json({ success: true, data: invoice, message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

router.get('/subscriptions/:brandId', async (req: Request, res: Response) => {
  try {
    const subscriptions = await stripePaymentService.getSubscriptions(req.params.brandId);
    res.json({ success: true, data: subscriptions, count: subscriptions.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.post('/subscriptions/:brandId', async (req: Request, res: Response) => {
  try {
    const subscription = await stripePaymentService.createSubscription(req.params.brandId, req.body);
    res.json({ success: true, data: subscription, message: 'Subscription created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.get('/payment-links/:brandId', async (req: Request, res: Response) => {
  try {
    const links = await stripePaymentService.getPaymentLinks(req.params.brandId);
    res.json({ success: true, data: links, count: links.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment links' });
  }
});

router.post('/payment-links/:brandId', async (req: Request, res: Response) => {
  try {
    const link = await stripePaymentService.createPaymentLink(req.params.brandId, req.body);
    res.json({ success: true, data: link, message: 'Payment link created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

router.get('/payments/:brandId', async (req: Request, res: Response) => {
  try {
    const payments = await stripePaymentService.getPayments(req.params.brandId);
    res.json({ success: true, data: payments, count: payments.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.get('/revenue/:brandId', async (req: Request, res: Response) => {
  try {
    const stats = await stripePaymentService.getRevenueStats(req.params.brandId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue stats' });
  }
});

export default router;

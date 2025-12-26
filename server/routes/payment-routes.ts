import { Router, Request, Response } from 'express';
import { razorpayPaymentService } from '../services/razorpay-payment-service';
import { requireBrandAccess } from '../middleware/auth-middleware';

const router = Router();

router.use(requireBrandAccess);

router.get('/status', (_req: Request, res: Response) => {
  const status = razorpayPaymentService.getServiceStatus();
  res.json({
    success: true,
    data: status,
    provider: 'razorpay',
    message: status.configured ? 'Razorpay is configured' : 'Razorpay awaiting credentials'
  });
});

router.post('/orders/:brandId', async (req: Request, res: Response) => {
  const { amount, currency, receipt, notes } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }
  try {
    const order = await razorpayPaymentService.createOrder(req.params.brandId, {
      amount,
      currency,
      receipt,
      notes
    });
    res.json({ success: true, data: order, message: 'Order created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/verify', (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }
  
  const isValid = razorpayPaymentService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  
  if (isValid) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid payment signature' });
  }
});

router.get('/invoices/:brandId', async (req: Request, res: Response) => {
  const { status, clientId } = req.query;
  try {
    const invoices = await razorpayPaymentService.getInvoices(req.params.brandId, {
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
    const invoice = await razorpayPaymentService.createInvoice(req.params.brandId, req.body);
    res.json({ success: true, data: invoice, message: 'Invoice created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.post('/invoices/:brandId/:invoiceId/issue', async (req: Request, res: Response) => {
  try {
    const invoice = await razorpayPaymentService.issueInvoice(
      req.params.brandId,
      req.params.invoiceId
    );
    res.json({ success: true, data: invoice, message: 'Invoice issued' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue invoice' });
  }
});

router.post('/invoices/:brandId/:invoiceId/payment', async (req: Request, res: Response) => {
  const { amount, method } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }
  try {
    const invoice = await razorpayPaymentService.recordPayment(
      req.params.brandId,
      req.params.invoiceId,
      amount,
      method
    );
    res.json({ success: true, data: invoice, message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

router.get('/subscriptions/:brandId', async (req: Request, res: Response) => {
  try {
    const subscriptions = await razorpayPaymentService.getSubscriptions(req.params.brandId);
    res.json({ success: true, data: subscriptions, count: subscriptions.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.post('/subscriptions/:brandId', async (req: Request, res: Response) => {
  try {
    const subscription = await razorpayPaymentService.createSubscription(req.params.brandId, req.body);
    res.json({ success: true, data: subscription, message: 'Subscription created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.get('/payment-links/:brandId', async (req: Request, res: Response) => {
  try {
    const links = await razorpayPaymentService.getPaymentLinks(req.params.brandId);
    res.json({ success: true, data: links, count: links.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment links' });
  }
});

router.post('/payment-links/:brandId', async (req: Request, res: Response) => {
  try {
    const link = await razorpayPaymentService.createPaymentLink(req.params.brandId, req.body);
    res.json({ success: true, data: link, message: 'Payment link created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

router.get('/payments/:brandId', async (req: Request, res: Response) => {
  try {
    const payments = await razorpayPaymentService.getPayments(req.params.brandId);
    res.json({ success: true, data: payments, count: payments.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.get('/revenue/:brandId', async (req: Request, res: Response) => {
  try {
    const stats = await razorpayPaymentService.getRevenueStats(req.params.brandId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue stats' });
  }
});

router.post('/webhook', (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  
  try {
    const result = razorpayPaymentService.handleWebhook(req.body, signature);
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ success: true });
  }
});

export default router;

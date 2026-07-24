import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.WHATSAPP_BOT_PORT || 5001;

// Meta WhatsApp Webhook Verification
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'smartgovai_token')) {
    console.log('[WHATSAPP BOT] Webhook verified successfully.');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Meta WhatsApp Message Receiver Webhook
app.post('/webhook', (req: Request, res: Response) => {
  const body = req.body;

  if (body.object) {
    console.log('[WHATSAPP BOT] Incoming webhook payload received:', JSON.stringify(body, null, 2));
    return res.status(200).json({ status: 'EVENT_RECEIVED' });
  }

  return res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`💬 [SmartGovAI WhatsApp Bot Webhook] running on port ${PORT}.`);
});

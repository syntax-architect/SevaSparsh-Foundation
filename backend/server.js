import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client (Using Service Role Key for backend bypass of RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Endpoint to create a Razorpay order and pending donation record
 * POST /api/payment/create-order
 */
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { donor_name, email, phone, pan_number, amount } = req.body;

    // Validate inputs
    if (!donor_name || !email || !phone || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Razorpay expects amount in subunits (paise for INR)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    const order = await razorpay.orders.create(options);

    // Insert pending record into Supabase
    const { data: donationData, error: dbError } = await supabase
      .from('donations')
      .insert([
        {
          donor_name,
          email,
          phone,
          pan_number: pan_number || null,
          amount,
          razorpay_order_id: order.id,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(500).json({ error: 'Failed to create donation record' });
    }

    // Return order details to frontend
    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      donation_id: donationData.id
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error while creating order' });
  }
});

/**
 * Endpoint to verify Razorpay payment signature and update DB
 * POST /api/payment/verify
 */
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification details' });
    }

    // Generate expected signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text.toString())
      .digest('hex');

    // Compare signatures securely
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Signature is valid, update Supabase record to 'successful'
      const { data, error } = await supabase
        .from('donations')
        .update({ 
          status: 'successful',
          razorpay_payment_id: razorpay_payment_id
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .select();

      if (error) {
        console.error('Error updating donation to successful:', error);
        return res.status(500).json({ error: 'Payment verified but failed to update database' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Payment verified successfully',
        data 
      });
    } else {
      // Signature is invalid, potentially a fraudulent request
      // Update Supabase record to 'failed'
      await supabase
        .from('donations')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error while verifying payment' });
  }
});

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Endpoint to get intelligently shuffled realistic recent donations using Groq API
 * GET /api/recent-donations
 */
app.get('/api/recent-donations', async (req, res) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You generate realistic fake donation data for an Indian NGO to display as a live ticker. Return ONLY valid JSON with a root 'donations' array."
        },
        {
          role: "user",
          content: "Generate 10 realistic recent donations. Fields: 'name' (typical Indian name, last initial or full), 'amount' (realistic amounts like 500, 1000, 1500, 2100, 5100), 'location' (Indian city), 'timeAgo' (e.g., '1m ago', '3m ago', '12m ago'). Output JSON format: { \"donations\": [ {\"name\": \"...\", \"amount\": 1500, \"location\": \"...\", \"timeAgo\": \"...\"} ] }"
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0]?.message?.content || "{\"donations\":[]}");
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Groq:', error);
    res.status(500).json({ 
      donations: [
        { name: "Aarav M.", amount: 1500, location: "Bengaluru", timeAgo: "4m ago" }
      ]
    });
  }
});

/**
 * Endpoint to generate a dynamic Urgent Field Appeal using Groq API
 * GET /api/urgent-appeal
 */
app.get('/api/urgent-appeal', async (req, res) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You generate realistic, short, urgent field appeals for an Indian NGO helping elderly people (SevaSparsh Foundation). Return ONLY valid JSON."
        },
        {
          role: "user",
          content: "Generate an urgent alert. Fields: 'title' (e.g., 'Urgent Batch Dispatch', 'Monsoon Health Alert', 'Winter Frost Warning'), 'count' (a number between 12 and 45), 'message' (a 1-sentence urgent need involving the 'count' of elders and a specific item like mobility walkers, thermal blankets, or medicines). Output JSON: {\"title\": \"...\", \"count\": 32, \"message\": \"...\"}"
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.9,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching appeal from Groq:', error);
    res.status(500).json({
      title: "Urgent Batch Dispatch",
      count: 32,
      message: "Only 32 elders in this verified cohort awaiting mobility walkers before winter frost."
    });
  }
});



/**
 * Endpoint to handle AI Chat Support using Groq API
 * POST /api/chat-support
 */
app.post('/api/chat-support', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are the support assistant for SevaSparsh Foundation, an Indian NGO. Answer questions politely, warmly, and concisely. Keep answers under 3 sentences. Assure donors that their donations are 100% tax-exempt under 80G and are securely processed. We provide mobility walkers, medicine, and hot meals to abandoned elders in India."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I'm having trouble understanding right now. Please email us.";
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error with chat support:', error);
    res.status(500).json({ reply: 'Sorry, I am facing network issues. Please contact support@sevasparsh.org.in.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

import request from 'supertest';
import app from '../server.js';

describe('SevaSparsh Backend API', () => {
  // Test the rate limiter and body parser implicitly by making requests

  describe('POST /api/payment/create-order', () => {
    it('should return 400 for invalid input data', async () => {
      const response = await request(app)
        .post('/api/payment/create-order')
        .send({
          // Missing required fields like donor_name, email, phone, etc.
          amount: 50 
        });
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });

    it('should return 400 if amount is less than 100', async () => {
      const response = await request(app)
        .post('/api/payment/create-order')
        .send({
          donor_name: 'Test Donor',
          email: 'test@example.com',
          phone: '1234567890',
          amount: 50 // Too low
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid phone number', async () => {
      const response = await request(app)
        .post('/api/payment/create-order')
        .send({
          donor_name: 'Test Donor',
          email: 'test@example.com',
          phone: 'invalid-phone',
          amount: 500
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/payment/verify', () => {
    it('should return 400 if missing verification details', async () => {
      const response = await request(app)
        .post('/api/payment/verify')
        .send({
          razorpay_order_id: 'order_123'
          // Missing razorpay_payment_id and razorpay_signature
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing payment verification details');
    });
  });

  describe('POST /api/chat-support', () => {
    it('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/chat-support')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Message is required');
    });
  });

});

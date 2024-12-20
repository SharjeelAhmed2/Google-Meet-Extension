const express = require('express');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');

const app = express();

// Middleware
 // More specific CORS configuration
 app.use(cors({
    origin: '*', // During development. For production, specify your extension's origin
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
  }));
  
app.use(express.json());

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
 
// SMS sending endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    // Validate input
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }

    // Send SMS using Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER // Your Twilio phone number
    });

    res.json({ 
      success: true, 
      messageId: twilioMessage.sid 
    });

  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
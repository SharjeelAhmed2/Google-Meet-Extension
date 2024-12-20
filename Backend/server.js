require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sendSMS = async (body) => {
    const msgOptions = {
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
        to: process.env.TO_NUMBER,            // Recipient's number
        body: body                            // SMS body text
    };
    try {
        const message = await client.messages.create(msgOptions);
        console.log("Message sent:", message.sid);
    } catch (error) {
        console.error("Failed to send message:", error);
    }
};

sendSMS("Hello World, Sharjeel!");

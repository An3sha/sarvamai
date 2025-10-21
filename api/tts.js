const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sarvam API configuration
const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// Helper function to make Sarvam API calls
async function callSarvamAPI(endpoint, body, method = 'POST') {
  const url = `${SARVAM_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Sarvam API call failed:', error);
    throw error;
  }
}

// Text-to-Speech endpoint
app.post('/', async (req, res) => {
  try {
    console.log('🔊 TTS request received');
    const result = await callSarvamAPI('/text-to-speech', req.body);
    res.json(result);
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;

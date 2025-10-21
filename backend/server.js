const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Sarvam API configuration
const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

if (!SARVAM_API_KEY) {
  console.error('❌ SARVAM_API_KEY environment variable is required');
  process.exit(1);
}

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

// Chat completions endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('📝 Chat request received');
    const result = await callSarvamAPI('/v1/chat/completions', req.body);
    res.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    console.log('🔊 TTS request received');
    const result = await callSarvamAPI('/text-to-speech', req.body);
    res.json(result);
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Speech-to-Text endpoint
app.post('/api/stt', async (req, res) => {
  try {
    console.log('🎤 STT request received');
    const result = await callSarvamAPI('/speech-to-text', req.body);
    res.json(result);
  } catch (error) {
    console.error('STT API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    console.log('🌐 Translation request received');
    const result = await callSarvamAPI('/translate', req.body);
    res.json(result);
  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Language identification endpoint
app.post('/api/language-id', async (req, res) => {
  try {
    console.log('🔍 Language ID request received');
    const result = await callSarvamAPI('/language-identification', req.body);
    res.json(result);
  } catch (error) {
    console.error('Language ID API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasApiKey: !!SARVAM_API_KEY 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔑 API key configured: ${SARVAM_API_KEY ? 'Yes' : 'No'}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   POST /api/chat - Chat completions`);
  console.log(`   POST /api/tts - Text-to-Speech`);
  console.log(`   POST /api/stt - Speech-to-Text`);
  console.log(`   POST /api/translate - Translation`);
  console.log(`   POST /api/language-id - Language identification`);
  console.log(`   GET /api/health - Health check`);
});

module.exports = app;

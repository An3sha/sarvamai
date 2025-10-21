const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint - redirect to health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Sarvam AI Backend Proxy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health - Health check',
      'POST /api/chat - Chat completions',
      'POST /api/tts - Text-to-Speech',
      'POST /api/stt - Speech-to-Text',
      'POST /api/translate - Translation',
      'POST /api/language-id - Language identification'
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.SARVAM_API_KEY 
  });
});

module.exports = app;

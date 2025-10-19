# 🚀 Sarvam AI API Integration Guide

## 📋 **APIs You Should Use**

Based on the [Sarvam AI documentation](https://docs.sarvam.ai/api-reference-docs/getting-started/quickstart), here are the specific APIs integrated into the widget:

### 1. **Chat Completions API** 
**Endpoint**: `https://api.sarvam.ai/chat/completions`
- **Purpose**: Generate conversational AI responses
- **Model**: `llama-3.1-8b-instruct`
- **Features**: Multi-language support, context-aware responses
- **Usage**: Core chat functionality

### 2. **Text-to-Speech (TTS) API**
**Endpoint**: `https://api.sarvam.ai/text-to-speech`
- **Purpose**: Convert text responses to natural speech
- **Features**: Multiple voice options, adjustable speed/pitch/volume
- **Usage**: Voice output in the widget

### 3. **Speech-to-Text (STT) API**
**Endpoint**: `https://api.sarvam.ai/speech-to-text`
- **Purpose**: Transcribe user speech to text
- **Features**: Real-time processing, multiple Indian languages
- **Usage**: Voice input in the widget

### 4. **Translation API**
**Endpoint**: `https://api.sarvam.ai/translate`
- **Purpose**: Translate text between languages
- **Features**: Auto-detect source language, support for multiple target languages
- **Usage**: Cross-language communication

### 5. **Language Identification API**
**Endpoint**: `https://api.sarvam.ai/language-identification`
- **Purpose**: Detect the language of input text
- **Features**: Automatic language detection
- **Usage**: Dynamic language switching

## 🔑 **API Key Setup**

1. **Get your API key** from the [Sarvam AI dashboard](https://console.sarvam.ai)
2. **Configure the widget** with your API key:

```javascript
window.AgentWidgetConfig = {
  sarvamApiKey: 'your-api-key-here',
  // ... other config
};
```

## 📝 **API Request Examples**

### Chat Completions
```javascript
const response = await fetch('https://api.sarvam.ai/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instruct',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 1000,
    temperature: 0.7,
    language: 'en'
  })
});
```

### Text-to-Speech
```javascript
const response = await fetch('https://api.sarvam.ai/text-to-speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    text: 'Hello, this is a test message',
    language_code: 'en',
    voice: 'default',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  })
});
```

### Speech-to-Text
```javascript
const formData = new FormData();
formData.append('file', audioBlob);
formData.append('language_code', 'en');

const response = await fetch('https://api.sarvam.ai/speech-to-text', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: formData
});
```

### Translation
```javascript
const response = await fetch('https://api.sarvam.ai/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    input: 'Hello, how are you?',
    source_language_code: 'en',
    target_language_code: 'hi'
  })
});
```

### Language Identification
```javascript
const response = await fetch('https://api.sarvam.ai/language-identification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    input: 'नमस्ते, आप कैसे हैं?'
  })
});
```

## 🌍 **Supported Languages**

The widget supports these languages with Sarvam AI:

| Language Code | Language | Native Name |
|---------------|----------|-------------|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `ta` | Tamil | தமிழ் |
| `te` | Telugu | తెలుగు |
| `bn` | Bengali | বাংলা |
| `gu` | Gujarati | ગુજરાતી |
| `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം |
| `mr` | Marathi | मराठी |
| `pa` | Punjabi | ਪੰਜਾਬੀ |
| `or` | Odia | ଓଡ଼ିଆ |
| `as` | Assamese | অসমীয়া |

## 🔧 **Widget Configuration**

### Basic Configuration
```javascript
window.AgentWidgetConfig = {
  sarvamApiKey: 'your-api-key-here',
  position: 'bottom-right',
  enableVoice: true,
  languages: ['en', 'hi', 'ta'], // Supported languages
  context: 'You are a helpful AI assistant.'
};
```

### Advanced Configuration
```javascript
window.AgentWidgetConfig = {
  sarvamApiKey: 'your-api-key-here',
  position: 'bottom-right',
  theme: {
    primaryColor: '#4F46E5',
    background: '#ffffff',
    text: '#111827'
  },
  agent: {
    name: 'SarvamBot',
    avatar: 'https://example.com/avatar.png',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?'
  },
  enableVoice: true,
  languages: ['en', 'hi', 'ta', 'te', 'bn'],
  context: 'You are a multilingual AI assistant specializing in Indian languages.',
  autoOpen: false,
  showWelcomeMessage: true
};
```

## 🚀 **Getting Started**

1. **Sign up** at [Sarvam AI Console](https://console.sarvam.ai)
2. **Get your API key** from the dashboard
3. **Build the widget**:
   ```bash
   npm run build:widget
   ```
4. **Include in your website**:
   ```html
   <script src="./dist/sarvam-agent-widget.umd.js"></script>
   <script>
     window.AgentWidgetConfig = {
       sarvamApiKey: 'your-api-key-here',
       // ... configuration
     };
   </script>
   ```

## 🔄 **Fallback Behavior**

The widget includes intelligent fallbacks:
- **No API Key**: Uses mock responses for development
- **API Errors**: Falls back to browser Speech APIs
- **Network Issues**: Graceful error handling with user feedback

## 📚 **Additional Resources**

- [Sarvam AI Documentation](https://docs.sarvam.ai)
- [API Reference](https://docs.sarvam.ai/api-reference-docs)
- [Getting Started Guide](https://docs.sarvam.ai/api-reference-docs/getting-started/quickstart)
- [Model Information](https://docs.sarvam.ai/api-reference-docs/getting-started/models)
- [Cookbook Examples](https://docs.sarvam.ai/api-reference-docs/cookbook)

## 🆘 **Support**

- **Documentation**: [docs.sarvam.ai](https://docs.sarvam.ai)
- **Console**: [console.sarvam.ai](https://console.sarvam.ai)
- **Issues**: Create an issue in this repository

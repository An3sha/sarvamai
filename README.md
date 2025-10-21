# 🤖 Sarvam AI Agent Widget

A secure, embeddable chat and voice agent widget that can be integrated into any website with a single script tag. Built with React, TypeScript, and Sarvam AI APIs.

## ✨ Features

- **🌍 Multi-language Support**: 22+ Indian languages with automatic translation
- **🎤 Voice Capabilities**: Speech-to-text and text-to-speech with Sarvam APIs
- **🎨 Customizable**: Colors, position, avatar, font, and more
- **📱 Mobile Responsive**: Works perfectly on all devices
- **🔒 Secure**: API keys protected via backend proxy
- **⚡ Fast**: Optimized bundle with fallback support
- **🔧 Easy Integration**: Single script tag installation

## 🚀 Quick Start

### 1. Setup Backend (Required for Security)

```bash
# Setup backend proxy
cd backend
npm install
# Add your API key to .env file
npm start
```

### 2. Include the Widget

```html
<!-- Include React and ReactDOM -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

<!-- Include the Sarvam Agent Widget -->
<script src="https://your-cdn.com/sarvam-agent-widget.umd.js"></script>
```

### 3. Configure the Widget

```html
<script>
  window.AgentWidgetConfig = {
    position: 'bottom-right',
    theme: {
      primaryColor: '#4F46E5',
      background: '#ffffff',
      text: '#111827'
    },
    agent: {
      name: 'HelperBot',
      avatar: 'https://example.com/avatar.png',
      greeting: 'Hello! How can I help you today?'
    },
    enableVoice: true,
    languages: ['en', 'hi', 'ta', 'te', 'bn'],
    context: 'You are a helpful AI assistant for our website.'
  };
</script>
```

## 📖 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `string` | `'bottom-right'` | Widget position |
| `enableVoice` | `boolean` | `true` | Enable voice features |
| `languages` | `string[]` | `['en', 'hi', 'ta']` | Supported languages |
| `context` | `string` | `'You are a helpful AI assistant...'` | AI context/personality |
| `autoOpen` | `boolean` | `false` | Auto-open on page load |

### Theme Configuration

```javascript
theme: {
  primaryColor: '#4F46E5',    // Primary brand color
  background: '#ffffff',      // Background color
  text: '#111827',           // Text color
  font: 'Inter, system-ui',  // Font family
  borderRadius: '16px',      // Border radius
  shadow: '0 8px 32px rgba(0, 0, 0, 0.12)' // Box shadow
}
```

## 🌍 Language Support

Supports 22+ Indian languages including English, Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, and more.

## 🛠️ Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build widget
npm run build
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build the widget
- `npm run serve` - Serve built files

## 🔒 Security Architecture

- **Backend Proxy**: API keys stored securely on server
- **No Frontend Exposure**: No API keys in client-side code
- **Shadow DOM**: Isolated from host page styles
- **CORS Protection**: All requests go through backend

## 🐛 Troubleshooting

### Widget Not Appearing
1. Ensure React and ReactDOM are loaded first
2. Check browser console for errors
3. Verify backend is running on port 3001

### Voice Not Working
1. Ensure microphone permissions are granted
2. Use HTTPS (required for voice features)
3. Check backend proxy is running

## 📄 License

MIT License - see LICENSE file for details.
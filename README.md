# 🤖 Sarvam AI Agent Widget

A powerful, embeddable chat and voice agent widget that can be integrated into any website with a single script tag. Built with React, TypeScript, and Sarvam AI APIs.

## ✨ Features

- **🌍 Multi-language Support**: English, Hindi, Spanish, French, German, Japanese, Korean, Chinese, Arabic, Portuguese, Russian, and Italian
- **🎤 Voice Capabilities**: Speech-to-text and text-to-speech with browser APIs and Sarvam TTS/STT
- **🎨 Customizable**: Colors, position, avatar, font, and more
- **📱 Mobile Responsive**: Works perfectly on all devices
- **🔒 Isolated**: Uses Shadow DOM to prevent CSS conflicts
- **⚡ Fast**: Optimized bundle with fallback support
- **🔧 Easy Integration**: Single script tag installation

## 🚀 Quick Start

### 1. Include the Widget

```html
<!-- Include React and ReactDOM -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Include the Sarvam Agent Widget -->
<script src="https://your-cdn.com/sarvam-agent-widget.umd.js"></script>
```

### 2. Configure the Widget

```html
<script>
  window.AgentWidgetConfig = {
    sarvamApiKey: 'your-api-key-here',
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
    languages: ['en', 'hi', 'es'],
    context: 'You are a helpful AI assistant for our website.'
  };
</script>
```

That's it! The widget will automatically appear on your website.

## 📖 Configuration Options

### Required Configuration

| Option | Type | Description |
|--------|------|-------------|
| `sarvamApiKey` | `string` | Your Sarvam AI API key |

### Optional Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `string` | `'bottom-right'` | Widget position: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'` |
| `enableVoice` | `boolean` | `true` | Enable voice input/output features |
| `autoOpen` | `boolean` | `false` | Automatically open widget on page load |
| `showWelcomeMessage` | `boolean` | `true` | Show welcome message when chat is empty |
| `maxMessages` | `number` | `50` | Maximum number of messages to keep in memory |
| `languages` | `string[]` | `['en', 'hi', 'es']` | Supported languages |
| `context` | `string` | `'You are a helpful AI assistant...'` | AI context/personality |
| `placeholder` | `string` | `'Type your message...'` | Input placeholder text |

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

### Agent Configuration

```javascript
agent: {
  name: 'HelperBot',                    // Agent name
  avatar: 'https://example.com/avatar.png', // Agent avatar URL
  greeting: 'Hello! How can I help you today?' // Welcome message
}
```

## 🌍 Language Support

The widget supports 12 languages with native display names and flags:

| Code | Language | Native Name | Flag |
|------|----------|-------------|------|
| `en` | English | English | 🇺🇸 |
| `hi` | Hindi | हिन्दी | 🇮🇳 |
| `es` | Spanish | Español | 🇪🇸 |
| `fr` | French | Français | 🇫🇷 |
| `de` | German | Deutsch | 🇩🇪 |
| `ja` | Japanese | 日本語 | 🇯🇵 |
| `ko` | Korean | 한국어 | 🇰🇷 |
| `zh` | Chinese | 中文 | 🇨🇳 |
| `ar` | Arabic | العربية | 🇸🇦 |
| `pt` | Portuguese | Português | 🇵🇹 |
| `ru` | Russian | Русский | 🇷🇺 |
| `it` | Italian | Italiano | 🇮🇹 |

## 🎤 Voice Features

### Speech-to-Text
- Uses browser Web Speech API as primary method
- Falls back to Sarvam STT API when available
- Supports all configured languages
- Real-time transcription with interim results

### Text-to-Speech
- Uses browser Speech Synthesis API as primary method
- Falls back to Sarvam TTS API when available
- Language-specific voice selection
- Automatic voice response in voice mode

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd sarvamai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build
```bash
# Build the widget for production
npm run build:widget

# Build demo version
npm run build:demo
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build the main app
- `npm run build:widget` - Build the widget library
- `npm run build:demo` - Build demo version
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run serve` - Serve built files

## 📁 Project Structure

```
src/
├── widget/                 # Widget components
│   ├── index.tsx          # Widget entry point
│   ├── WidgetApp.tsx      # Main widget component
│   ├── ChatPanel.tsx      # Chat interface
│   ├── VoiceControls.tsx  # Voice input controls
│   ├── api.ts             # API integration
│   ├── voice.ts           # Voice utilities
│   └── settings.ts        # Configuration
├── App.tsx                # Main app (for development)
└── main.tsx               # App entry point
```

## 🔧 API Integration

### Sarvam AI APIs

The widget integrates with Sarvam AI's APIs:

- **Chat Completion**: `https://api.sarvam.ai/chat/completions`
- **Text-to-Speech**: `https://api.sarvam.ai/text-to-speech`
- **Speech-to-Text**: `https://api.sarvam.ai/speech-to-text`

### Fallback Support

When Sarvam APIs are not available or configured, the widget falls back to:
- Mock responses for chat completion
- Browser Speech Synthesis API for TTS
- Browser Web Speech API for STT

## 🎨 Customization Examples

### E-commerce Theme
```javascript
window.AgentWidgetConfig = {
  sarvamApiKey: 'your-key',
  theme: {
    primaryColor: '#10b981',
    background: '#f8fafc',
    text: '#1e293b'
  },
  agent: {
    name: 'Shopping Assistant',
    greeting: 'Hi! I can help you find products and answer questions about your order.'
  },
  context: 'You are a helpful shopping assistant for an e-commerce website.'
};
```

### Support Theme
```javascript
window.AgentWidgetConfig = {
  sarvamApiKey: 'your-key',
  theme: {
    primaryColor: '#3b82f6',
    background: '#ffffff',
    text: '#111827'
  },
  agent: {
    name: 'Support Bot',
    greeting: 'Hello! I\'m here to help with any questions or issues you might have.'
  },
  context: 'You are a customer support assistant. Help users with their questions and direct them to appropriate resources.'
};
```

## 📱 Mobile Support

The widget is fully responsive and includes:
- Touch-friendly interface
- Mobile-optimized voice controls
- Responsive design that adapts to screen size
- Gesture support for easy interaction

## 🔒 Security & Privacy

- All API calls are made directly from the user's browser
- No data is stored or transmitted through third-party servers
- Shadow DOM isolation prevents CSS conflicts
- Configurable message limits to manage memory usage

## 🐛 Troubleshooting

### Widget Not Appearing
1. Check that React and ReactDOM are loaded before the widget script
2. Verify the configuration object is set before the widget loads
3. Check browser console for errors

### Voice Not Working
1. Ensure microphone permissions are granted
2. Use HTTPS (required for voice features)
3. Check browser compatibility (Chrome, Safari, Edge recommended)

### API Errors
1. Verify your Sarvam API key is correct
2. Check API quota and limits
3. The widget will fall back to mock responses if APIs are unavailable

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the example.html file for usage examples
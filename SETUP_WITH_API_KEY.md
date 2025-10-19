# 🔑 Setup with Your Sarvam API Key

## ✅ **Quick Setup Steps**

### 1. **Add Your API Key**
Replace `YOUR_SARVAM_API_KEY_HERE` in `src/App.tsx` with your actual API key:

```javascript
// In src/App.tsx, line 12
sarvamApiKey: 'your-actual-api-key-here',
```

### 2. **Run the Development Server**
```bash
npm run dev
```

### 3. **Test the Widget**
- Open `http://localhost:5173` in your browser
- Look for the widget button in the bottom-right corner
- Click it to open the chat interface
- Try both text and voice modes!

## 🎯 **What You'll Get**

With your Sarvam API key configured, the widget will now use:

- ✅ **Real Sarvam AI Chat Completions** (instead of mock responses)
- ✅ **Sarvam Text-to-Speech** for voice output
- ✅ **Sarvam Speech-to-Text** for voice input
- ✅ **5 Indian Languages**: English, Hindi, Tamil, Telugu, Bengali
- ✅ **Translation Support** between languages
- ✅ **Language Detection** for automatic switching

## 🌍 **Supported Languages**

| Language | Code | Native Name |
|----------|------|-------------|
| English | `en` | English |
| Hindi | `hi` | हिन्दी |
| Tamil | `ta` | தமிழ் |
| Telugu | `te` | తెలుగు |
| Bengali | `bn` | বাংলা |

## 🔧 **API Configuration**

The widget is now configured to use the correct Sarvam AI endpoints:

- **Chat**: `https://api.sarvam.ai/chat/completions`
- **TTS**: `https://api.sarvam.ai/text-to-speech`
- **STT**: `https://api.sarvam.ai/speech-to-text`
- **Translation**: `https://api.sarvam.ai/translate`
- **Language ID**: `https://api.sarvam.ai/language-identification`

## 🚀 **Production Deployment**

When you're ready to deploy:

1. **Build the widget**:
   ```bash
   npm run build:widget
   ```

2. **Use in your website**:
   ```html
   <script src="./dist/sarvam-agent-widget.umd.js"></script>
   <script>
     window.AgentWidgetConfig = {
       sarvamApiKey: 'your-api-key-here',
       languages: ['en', 'hi', 'ta', 'te', 'bn'],
       enableVoice: true
     };
   </script>
   ```

## 🆘 **Troubleshooting**

- **API Key Issues**: Make sure your key is valid and has sufficient credits
- **Voice Not Working**: Ensure you're using HTTPS and have microphone permissions
- **Language Issues**: Check that the language codes match Sarvam's supported languages

## 📚 **Next Steps**

- Test all language combinations
- Try voice input/output in different languages
- Customize the theme and agent personality
- Deploy to your production website

Happy coding! 🎉

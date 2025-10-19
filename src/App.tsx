import React, { useEffect } from 'react'
import WidgetApp from './widget/WidgetApp'
import { loadConfig } from './widget/settings'
import './App.css'

function App() {
  const [config, setConfig] = React.useState(loadConfig())

  useEffect(() => {
    // Set up a demo configuration for development with Sarvam API
    const demoConfig = {
      sarvamApiKey: 'sk_uj0n6g37_9EBFAiU9akOcJKkNjOiCTE1P', // Replace with your actual API key
      position: 'bottom-right' as const,
      theme: {
        primaryColor: '#4F46E5',
        background: '#ffffff',
        text: '#111827',
        font: 'Inter, system-ui, sans-serif'
      },
      agent: {
        name: 'SarvamBot',
        avatar: '',
        greeting: 'Hello! I\'m your Sarvam AI assistant. Try the chat and voice features!'
      },
      enableVoice: true,
      languages: ['en', 'hi', 'ta', 'te', 'bn'], // Indian languages supported by Sarvam
      context: 'You are a helpful AI assistant powered by Sarvam AI. You can help with coding questions, explain concepts, or just chat!',
      autoOpen: false,
      showWelcomeMessage: true,
      placeholder: 'Ask me anything...'
    }

    // Set the config in window for the widget to pick up
    ;(window as any).AgentWidgetConfig = demoConfig
    setConfig(demoConfig)
  }, [])

  return (
    <div className="app">
      {/* <header className="app-header">
        <h1>🤖 Sarvam AI Agent Widget</h1>
        <p>Development Environment - Powered by Sarvam AI</p>
      </header> */}
      
      {/* <main className="app-content">
        <div className="demo-section">
          <h2>✨ Features</h2>
          <ul>
            <li>🌍 Multi-language support (English, Hindi, Tamil, Telugu, Bengali)</li>
            <li>🎤 Voice input and output with Sarvam TTS/STT</li>
            <li>🎨 Customizable appearance</li>
            <li>📱 Mobile responsive</li>
            <li>🔒 Shadow DOM isolation</li>
          </ul>
        </div>

        <div className="demo-section">
          <h2>🎮 Try the Widget</h2>
          <p>Look for the widget button in the bottom-right corner of your screen!</p>
          <p>The widget includes:</p>
          <ul>
            <li>💬 Chat interface with Sarvam AI responses</li>
            <li>🎤 Voice mode with Sarvam speech recognition</li>
            <li>🌐 Language switching (5 Indian languages)</li>
            <li>⚙️ Customizable theme and settings</li>
          </ul>
        </div>

        <div className="demo-section">
          <h2>🔧 Development Info</h2>
          <p><strong>Current Config:</strong></p>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div> */}
      {/* </main> */}

      {/* Render the widget directly in development */}
      <WidgetApp config={config} />
    </div>
  )
}

export default App

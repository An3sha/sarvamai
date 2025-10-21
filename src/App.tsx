import React, { useEffect } from 'react'
import WidgetApp from './widget/WidgetApp'
import { loadConfig } from './widget/settings'
import './App.css'

function App() {
  const [config, setConfig] = React.useState(loadConfig())

  useEffect(() => {
    const demoConfig = {
      sarvamApiKey: import.meta.env.VITE_SARVAM_API_KEY,
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
      languages: ['en', 'hi', 'ta', 'te', 'bn'],
      context: 'You are a helpful AI assistant powered by Sarvam AI. You can help with coding questions, explain concepts, or just chat!',
      autoOpen: false,
      showWelcomeMessage: true,
      placeholder: 'Ask me anything...'
    }

    ;(window as { AgentWidgetConfig?: typeof demoConfig }).AgentWidgetConfig = demoConfig
    setConfig(demoConfig)
  }, [])

  return (
    <div className="app">
      <WidgetApp config={config} />
    </div>
  )
}

export default App

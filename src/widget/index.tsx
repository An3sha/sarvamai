// src/widget/index.tsx
import { createRoot } from 'react-dom/client';
import WidgetApp from './WidgetApp';
import { loadConfig } from './settings';

function mountWidget() {
  const config = loadConfig();
  const container = document.createElement('div');
  container.id = 'sarvam-agent-root';
  const attachTo = document.body;
  attachTo.appendChild(container);

  // create shadow root to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });
  const host = document.createElement('div');
  shadow.appendChild(host);

  // Basic styling and position from config
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
  `;
  shadow.appendChild(style);

  // Mount React into shadow host
  const root = createRoot(host);
  root.render(<WidgetApp config={config} />);
}

// Auto mount if config present, else expose function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((window as any).AgentWidgetConfig) {
  mountWidget();
}
// always expose
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).SarvamAgentMount = mountWidget;

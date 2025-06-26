import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Direct mounting approach
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
});

// Immediate mounting as backup
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

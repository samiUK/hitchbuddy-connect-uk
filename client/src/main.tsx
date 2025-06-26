import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('HitchBuddy main.tsx loading...');

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('Root element found, mounting HitchBuddy...');
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('HitchBuddy mounted successfully!');
} else {
  console.error('Root element not found!');
}

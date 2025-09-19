import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import test utilities for debugging (only in development)
if (import.meta.env.DEV) {
  import('./utils/testEmailConfiguration');
}

createRoot(document.getElementById("root")!).render(<App />);

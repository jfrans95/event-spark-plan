import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize global error handler for blocked client errors
import './utils/errorHandler'

createRoot(document.getElementById("root")!).render(<App />);

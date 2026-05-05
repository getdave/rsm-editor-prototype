import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@wordpress/theme/design-tokens.css'
import '@wordpress/components/build-style/style.css'
import '@wordpress/dataviews/build-style/style.css'
import './styles/index.css'
import App from './components/App.jsx'

if (import.meta.env.DEV) {
  const branch = import.meta.env.VITE_BRANCH_NAME?.trim()
  document.title = branch
    ? `RSM Prototype (${branch})`
    : 'RSM Prototype'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

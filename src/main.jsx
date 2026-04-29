import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@wordpress/theme/design-tokens.css'
import '@wordpress/components/build-style/style.css'
import '@wordpress/dataviews/build-style/style.css'
import './styles/index.css'
import App from './components/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

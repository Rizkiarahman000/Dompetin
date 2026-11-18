import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CategoriesProvider } from './context/CategoriesContext.jsx'
import { UpdateProvider } from './context/UpdateContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UpdateProvider>
      <CategoriesProvider>
        <App />
      </CategoriesProvider>
    </UpdateProvider>
  </StrictMode>,
)

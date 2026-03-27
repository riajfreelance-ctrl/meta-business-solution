import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './Dashboard'
import { BrandProvider } from './context/BrandContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrandProvider>
      <Dashboard />
    </BrandProvider>
)

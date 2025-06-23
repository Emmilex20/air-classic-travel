// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './App.jsx' // Changed to Root
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root /> {/* Render Root component */}
  </React.StrictMode>,
)
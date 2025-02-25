import React from 'react';
import { createRoot } from 'react-dom/client';  // Import createRoot from 'react-dom/client'
import App from './App';
import './assets/styles/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';



const container = document.getElementById('root');
const root = createRoot(container);  // Create the root

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

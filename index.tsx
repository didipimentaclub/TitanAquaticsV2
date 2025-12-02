// index.tsx - ENTRY POINT ÚNICO

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// App novo fica dentro de src/
import App from './src/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento #root não encontrado em index.html');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root element
const container = document.getElementById('root');

if (!container) {
    throw new Error('Failed to find the root element');
}

// Create a root and render the app
const root = ReactDOM.createRoot(container);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

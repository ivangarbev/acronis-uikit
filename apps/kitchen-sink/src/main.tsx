import React from 'react';
import ReactDOM from 'react-dom/client';

// The published library stylesheet: CSS reset (default element styles),
// the `--av-*` design tokens (:root + .dark), and the component utilities.
import '@acronis-platform/ui-react/styles';

import App from '@/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

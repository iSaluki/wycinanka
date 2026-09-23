import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poltawski-nowy/400.css';
import '@fontsource/poltawski-nowy/400-italic.css';
import '@fontsource/poltawski-nowy/600.css';
import '@fontsource/poltawski-nowy/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

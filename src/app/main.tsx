import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poltawski-nowy/400.css';
import '@fontsource/poltawski-nowy/400-italic.css';
import '@fontsource/poltawski-nowy/700.css';
import '@fontsource/signika/400.css';
import '@fontsource/signika/500.css';
import '@fontsource/signika/600.css';
import '@fontsource/signika/700.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

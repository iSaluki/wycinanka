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
import { initPwa } from './lib/pwa';
import { BootError, showBootError } from './BootError';

const root = document.getElementById('root')!;

try {
  initPwa();
} catch (err) {
  // Install prompts and the service worker are extras: never let them stop the app.
  console.warn('PWA set-up failed', err);
}

// The app is loaded separately so that anything failing while its modules start up (an API an older
// or privacy-hardened browser lacks) shows a message instead of leaving a blank page.
import('./App')
  .then(({ App }) => {
    createRoot(root).render(
      <StrictMode>
        <BootError>
          <App />
        </BootError>
      </StrictMode>,
    );
  })
  .catch((err: unknown) => showBootError(root, err));

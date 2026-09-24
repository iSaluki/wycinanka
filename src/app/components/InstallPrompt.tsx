import { dismissInstall, install, useInstallMode } from '../lib/pwa';
import { IconShare } from './icons';
import { Mark } from './Shell';

/** Invites mobile learners to add Wycinanka to their home screen, where the browser supports it. */
export function InstallPrompt() {
  const mode = useInstallMode();
  if (!mode) return null;
  return (
    <section className="install" aria-labelledby="install-title">
      <span className="install-mark">
        <Mark />
      </span>
      <div className="stack" style={{ gap: 6, flex: 1 }}>
        <h2 id="install-title">Put Wycinanka on your home screen</h2>
        {mode === 'prompt' ? (
          <p>It opens full screen like an app, one tap away when it's time to practise.</p>
        ) : (
          <p>
            Tap <IconShare className="inline-icon" /> <b>Share</b> in Safari, then <b>Add to Home Screen</b>. It opens full
            screen like an app.
          </p>
        )}
        <div className="row wrap">
          {mode === 'prompt' && (
            <button type="button" className="btn small" onClick={() => void install()}>
              Install the app
            </button>
          )}
          <button type="button" className="btn small quiet" onClick={dismissInstall}>
            Not now
          </button>
        </div>
      </div>
    </section>
  );
}

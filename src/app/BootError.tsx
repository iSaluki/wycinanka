import { Component, type ReactNode } from 'react';

const HELP =
  "Wycinanka couldn't start in this browser. Try reloading. If you use Brave, turn off Shields for this site; otherwise update your browser (on an iPad, update iPadOS).";

const describe = (err: unknown) => (err instanceof Error ? `${err.name}: ${err.message}` : String(err));

/** Replaces the start-up screen with an explanation when the app's code fails to load. */
export function showBootError(root: HTMLElement, err: unknown): void {
  console.error(err);
  const box = document.createElement('div');
  box.className = 'boot';
  box.setAttribute('role', 'alert');
  const brand = document.createElement('p');
  brand.className = 'boot-brand';
  brand.textContent = 'Wycinanka';
  const help = document.createElement('p');
  help.className = 'boot-error';
  help.textContent = HELP;
  const code = document.createElement('code');
  code.textContent = describe(err);
  help.append(code);
  box.append(brand, help);
  root.textContent = '';
  root.appendChild(box);
}

/** Catches render errors, which would otherwise unmount everything and leave a white page. */
export class BootError extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.error == null) return this.props.children;
    return (
      <div className="boot" role="alert">
        <p className="boot-brand">Wycinanka</p>
        <p className="boot-error">
          {HELP}
          <code>{describe(this.state.error)}</code>
        </p>
        <button type="button" className="btn" onClick={() => location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}

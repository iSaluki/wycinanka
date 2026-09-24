/** Whether this browser has been past the welcome screen, so "/" stops sending first-time guests there. */
export const WELCOME_KEY = 'wycinanka:welcomed';

export function markWelcomed() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* storage unavailable: the welcome screen may show again, which is harmless */
  }
}

export function welcomed(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

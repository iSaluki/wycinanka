import { useEffect, useState } from 'react';
import { earnedBadges } from '../../shared/badges';
import { getState, updateSettings, useApp } from './store';

/**
 * Notices badges a signed-in learner has just earned. A badge counts as new until the learner has been told
 * about it: the moment is saved in their settings, so they hear about each badge once, on whichever device.
 */
export function useNewBadges(): { fresh: string[]; dismiss: () => void } {
  const user = useApp((s) => s.user);
  const status = useApp((s) => s.status);
  const progress = useApp((s) => s.progress);
  const [fresh, setFresh] = useState<string[]>([]);

  useEffect(() => {
    if (status !== 'ready' || !user) return;
    const seen = getState().settings.badges ?? {};
    const now = earnedBadges(progress).filter((id) => !(id in seen));
    if (!now.length) return;
    const at = Date.now();
    void updateSettings({ badges: { ...seen, ...Object.fromEntries(now.map((id) => [id, at])) } });
    setFresh((f) => [...f, ...now.filter((id) => !f.includes(id))]);
  }, [status, user, progress]);

  // Signing out clears anything waiting to be shown.
  useEffect(() => {
    if (!user) setFresh([]);
  }, [user]);

  return { fresh, dismiss: () => setFresh([]) };
}

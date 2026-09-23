import { PASSWORD_MAX, PASSWORD_MIN } from './limits';

/**
 * NIST SP 800-63B style policy: length, not a known-common password, not the username.
 * No composition rules. Shared so the sign-up form can explain problems before submitting.
 */

// Common passwords of 10+ characters (shorter ones are already rejected by length).
const COMMON = new Set([
  '1234567890', '0123456789', '0987654321', '1111111111', '0000000000', '1234512345', '1122334455',
  '123456789a', 'a123456789', '12345678910', '123123123123', 'qwertyuiop', 'qwerty1234', 'qwerty12345',
  'qwerty123456', '1q2w3e4r5t', '1q2w3e4r5t6y', 'q1w2e3r4t5', 'zaq12wsxcde', 'zaq1zaq1zaq1', 'asdfghjkl1',
  'password12', 'password123', 'password1234', 'password!1', 'passw0rd123', 'iloveyou12', 'iloveyou123',
  'letmein123', 'welcome123', 'welcome1234', 'football123', 'monkey12345', 'dragon12345', 'sunshine12',
  'princess123', 'abcdefghij', 'abc1234567', 'abcd123456', 'computer12', 'superman123', 'baseball123',
  'trustno1234', 'changeme123', 'administrator', 'admin12345', 'qazwsxedcrfv', 'polska1234', 'polska12345',
  'haslo12345', 'haslo123456', 'kochamcie1', 'zaq1@wsx', 'wycinanka1', 'wycinanka123', 'learnpolish',
  'learnpolish1', 'learnpolish123',
]);

export type PasswordProblem = 'too-short' | 'too-long' | 'common' | 'contains-username';

export function passwordProblem(password: string, username: string): PasswordProblem | null {
  const p = password.normalize('NFKC');
  if ([...p].length < PASSWORD_MIN) return 'too-short';
  if ([...p].length > PASSWORD_MAX) return 'too-long';
  const lower = p.toLowerCase();
  if (COMMON.has(lower)) return 'common';
  if (username && lower.includes(username.toLowerCase())) return 'contains-username';
  return null;
}

export const PASSWORD_MESSAGES: Record<PasswordProblem, string> = {
  'too-short': `Use at least ${PASSWORD_MIN} characters. A few unrelated words works well.`,
  'too-long': `Use at most ${PASSWORD_MAX} characters.`,
  common: 'That password is on lists attackers try first. Choose something less common.',
  'contains-username': "Your password can't contain your username.",
};

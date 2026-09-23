/** Account field limits, kept free of dependencies so the browser bundle can share them. */
export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,24}$/;
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

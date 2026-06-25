import { tokens } from "./generated/tokens";

/** Media queries must use compile-time literals (not CSS vars). Values from docs/DESIGN.md */
export const mediaMd = `screen and (min-width: ${tokens.breakpoint.md})`;
export const mediaLg = `screen and (min-width: ${tokens.breakpoint.lg})`;
export const mediaTabletOnly = `screen and (min-width: ${tokens.breakpoint.md}) and (max-width: 1023px)`;

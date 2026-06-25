import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const treeRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  width: "100%",
  minWidth: 0,
});

export const searchInput = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  fontSize: vars.fontSize.sm,
  width: "100%",
  boxSizing: "border-box",
});

export const treePanel = style({
  maxHeight: "320px",
  overflow: "auto",
  overflowX: "auto",
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.slate50,
  padding: vars.space[2],
  width: "100%",
  boxSizing: "border-box",
  "@media": {
    [mediaMd]: {
      maxHeight: "360px",
    },
  },
});

export const treeList = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  minWidth: "min(100%, 280px)",
});

export const treeRow = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: vars.space[1],
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
    borderRadius: vars.radius.md,
    padding: `${vars.space[1]} ${vars.space[2]}`,
    cursor: "pointer",
    fontSize: vars.fontSize.sm,
    color: vars.color.slate800,
    boxSizing: "border-box",
    selectors: {
      "&:hover:not(:disabled)": {
        backgroundColor: vars.color.white,
      },
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
  },
  variants: {
    selected: {
      true: {
        backgroundColor: vars.color.white,
        boxShadow: `inset 0 0 0 1px ${vars.color.navy}`,
        color: vars.color.navy,
        fontWeight: vars.fontWeight.medium,
      },
    },
    kind: {
      category: { fontWeight: vars.fontWeight.semibold },
      equipment: { fontWeight: vars.fontWeight.medium },
      location: { color: vars.color.slate600 },
      device: {},
    },
  },
});

export const expandBtn = style({
  flexShrink: 0,
  width: "20px",
  height: "20px",
  padding: 0,
  border: "none",
  background: "transparent",
  color: vars.color.slate500,
  cursor: "pointer",
  fontSize: vars.fontSize.xs,
  lineHeight: 1,
  selectors: {
    "&:hover": { color: vars.color.slate800 },
  },
});

export const expandPlaceholder = style({
  flexShrink: 0,
  width: "20px",
});

export const rowSelectBtn = style({
  flex: 1,
  minWidth: 0,
  width: "100%",
  border: "none",
  background: "transparent",
  padding: 0,
  textAlign: "left",
  cursor: "pointer",
  selectors: {
    "&:disabled": {
      cursor: "not-allowed",
    },
  },
});

export const rowContent = style({
  display: "block",
  width: "100%",
});

export const rowLabel = recipe({
  base: {
    display: "block",
    lineHeight: 1.45,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
  variants: {
    kind: {
      category: {},
      equipment: {},
      location: {},
      device: {
        fontSize: vars.fontSize.xs,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        letterSpacing: "-0.01em",
      },
    },
  },
});

export const rowSublabel = style({
  display: "block",
  marginTop: "2px",
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
  lineHeight: 1.4,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
});

export const nestedList = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const selectedSummary = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate600,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
});

export const selectedSlug = style({
  display: "block",
  marginTop: "2px",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontSize: vars.fontSize.xs,
  color: vars.color.slate800,
});

export const emptyHint = style({
  margin: 0,
  padding: vars.space[4],
  textAlign: "center",
  fontSize: vars.fontSize.sm,
  color: vars.color.slate500,
});

export const multiChips = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[1],
  marginTop: vars.space[1],
});

export const chip = style({
  display: "inline-flex",
  alignItems: "flex-start",
  gap: vars.space[1],
  borderRadius: vars.radius.lg,
  padding: "4px 8px",
  fontSize: vars.fontSize.xs,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  backgroundColor: vars.color.white,
  border: `1px solid ${vars.color.slate200}`,
  color: vars.color.slate700,
  lineHeight: 1.35,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  maxWidth: "100%",
});

export const chipRemove = style({
  flexShrink: 0,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: vars.color.slate500,
  fontSize: vars.fontSize.sm,
  lineHeight: 1,
});

export const checkbox = style({
  flexShrink: 0,
  marginTop: "3px",
});

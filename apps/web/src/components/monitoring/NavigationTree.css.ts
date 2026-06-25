import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const panel = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
});

export const panelHeader = style({
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderBottom: `1px solid ${vars.color.slate200}`,
});

export const panelTitle = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: vars.color.slate500,
});

export const treeScroll = style({
  flex: 1,
  overflowY: "auto",
  padding: `${vars.space[2]} 0`,
});

export const treeList = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const treeItem = style({
  margin: 0,
});

export const treeButton = style({
  display: "flex",
  width: "100%",
  alignItems: "center",
  gap: vars.space[1],
  border: "none",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  fontSize: vars.fontSize.xs,
  color: vars.color.slate700,
  padding: "5px 8px",
  borderRadius: vars.radius.md,
  margin: "0 6px",
  selectors: {
    "&:hover": { backgroundColor: vars.color.slate100 },
  },
});

export const treeButtonActive = style({
  backgroundColor: vars.color.idleBg,
  color: vars.color.navy,
  fontWeight: vars.fontWeight.medium,
});

export const treeChevron = style({
  width: "12px",
  flexShrink: 0,
  fontSize: "10px",
  color: vars.color.slate400,
});

export const treeChevronHidden = style({
  visibility: "hidden",
});

export const treeLabel = style({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const treeCount = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.slate400,
  flexShrink: 0,
});

export const nestedList = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
});

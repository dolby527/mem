import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const wrap = style({
  position: "relative",
  flexShrink: 0,
});

export const kebabBtn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  borderRadius: vars.radius.md,
  backgroundColor: "transparent",
  color: vars.color.slate600,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.slate100,
      color: vars.color.navy,
    },
  },
});

export const kebabIcon = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
});

export const kebabDot = style({
  width: 4,
  height: 4,
  borderRadius: vars.radius.full,
  backgroundColor: "currentColor",
});

export const dropdown = style({
  position: "absolute",
  right: 0,
  top: "100%",
  marginTop: vars.space[1],
  minWidth: 120,
  padding: `${vars.space[1]} 0`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  border: `1px solid ${vars.color.slate200}`,
  boxShadow: vars.shadow.md,
  zIndex: 30,
});

export const menuItem = style({
  display: "block",
  width: "100%",
  padding: `${vars.space[2]} ${vars.space[4]}`,
  border: "none",
  backgroundColor: "transparent",
  fontSize: vars.fontSize.sm,
  textAlign: "left",
  color: vars.color.slate800,
  cursor: "pointer",
  selectors: {
    "&:hover": { backgroundColor: vars.color.slate50 },
  },
});

export const menuItemDanger = style({
  color: vars.color.fault,
  selectors: {
    "&:hover": { backgroundColor: vars.color.faultBg },
  },
});

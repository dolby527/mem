import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const menuWrap = style({
  position: "relative",
  flexShrink: 0,
});

export const menuBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  borderRadius: vars.radius.md,
  background: "transparent",
  cursor: "pointer",
});

export const menuIcon = style({
  fontFamily: "inherit",
  fontSize: vars.fontSize.base,
  lineHeight: 1,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate500,
});

export const menuDropdown = style({
  position: "absolute",
  top: "100%",
  right: 0,
  zIndex: 20,
  marginTop: vars.space[1],
  minWidth: 140,
  padding: `${vars.space[2]} 0`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.md,
  border: `1px solid ${vars.color.slate200}`,
});

export const menuDropdownFixed = style({
  position: "fixed",
  zIndex: 300,
  minWidth: 140,
  padding: `${vars.space[2]} 0`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.md,
  border: `1px solid ${vars.color.slate200}`,
});

export const menuItem = style({
  display: "block",
  width: "100%",
  padding: `${vars.space[3]} ${vars.space[4]}`,
  border: "none",
  background: "transparent",
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  lineHeight: "20px",
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate900,
  textAlign: "left",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.slate50,
    },
  },
});

export const menuItemDanger = style({
  color: vars.color.fault,
});

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const tabs = style({
  display: "flex",
  gap: vars.space[1],
  padding: vars.space[1],
  margin: vars.space[2],
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.slate100,
});

export const tab = style({
  flex: 1,
  border: "none",
  borderRadius: vars.radius.md,
  padding: "6px 8px",
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  cursor: "pointer",
  background: "transparent",
  color: vars.color.slate600,
  textAlign: "center",
  textDecoration: "none",
});

export const tabActive = style({
  backgroundColor: vars.color.white,
  color: vars.color.navy,
  boxShadow: vars.shadow.sm,
});

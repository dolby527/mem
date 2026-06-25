import { style } from "@vanilla-extract/css";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const root = style({
  position: "sticky",
  bottom: 0,
  zIndex: 40,
  display: "flex",
  borderTop: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  "@media": { [mediaMd]: { display: "none" } },
});

export const link = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  padding: "10px 0",
  fontSize: vars.fontSize.xs,
  textDecoration: "none",
});

export const linkActive = style({
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
});

export const linkInactive = style({
  color: vars.color.slate500,
});

export const icon = style({
  fontSize: vars.fontSize.base,
});

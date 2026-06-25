import { style } from "@vanilla-extract/css";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const bar = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  padding: vars.space[4],
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

export const barTitle = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: vars.color.slate500,
});

export const row = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  "@media": {
    [mediaMd]: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },
  },
});

export const fieldGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: "140px",
});

export const label = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
});

export const select = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate700,
  minWidth: "160px",
});

export const statusRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
});

export const hint = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate400,
});

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const page = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[6],
  backgroundColor: vars.color.slate50,
});

export const card = style({
  width: "100%",
  maxWidth: "420px",
  padding: vars.space[8],
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.md,
});

export const title = style({
  margin: `0 0 ${vars.space[2]}`,
  fontSize: vars.fontSize["2xl"],
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
});

export const subtitle = style({
  margin: `0 0 ${vars.space[6]}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate500,
});

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const label = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate700,
});

export const input = style({
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate300}`,
  fontSize: vars.fontSize.base,
});

export const button = style({
  marginTop: vars.space[2],
  padding: `${vars.space[3]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: "none",
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  fontWeight: vars.fontWeight.semibold,
  cursor: "pointer",
  ":disabled": { opacity: 0.6, cursor: "not-allowed" },
});

export const linkRow = style({
  marginTop: vars.space[4],
  fontSize: vars.fontSize.sm,
  color: vars.color.slate600,
  textAlign: "center",
});

export const link = style({
  color: vars.color.idle,
  textDecoration: "underline",
});

export const error = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.fault,
});

export const hint = style({
  margin: `0 0 ${vars.space[4]}`,
  padding: vars.space[3],
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.slate100,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate700,
});

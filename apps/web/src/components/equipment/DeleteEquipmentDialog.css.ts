import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[4],
  backgroundColor: "rgba(15, 23, 42, 0.45)",
});

export const dialog = style({
  width: "100%",
  maxWidth: 400,
  padding: vars.space[6],
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.md,
});

export const title = style({
  margin: `0 0 ${vars.space[2]}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
});

export const message = style({
  margin: `0 0 ${vars.space[6]}`,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.slate600,
});

export const actions = style({
  display: "flex",
  justifyContent: "flex-end",
  gap: vars.space[2],
});

export const cancelBtn = style({
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate300}`,
  backgroundColor: vars.color.white,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  cursor: "pointer",
});

export const deleteBtn = style({
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: "none",
  backgroundColor: vars.color.fault,
  color: vars.color.white,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  cursor: "pointer",
  selectors: {
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const error = style({
  margin: `0 0 ${vars.space[4]}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.fault,
});

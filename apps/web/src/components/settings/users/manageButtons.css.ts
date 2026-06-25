import { style } from "@vanilla-extract/css";
import { mediaLg } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const btnOutline = style({
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  fontFamily: "inherit",
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate700,
  cursor: "pointer",
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.sm,
      padding: `${vars.space[3]} ${vars.space[5]}`,
    },
  },
});

export const btnNavy = style({
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: "none",
  backgroundColor: vars.color.navy,
  fontFamily: "inherit",
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.white,
  cursor: "pointer",
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.sm,
      padding: `${vars.space[3]} ${vars.space[5]}`,
    },
  },
});

export const btnGray = style({
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.slate100,
  fontFamily: "inherit",
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate700,
  cursor: "pointer",
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.sm,
      padding: `${vars.space[3]} ${vars.space[5]}`,
    },
  },
});

export const btnCreamOutline = style({
  flex: 1,
  padding: `${vars.space[3]} ${vars.space[3]}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate300}`,
  backgroundColor: vars.color.slate50,
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate700,
  cursor: "pointer",
});

export const btnDangerBlock = style({
  flex: 1,
  padding: `${vars.space[3]} ${vars.space[3]}`,
  borderRadius: vars.radius.lg,
  border: "none",
  backgroundColor: vars.color.fault,
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.white,
  cursor: "pointer",
  selectors: {
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
});

export const modalFooterEqual = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: vars.space[3],
  width: "100%",
  flexShrink: 0,
  marginTop: "auto",
  paddingTop: vars.space[5],
});

export const modalFooterCancelHalf = style([
  btnGray,
  {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
]);

export const modalFooterPrimaryHalf = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "stretch",
});

export const modalFooterPrimaryBtn = style([
  btnNavy,
  {
    flex: 1,
    width: "100%",
    minHeight: 52,
  },
]);

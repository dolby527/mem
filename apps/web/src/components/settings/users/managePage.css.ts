import { style } from "@vanilla-extract/css";
import { mediaLg, mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const pageTitle = style({
  margin: 0,
  fontSize: vars.fontSize.xl,
  lineHeight: "28px",
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "-0.02em",
  color: vars.color.slate900,
  flexShrink: 0,
  "@media": {
    [mediaMd]: {
      fontSize: vars.fontSize["2xl"],
      lineHeight: "32px",
    },
    [mediaLg]: {
      fontSize: vars.fontSize["3xl"],
      lineHeight: "38px",
    },
  },
});

export const pageHead = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: vars.space[4],
  width: "100%",
  flexShrink: 0,
  "@media": {
    [mediaLg]: {
      gap: "22px",
    },
  },
});

export const toolbarCluster = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: vars.space[3],
  width: "100%",
  minWidth: 0,
});

export const searchWrap = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flex: "0 1 auto",
  width: "100%",
  maxWidth: 320,
  minWidth: 0,
  minHeight: 48,
  padding: `0 ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
  boxSizing: "border-box",
  "@media": {
    [mediaMd]: {
      minHeight: 52,
      maxWidth: 560,
    },
    [mediaLg]: {
      maxWidth: 560,
      minHeight: 56,
    },
  },
});

export const searchWrapFlex = style({
  flex: "1 1 auto",
  "@media": {
    [mediaMd]: {
      maxWidth: 400,
    },
    [mediaLg]: {
      maxWidth: 440,
    },
  },
});

export const managePage = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  width: "100%",
});

export const contentGrow = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
});

export const searchIcon = style({
  flexShrink: 0,
  color: vars.color.slate400,
  fontSize: vars.fontSize.lg,
  lineHeight: 1,
});

export const searchInput = style({
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: vars.fontSize.sm,
  lineHeight: "20px",
  color: vars.color.slate900,
  fontFamily: "inherit",
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.base,
      lineHeight: "26px",
    },
  },
  selectors: {
    "&::placeholder": {
      color: vars.color.slate400,
    },
  },
});

export const emptyWrap = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: `${vars.space[12]} ${vars.space[5]} ${vars.space[8]}`,
  gap: vars.space[4],
  marginTop: vars.space[6],
  flex: 1,
  minHeight: 0,
});

export const emptyArt = style({
  width: 120,
  height: 120,
  borderRadius: vars.radius.xl,
  background: `linear-gradient(145deg, ${vars.color.slate100}, ${vars.color.white})`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "48px",
  lineHeight: 1,
});

export const emptyTitle = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const emptySub = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  lineHeight: "22px",
  color: vars.color.slate500,
  maxWidth: 320,
});

export const mutedBody = style({
  marginTop: vars.space[4],
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.slate500,
});

export const loadingTop = style({
  marginTop: vars.space[8],
});

export const toast = style({
  position: "fixed",
  bottom: vars.space[6],
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1000,
  padding: `${vars.space[3]} ${vars.space[5]}`,
  borderRadius: vars.radius.lg,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.white,
  backgroundColor: vars.color.navy,
  boxShadow: vars.shadow.md,
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.2s ease",
});

export const toastVisible = style({
  opacity: 1,
});

export const toastError = style({
  backgroundColor: vars.color.fault,
});

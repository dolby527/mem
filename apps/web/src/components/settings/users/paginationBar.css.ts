import { style } from "@vanilla-extract/css";
import { mediaLg, mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const nav = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: vars.space[1],
  marginTop: vars.space[8],
  flexWrap: "nowrap",
  width: "100%",
  "@media": {
    [mediaMd]: {
      gap: vars.space[2],
    },
    [mediaLg]: {
      marginTop: "auto",
      paddingTop: vars.space[10],
    },
  },
});

const btnBase = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  boxSizing: "border-box" as const,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  selectors: {
    "&:disabled": { opacity: 0.35, cursor: "not-allowed" },
  },
};

export const btn = style([
  btnBase,
  {
    flexShrink: 0,
    minWidth: 28,
    height: 32,
    padding: "0 4px",
    borderRadius: vars.radius.md,
    fontFamily: "inherit",
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.slate500,
    "@media": {
      [mediaMd]: {
        minWidth: 36,
        height: 36,
        padding: "0 8px",
        fontSize: vars.fontSize.sm,
      },
    },
  },
]);

export const btnLarge = style([
  btn,
  {
    "@media": {
      [mediaLg]: {
        minWidth: 44,
        height: 44,
        fontSize: vars.fontSize.lg,
        borderRadius: vars.radius.lg,
      },
    },
  },
]);

export const btnActive = style({
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
});

export const arrowBtn = style([
  btn,
  {
    fontSize: "22px",
    lineHeight: 1,
  },
]);

export const arrowBtnLarge = style([
  btnLarge,
  {
    fontSize: "18px",
    lineHeight: 1,
    "@media": {
      [mediaLg]: {
        fontSize: "28px",
      },
    },
  },
]);

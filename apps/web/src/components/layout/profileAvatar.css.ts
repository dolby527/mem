import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.slate100,
  overflow: "hidden",
  flexShrink: 0,
});

export const size = styleVariants({
  sm: {
    width: 28,
    height: 28,
  },
  md: {
    width: 40,
    height: 40,
  },
  lg: {
    width: 72,
    height: 72,
  },
});

export const letter = styleVariants({
  sm: {
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.navy,
    lineHeight: 1,
    fontSize: vars.fontSize.xs,
  },
  md: {
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.navy,
    lineHeight: 1,
    fontSize: vars.fontSize.sm,
  },
  lg: {
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.navy,
    lineHeight: 1,
    fontSize: vars.fontSize["2xl"],
  },
});

export const image = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

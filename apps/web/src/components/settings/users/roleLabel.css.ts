import { style } from "@vanilla-extract/css";
import { mediaLg } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

const roleBadgeBase = style({
  flexShrink: 0,
  padding: "2px 8px",
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.xs,
  lineHeight: "16px",
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "-0.02em",
});

export const roleBadgeAdmin = style([
  roleBadgeBase,
  {
    color: vars.color.navy,
    backgroundColor: vars.color.slate100,
  },
]);

export const roleBadgeUser = style([
  roleBadgeBase,
  {
    color: vars.color.slate600,
    backgroundColor: vars.color.slate50,
  },
]);

export const roleAdmin = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.base,
      lineHeight: "24px",
    },
  },
});

export const roleUser = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate500,
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.base,
      lineHeight: "24px",
    },
  },
});

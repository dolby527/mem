import { style } from "@vanilla-extract/css";
import { mediaLg, mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

const tabUnderlineActive = `3px solid ${vars.color.navy}`;

export const shell = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: vars.layout.maxWidthPage,
  margin: "0 auto",
  flex: 1,
  minHeight: 0,
  boxSizing: "border-box",
  "@media": {
    [mediaLg]: {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    },
  },
});

export const subNavTabs = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "stretch",
  width: "100%",
  flexShrink: 0,
  borderBottom: `1px solid ${vars.color.slate200}`,
});

export const tabBtn = style({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[2],
  minWidth: 120,
  padding: `${vars.space[4]} ${vars.space[5]} ${vars.space[3]}`,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  lineHeight: "20px",
  fontWeight: vars.fontWeight.medium,
  letterSpacing: "-0.02em",
  color: vars.color.slate400,
  borderBottom: "3px solid transparent",
  marginBottom: -1,
  "@media": {
    [mediaMd]: {
      fontSize: vars.fontSize.base,
      lineHeight: "22px",
      minWidth: 132,
      padding: `${vars.space[4]} ${vars.space[6]} ${vars.space[4]}`,
    },
    [mediaLg]: {
      minWidth: 140,
      padding: `${vars.space[5]} ${vars.space[8]} ${vars.space[4]}`,
      fontSize: vars.fontSize.lg,
      lineHeight: "24px",
    },
  },
});

export const tabBtnActive = style({
  color: vars.color.navy,
  fontWeight: vars.fontWeight.semibold,
  borderBottom: tabUnderlineActive,
});

export const mainCol = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  paddingTop: vars.space[5],
  boxSizing: "border-box",
  "@media": {
    [mediaMd]: {
      paddingTop: vars.space[6],
    },
    [mediaLg]: {
      paddingTop: vars.space[8],
    },
  },
});

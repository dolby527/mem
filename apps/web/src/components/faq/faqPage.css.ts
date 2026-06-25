import { style } from "@vanilla-extract/css";
import { mediaLg } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const page = style({
  margin: "0 auto",
  maxWidth: vars.layout.maxWidthPage,
  width: "100%",
  boxSizing: "border-box",
});

export const title = style({
  margin: `0 0 ${vars.space[2]}`,
  fontSize: vars.fontSize["2xl"],
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize["3xl"],
    },
  },
});

export const subtitleBold = style({
  margin: `0 0 ${vars.space[1]}`,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const subtitleMuted = style({
  margin: `0 0 ${vars.space[6]}`,
  fontSize: vars.fontSize.sm,
  lineHeight: "20px",
  color: vars.color.slate500,
});

export const searchWrap = style({
  position: "relative",
  marginBottom: vars.space[6],
});

export const searchInput = style({
  width: "100%",
  boxSizing: "border-box",
  padding: `${vars.space[3]} ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  fontSize: vars.fontSize.sm,
  fontFamily: "inherit",
  color: vars.color.slate900,
  outline: "none",
  selectors: {
    "&:focus": {
      borderColor: vars.color.navy,
      boxShadow: `0 0 0 1px ${vars.color.navy}`,
    },
  },
});

export const hr = style({
  border: "none",
  borderTop: `1px solid ${vars.color.slate200}`,
  margin: `0 0 ${vars.space[2]}`,
});

export const list = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const itemRow = style({
  margin: 0,
});

export const toggle = style({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  padding: `${vars.space[4]} 0`,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "inherit",
});

export const questionText = style({
  flex: 1,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: "22px",
  color: vars.color.slate900,
});

export const chevron = style({
  flexShrink: 0,
  color: vars.color.slate400,
  transition: "transform 0.2s ease",
});

export const chevronOpen = style({
  transform: "rotate(180deg)",
});

export const answer = style({
  margin: `0 0 ${vars.space[2]}`,
  padding: `0 0 ${vars.space[3]}`,
  fontSize: vars.fontSize.sm,
  lineHeight: "22px",
  color: vars.color.slate600,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});

export const itemHr = style({
  border: "none",
  borderTop: `1px solid ${vars.color.slate200}`,
  margin: 0,
});

export const empty = style({
  padding: `${vars.space[8]} 0`,
  textAlign: "center",
  color: vars.color.slate500,
});

export const message = style({
  padding: `${vars.space[6]} 0`,
  textAlign: "center",
  color: vars.color.slate500,
});

export const errorText = style({
  padding: `${vars.space[6]} 0`,
  textAlign: "center",
  color: vars.color.fault,
});

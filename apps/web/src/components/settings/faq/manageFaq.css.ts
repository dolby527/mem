import { style } from "@vanilla-extract/css";
import { mediaLg, mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

const faqListScroll = {
  overflowY: "auto" as const,
  overflowX: "hidden" as const,
  WebkitOverflowScrolling: "touch" as const,
};

/** 6행 이하일 때 목록이 내용만큼만 차지 (스크롤 없음) */
export const FAQ_LIST_VISIBLE_ROWS = 6;

const faqGridColsTablet = "56px minmax(160px,1.5fr) minmax(200px,2fr) 88px";
const faqGridColsDesktop = "64px minmax(200px,1.5fr) minmax(280px,2fr) 100px";

const mobileNoColWidth = "32px";

export const faqManagePage = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const faqContentGrow = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const lineClamp2Mobile = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
  wordBreak: "break-word" as const,
  "@media": {
    [mediaMd]: {
      display: "block",
      WebkitLineClamp: "unset",
      WebkitBoxOrient: "horizontal" as const,
      overflow: "visible",
    },
  },
};

export const faqTableHeader = style({
  display: "none",
  flexShrink: 0,
  marginTop: vars.space[4],
  padding: `${vars.space[3]} ${vars.space[5]}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  boxSizing: "border-box",
  border: `1px solid ${vars.color.slate200}`,
  gridTemplateColumns: faqGridColsTablet,
  gap: vars.space[4],
  alignItems: "center",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate600,
  "@media": {
    [mediaMd]: {
      display: "grid",
      marginTop: vars.space[5],
    },
    [mediaLg]: {
      marginTop: vars.space[8],
      padding: `${vars.space[4]} ${vars.space[6]}`,
      gap: vars.space[5],
      fontSize: vars.fontSize.base,
      lineHeight: "22px",
      borderRadius: vars.radius.xl,
      gridTemplateColumns: faqGridColsDesktop,
    },
  },
});

export const faqListArea = style({
  display: "flex",
  flexDirection: "column",
  marginTop: vars.space[4],
  paddingBottom: vars.space[4],
  boxSizing: "border-box",
  flex: "0 0 auto",
  overflow: "visible",
  "@media": {
    [mediaMd]: {
      marginTop: 0,
      paddingBottom: vars.space[5],
    },
    [mediaLg]: {
      paddingBottom: vars.space[6],
    },
  },
});

export const faqListAreaScrollable = style({
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
});

export const faqRowList = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  boxSizing: "border-box",
  overflow: "hidden",
});

export const faqRowListScrollable = style({
  flex: 1,
  minHeight: 0,
  flexShrink: 1,
  ...faqListScroll,
});

export const faqRowItem = style({
  flexShrink: 0,
});

/** Mobile: No | (질문+답변 세로) | 케밥. Tablet+: 4열 테이블 그리드 */
export const faqRowInner = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: "2px",
  padding: `${vars.space[3]} ${vars.space[4]}`,
  boxSizing: "border-box",
  borderBottom: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  "@media": {
    [mediaMd]: {
      display: "grid",
      gridTemplateColumns: faqGridColsTablet,
      gap: vars.space[4],
      alignItems: "start",
      padding: `${vars.space[3]} ${vars.space[5]}`,
    },
    [mediaLg]: {
      padding: `${vars.space[4]} ${vars.space[6]}`,
      gridTemplateColumns: faqGridColsDesktop,
      gap: vars.space[5],
    },
  },
});

export const faqRowSort = style({
  flexShrink: 0,
  width: mobileNoColWidth,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: "20px",
  color: vars.color.slate500,
  textAlign: "center",
  paddingTop: 2,
  "@media": {
    [mediaMd]: {
      width: "auto",
      paddingTop: 0,
      alignSelf: "center",
    },
  },
});

/** 질문·답변 묶음 — 모바일에서 세로 스택, 데스크톱에서는 display:contents로 그리드 셀 분리 */
export const faqRowTextCol = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  "@media": {
    [mediaMd]: {
      display: "contents",
    },
  },
});

export const faqRowQuestion = style([
  {
    margin: 0,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    lineHeight: "20px",
    color: vars.color.slate900,
    minWidth: 0,
    "@media": {
      [mediaMd]: {
        fontSize: vars.fontSize.base,
      },
    },
  },
  lineClamp2Mobile,
]);

export const faqRowAnswer = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  lineHeight: "18px",
  color: vars.color.slate500,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  minWidth: 0,
  "@media": {
    [mediaMd]: {
      fontSize: vars.fontSize.sm,
      lineHeight: "22px",
    },
  },
});

export const faqRowActions = style({
  flexShrink: 0,
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: 2,
  "@media": {
    [mediaMd]: {
      paddingTop: 0,
      alignSelf: "center",
    },
  },
});

export const registerBtn = style({
  flexShrink: 0,
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  border: "none",
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  cursor: "pointer",
});

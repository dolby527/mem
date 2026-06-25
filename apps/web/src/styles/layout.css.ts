import { style } from "@vanilla-extract/css";
import { mediaLg, mediaMd } from "./media.css";
import { vars } from "./theme.css";

export const pageContainer = style({
  margin: "0 auto",
  maxWidth: vars.layout.maxWidthPage,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[8],
});

export const pageContainerNarrow = style({
  margin: "0 auto",
  maxWidth: vars.layout.maxWidthDetail,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[8],
});

export const pageHeader = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const pageTitle = style({
  margin: 0,
  fontSize: vars.fontSize["2xl"],
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "-0.025em",
  color: vars.color.slate900,
});

export const pageSubtitle = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate500,
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const sectionHeaderRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
});

export const linkAccent = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.navy,
  selectors: {
    "&:hover": { textDecoration: "underline" },
  },
});

export const card = style({
  overflow: "hidden",
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

export const cardBody = style({
  padding: vars.space[6],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const gridCards = style({
  display: "grid",
  gap: vars.space[4],
  gridTemplateColumns: "1fr",
  "@media": {
    [mediaMd]: { gridTemplateColumns: "repeat(2, 1fr)" },
    [mediaLg]: { gridTemplateColumns: "repeat(3, 1fr)" },
  },
});

export const emptyState = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  padding: vars.space[12],
  textAlign: "center",
  color: vars.color.slate500,
});

export const infoBox = style({
  borderRadius: vars.radius.xl,
  border: `1px dashed ${vars.color.slate300}`,
  backgroundColor: vars.color.white,
  padding: vars.space[5],
  fontSize: vars.fontSize.sm,
  color: vars.color.slate600,
});

export const infoBoxTitle = style({
  margin: 0,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate800,
});

export const infoBoxList = style({
  margin: `${vars.space[2]} 0 0`,
  paddingLeft: vars.space[5],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const inlineCode = style({
  fontSize: vars.fontSize.xs,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
});

export const tableWrap = style({
  overflow: "hidden",
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: vars.fontSize.sm,
});

export const tableHead = style({
  borderBottom: `1px solid ${vars.color.slate100}`,
  backgroundColor: vars.color.slate50,
  fontSize: vars.fontSize.xs,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.color.slate500,
});

export const th = style({
  padding: `${vars.space[3]} ${vars.space[4]}`,
  fontWeight: vars.fontWeight.medium,
});

export const thHiddenMobile = style([
  th,
  {
    display: "none",
    "@media": { [mediaMd]: { display: "table-cell" } },
  },
]);

export const thNumeric = style({
  textAlign: "right",
});

export const tdNumeric = style({
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate900,
});

export const tr = style({
  borderBottom: `1px solid ${vars.color.slate100}`,
  selectors: {
    "&:hover": { backgroundColor: "rgba(248, 250, 252, 0.8)" },
    "&:last-child": { borderBottom: "none" },
  },
});

export const td = style({
  padding: `${vars.space[3]} ${vars.space[4]}`,
});

export const tdHiddenMobile = style([
  td,
  {
    display: "none",
    color: vars.color.slate600,
    "@media": { [mediaMd]: { display: "table-cell" } },
  },
]);

export const tableLink = style({
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate900,
  selectors: {
    "&:hover": { color: vars.color.navy },
  },
});

export const tableSubtext = style({
  margin: `${vars.space[1]} 0 0`,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate400,
  "@media": { [mediaMd]: { display: "none" } },
});

export const tablePmCell = style({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.space[1],
});

export const tablePmDate = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
  color: vars.color.slate500,
  whiteSpace: "nowrap",
});

export const tableDateCell = style({
  fontSize: vars.fontSize.sm,
  fontVariantNumeric: "tabular-nums",
  color: vars.color.slate700,
  whiteSpace: "nowrap",
});

export const tableCategory = style({
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate800,
});

export const tableCheckedAt = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
  color: vars.color.slate600,
  whiteSpace: "nowrap",
});

export const tableCheckedAtCell = style({
  display: "block",
});

export const thCenter = style([
  th,
  {
    textAlign: "center",
  },
]);

export const tdCenter = style([
  td,
  {
    textAlign: "center",
    verticalAlign: "middle",
  },
]);

export const tableRecheckWrap = style({
  display: "inline-flex",
  justifyContent: "center",
});

export const tableRecheckBtn = style({
  padding: `${vars.space[1]} ${vars.space[2]}`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate900,
  backgroundColor: vars.color.amber200,
  border: `1px solid ${vars.color.amber200}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  whiteSpace: "nowrap",
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: "#fcd34d" },
    "&:disabled": { opacity: 0.65, cursor: "not-allowed" },
  },
});

/** 전체 장비 현황 — 행 구분선 (장비명 열부터) */
export const tableOverviewDivider = style({
  borderTop: `1px solid ${vars.color.slate100}`,
});

/** 동일 분류 연속 행 — 분류 열에는 구분선 없음 */
export const tableOverviewCategoryContinuation = style({
  borderTop: "none",
});

export const trOverview = style({
  selectors: {
    "&:hover": { backgroundColor: "rgba(248, 250, 252, 0.8)" },
  },
});

export const tableFooterLabel = style({
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate700,
  backgroundColor: vars.color.slate50,
});

export const skeleton = style({
  height: "40px",
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.slate200,
});

export const definitionList = style({
  display: "grid",
  gap: vars.space[4],
  fontSize: vars.fontSize.sm,
  "@media": { [mediaMd]: { gridTemplateColumns: "repeat(2, 1fr)" } },
});

export const definitionTerm = style({
  margin: 0,
  color: vars.color.slate500,
});

export const definitionDetail = style({
  margin: 0,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate900,
});

export const noteBox = style({
  margin: 0,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.slate50,
  padding: `${vars.space[3]} ${vars.space[4]}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate600,
});

export const detailHero = style({
  position: "relative",
  aspectRatio: "16 / 9",
  maxHeight: "320px",
  backgroundColor: vars.color.slate100,
  "@media": { [mediaMd]: { maxHeight: "384px" } },
});

export const detailHeroImage = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const detailHeaderRow = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
});

export const detailTitle = style({
  margin: 0,
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const detailSubtitle = style({
  margin: `${vars.space[1]} 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate500,
});

export const sectionHint = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate500,
});

export const loadMoreButton = style({
  marginTop: vars.space[4],
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate700,
  cursor: "pointer",
  selectors: {
    "&:hover:not(:disabled)": {
      backgroundColor: vars.color.slate50,
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
});

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";
import { mediaLg, mediaMd } from "@/styles/media.css";

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[5],
  padding: vars.space[6],
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

/** 모바일: 세로 스택 · md+: 이미지 사이드 + 필드 영역 */
export const formLayout = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[5],
  "@media": {
    [mediaMd]: {
      display: "grid",
      gridTemplateColumns: "minmax(220px, 260px) minmax(0, 1fr)",
      alignItems: "start",
      columnGap: vars.space[6],
      rowGap: vars.space[5],
    },
    [mediaLg]: {
      gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)",
      columnGap: vars.space[8],
    },
  },
});

export const imageAside = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  "@media": {
    [mediaMd]: {
      position: "sticky",
      top: vars.space[4],
    },
  },
});

export const grid = style({
  display: "grid",
  gap: vars.space[4],
  gridTemplateColumns: "1fr",
  "@media": {
    [mediaMd]: { gridTemplateColumns: "repeat(2, 1fr)" },
    [mediaLg]: { gridTemplateColumns: "repeat(3, 1fr)" },
  },
});

export const locationSection = style({
  gridColumn: "1 / -1",
  display: "grid",
  gap: vars.space[4],
  gridTemplateColumns: "1fr",
  "@media": {
    [mediaMd]: { gridTemplateColumns: "repeat(2, 1fr)" },
    [mediaLg]: { gridTemplateColumns: "repeat(4, 1fr)" },
  },
});

export const notesGrid = style({
  gridColumn: "1 / -1",
  display: "grid",
  gap: vars.space[4],
  gridTemplateColumns: "1fr",
  "@media": {
    [mediaMd]: { gridTemplateColumns: "repeat(2, 1fr)" },
  },
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const label = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate700,
});

export const requiredMark = style({
  color: vars.color.fault,
  fontWeight: vars.fontWeight.semibold,
});

export const requiredLegend = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate600,
});

export const locationGroup = style({
  gridColumn: "1 / -1",
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const locationGroupHint = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
});

export const srOnly = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const input = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  fontSize: vars.fontSize.sm,
});

export const textarea = style([
  input,
  { minHeight: "80px", resize: "vertical" as const },
]);

export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[3],
  justifyContent: "flex-end",
});

export const buttonPrimary = style({
  border: "none",
  borderRadius: vars.radius.lg,
  padding: `${vars.space[2]} ${vars.space[4]}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  cursor: "pointer",
});

export const buttonSecondary = style({
  borderRadius: vars.radius.lg,
  padding: `${vars.space[2]} ${vars.space[4]}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  color: vars.color.slate700,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
});

export const error = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.fault,
});

export const note = style({
  margin: 0,
  padding: vars.space[3],
  borderRadius: vars.radius.lg,
  fontSize: vars.fontSize.sm,
  backgroundColor: vars.color.slate100,
  color: vars.color.slate700,
  wordBreak: "break-all",
});

/** @deprecated Use imageAside — kept for maintenance panels */
export const imageSection = imageAside;

export const imagePreview = style({
  width: "100%",
  maxWidth: "320px",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.slate100,
  "@media": {
    [mediaMd]: { maxWidth: "none" },
  },
});

export const imageHint = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
});

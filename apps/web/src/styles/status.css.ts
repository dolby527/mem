import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { mediaMd } from "./media.css";
import { vars } from "./theme.css";

export const statusSummarySection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const statusSummaryHeading = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate700,
});

export const statusSummaryGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: vars.space[3],
  "@media": {
    [mediaMd]: {
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: vars.space[4],
    },
  },
});

export const statusSummaryCardLink = style({
  display: "block",
  textDecoration: "none",
  color: "inherit",
  borderRadius: vars.radius.xl,
  transition: "box-shadow 0.15s ease, transform 0.15s ease",
  selectors: {
    "&:hover": {
      boxShadow: vars.shadow.md,
      transform: "translateY(-1px)",
    },
  },
});

export const statusSummaryCard = recipe({
  base: {
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.slate200}`,
    backgroundColor: vars.color.white,
    padding: vars.space[4],
    boxShadow: vars.shadow.sm,
    borderLeftWidth: "4px",
    borderLeftStyle: "solid",
  },
  variants: {
    status: {
      ALL: { borderLeftColor: vars.color.navy },
      RUNNING: { borderLeftColor: vars.color.running },
      IDLE: { borderLeftColor: vars.color.idle },
      FAULT: { borderLeftColor: vars.color.fault },
      OFFLINE: { borderLeftColor: vars.color.offline },
    },
  },
});

export const statusSummaryLabel = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate500,
});

export const statusSummaryCount = style({
  margin: `${vars.space[1]} 0 0`,
  fontSize: vars.fontSize["3xl"],
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "-0.025em",
  color: vars.color.slate900,
});

/** 랜딩·장비 카드·필터 등 전역 상태 칩 (솔리드 배경) */
export const statusChip = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: vars.radius.full,
    fontWeight: vars.fontWeight.medium,
    whiteSpace: "nowrap",
    textDecoration: "none",
    border: "none",
    cursor: "default",
  },
  variants: {
    status: {
      ALL: {
        backgroundColor: vars.color.navy,
        color: vars.color.white,
      },
      RUNNING: {
        backgroundColor: vars.color.running,
        color: vars.color.white,
      },
      IDLE: {
        backgroundColor: vars.color.idle,
        color: vars.color.white,
      },
      FAULT: {
        backgroundColor: vars.color.fault,
        color: vars.color.white,
      },
      OFFLINE: {
        backgroundColor: vars.color.slate500,
        color: vars.color.white,
      },
    },
    size: {
      sm: {
        width: "4.875rem",
        height: "22px",
        padding: "0 4px",
        fontSize: vars.fontSize.xs,
        boxSizing: "border-box",
      },
      md: {
        width: "5.5rem",
        height: "26px",
        padding: "0 8px",
        fontSize: vars.fontSize.sm,
        boxSizing: "border-box",
      },
      filter: {
        width: "5.5rem",
        height: "30px",
        padding: "0 8px",
        fontSize: vars.fontSize.sm,
        cursor: "pointer",
        boxSizing: "border-box",
      },
    },
    selected: {
      true: { opacity: 1 },
      false: { opacity: 0.45 },
    },
  },
  defaultVariants: {
    size: "md",
    selected: true,
  },
});

/** @deprecated statusChip 과 동일 — StatusBadge 호환 */
export const statusBadge = statusChip;

export const timelineList = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const timelineItem = style({
  display: "flex",
  gap: vars.space[4],
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.slate100}`,
  backgroundColor: "rgba(241, 245, 249, 0.8)",
  padding: `${vars.space[3]} ${vars.space[4]}`,
});

export const timelineDot = recipe({
  base: {
    marginTop: "6px",
    width: "10px",
    height: "10px",
    borderRadius: vars.radius.full,
    flexShrink: 0,
  },
  variants: {
    status: {
      RUNNING: { backgroundColor: vars.color.running },
      IDLE: { backgroundColor: vars.color.idle },
      FAULT: { backgroundColor: vars.color.fault },
      OFFLINE: { backgroundColor: vars.color.offline },
    },
  },
});

export const timelineContent = style({
  minWidth: 0,
  flex: 1,
});

export const timelineRow = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: vars.space[2],
});

export const timelineTime = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.slate400,
});

export const timelineMeta = style({
  margin: "2px 0 0",
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
});

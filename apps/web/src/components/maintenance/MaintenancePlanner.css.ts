import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { mediaLg, mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const plannerRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const splitLayout = style({
  display: "grid",
  gap: vars.space[6],
  alignItems: "start",
  "@media": {
    [mediaMd]: {
      gridTemplateColumns: "1fr",
    },
    [mediaLg]: {
      gridTemplateColumns: "minmax(420px, 520px) minmax(0, 1fr)",
    },
  },
});

export const panel = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
  overflow: "hidden",
});

export const panelHeader = style({
  padding: `${vars.space[4]} ${vars.space[5]}`,
  borderBottom: `1px solid ${vars.color.slate100}`,
  backgroundColor: vars.color.slate50,
});

export const panelTitle = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate800,
});

export const panelBody = style({
  padding: vars.space[5],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const tabRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
});

export const tabBtn = recipe({
  base: {
    border: `1px solid ${vars.color.slate200}`,
    borderRadius: vars.radius.lg,
    padding: `${vars.space[1]} ${vars.space[3]}`,
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.medium,
    backgroundColor: vars.color.white,
    color: vars.color.slate600,
    cursor: "pointer",
  },
  variants: {
    active: {
      true: {
        borderColor: vars.color.navy,
        backgroundColor: vars.color.navy,
        color: vars.color.white,
      },
    },
  },
});

export const calendarHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  marginBottom: vars.space[4],
});

export const calendarTitle = style({
  margin: 0,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const calendarNavBtn = style({
  border: `1px solid ${vars.color.slate200}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space[1]} ${vars.space[2]}`,
  fontSize: vars.fontSize.sm,
  backgroundColor: vars.color.white,
  cursor: "pointer",
  selectors: {
    "&:hover": { backgroundColor: vars.color.slate50 },
  },
});

export const calendarGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "2px",
  fontSize: vars.fontSize.xs,
});

export const calendarWeekday = style({
  textAlign: "center",
  padding: vars.space[1],
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate500,
});

export const calendarDay = recipe({
  base: {
    minHeight: "52px",
    borderRadius: vars.radius.md,
    border: `1px solid ${vars.color.slate100}`,
    padding: vars.space[1],
    backgroundColor: vars.color.white,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  variants: {
    muted: {
      true: { backgroundColor: vars.color.slate50, color: vars.color.slate400 },
    },
    today: {
      true: { borderColor: vars.color.navy, boxShadow: `inset 0 0 0 1px ${vars.color.navy}` },
    },
  },
});

export const calendarDayNum = style({
  fontWeight: vars.fontWeight.medium,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate700,
});

export const calendarDot = recipe({
  base: {
    height: "4px",
    borderRadius: vars.radius.full,
    width: "100%",
  },
  variants: {
    status: {
      SCHEDULED: { backgroundColor: vars.color.amber800 },
      IN_PROGRESS: { backgroundColor: vars.color.navy },
      OVERDUE: { backgroundColor: vars.color.fault },
      COMPLETED: { backgroundColor: vars.color.slate400 },
      CANCELLED: { backgroundColor: vars.color.slate300 },
    },
  },
});

export const scheduleList = style({
  marginTop: vars.space[5],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const scheduleListTitle = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate800,
});

export const statusBadge = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: vars.radius.full,
    padding: "2px 8px",
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.medium,
    whiteSpace: "nowrap",
  },
  variants: {
    status: {
      SCHEDULED: {
        backgroundColor: vars.color.amber50,
        color: vars.color.amber800,
      },
      IN_PROGRESS: {
        backgroundColor: "#dbeafe",
        color: vars.color.navy,
      },
      OVERDUE: {
        backgroundColor: vars.color.faultBg,
        color: vars.color.faultText,
      },
      COMPLETED: {
        backgroundColor: vars.color.slate100,
        color: vars.color.slate600,
      },
      CANCELLED: {
        backgroundColor: vars.color.slate100,
        color: vars.color.slate500,
      },
    },
  },
});

export const rowActions = style({
  display: "inline-flex",
  flexWrap: "nowrap",
  gap: vars.space[2],
  alignItems: "center",
  whiteSpace: "nowrap",
});

export const scheduleDateCell = style({
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
  verticalAlign: "middle",
});

export const scheduleAssigneeCell = style({
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  maxWidth: "10rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const scheduleEquipmentCell = style({
  verticalAlign: "middle",
});

export const scheduleEquipmentMeta = style({
  margin: `${vars.space[1]} 0 0`,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
  lineHeight: 1.4,
});

export const scheduleEquipmentId = style({
  margin: "2px 0 0",
  fontSize: vars.fontSize.xs,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  color: vars.color.slate400,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
});

export const scheduleActionsCell = style({
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  width: "1%",
});

export const smallSelect = style({
  flexShrink: 0,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate200}`,
  padding: "2px 6px",
  fontSize: vars.fontSize.xs,
  whiteSpace: "nowrap",
});

export const smallBtn = style({
  flexShrink: 0,
  border: `1px solid ${vars.color.slate200}`,
  borderRadius: vars.radius.md,
  padding: "2px 8px",
  fontSize: vars.fontSize.xs,
  backgroundColor: vars.color.white,
  cursor: "pointer",
  whiteSpace: "nowrap",
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.slate50 },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const dangerBtn = style([
  smallBtn,
  {
    color: vars.color.faultText,
    borderColor: vars.color.faultBorder,
  },
]);

export const csvHint = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
  lineHeight: 1.5,
});

export const previewTable = style({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: vars.fontSize.xs,
});

export const previewTh = style({
  textAlign: "left",
  padding: vars.space[2],
  borderBottom: `1px solid ${vars.color.slate200}`,
  color: vars.color.slate500,
  fontWeight: vars.fontWeight.medium,
});

export const previewTd = style({
  padding: vars.space[2],
  borderBottom: `1px solid ${vars.color.slate100}`,
  color: vars.color.slate700,
});

export const message = recipe({
  base: {
    margin: 0,
    fontSize: vars.fontSize.sm,
    borderRadius: vars.radius.lg,
    padding: `${vars.space[2]} ${vars.space[3]}`,
  },
  variants: {
    kind: {
      error: {
        backgroundColor: "#fef2f2",
        color: vars.color.faultText,
      },
      success: {
        backgroundColor: "#ecfdf5",
        color: "#047857",
      },
    },
  },
});

export const ganttRow = style({
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: vars.space[2],
  alignItems: "center",
  fontSize: vars.fontSize.xs,
  "@media": {
    [mediaMd]: {
      gridTemplateColumns: "180px 1fr",
    },
  },
});

export const ganttLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: vars.color.slate700,
  fontWeight: vars.fontWeight.medium,
});

export const ganttTrack = style({
  position: "relative",
  height: "20px",
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.slate100,
});

export const ganttBar = recipe({
  base: {
    position: "absolute",
    top: "2px",
    height: "16px",
    borderRadius: vars.radius.sm,
    minWidth: "4px",
  },
  variants: {
    status: {
      SCHEDULED: { backgroundColor: vars.color.amber800 },
      IN_PROGRESS: { backgroundColor: vars.color.navy },
      OVERDUE: { backgroundColor: vars.color.fault },
      COMPLETED: { backgroundColor: vars.color.slate400 },
      CANCELLED: { backgroundColor: vars.color.slate300 },
    },
  },
});

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const card = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  selectors: {
    "&:hover": {
      borderColor: vars.color.slate300,
      boxShadow: vars.shadow.md,
    },
  },
});

export const cardCompact = style({
  borderRadius: vars.radius.lg,
});

export const cardLink = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  textDecoration: "none",
  color: "inherit",
});

export const menuWrap = style({
  position: "absolute",
  top: vars.space[2],
  right: vars.space[2],
  zIndex: 2,
});

export const thumbWrap = style({
  position: "relative",
  aspectRatio: "4 / 3",
  overflow: "hidden",
  backgroundColor: vars.color.slate100,
});

export const thumbImage = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  selectors: {
    [`${card}:hover &`]: {
      transform: "scale(1.02)",
    },
  },
});

export const body = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: vars.space[2],
  padding: vars.space[4],
});

export const bodyCompact = style({
  gap: vars.space[1],
  padding: `${vars.space[2]} ${vars.space[3]} ${vars.space[3]}`,
});

export const titleRow = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[2],
  /** 상태 칩 2개(sm 22px + gap) 높이 — PM 없을 때도 동일 */
  minHeight: "48px",
});

export const badgeStack = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  gap: vars.space[1],
  flexShrink: 0,
  minHeight: "48px",
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
});

export const timeRow = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const timeItem = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: vars.space[2],
  minWidth: 0,
});

export const timeLabel = style({
  flexShrink: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate400,
});

export const timeValue = style({
  margin: 0,
  flexShrink: 0,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
  color: vars.color.slate500,
  whiteSpace: "nowrap",
});

export const title = style({
  margin: 0,
  flex: 1,
  minWidth: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1.4,
  minHeight: "2.8em",
  color: vars.color.slate900,
});

export const location = style({
  margin: 0,
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
});

export const equipmentId = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  color: vars.color.slate500,
  wordBreak: "break-all",
  lineHeight: 1.35,
});

import { style } from "@vanilla-extract/css";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const page = style({
  maxWidth: vars.layout.maxWidthPage,
  margin: "0 auto",
  padding: `${vars.space[6]} ${vars.space[4]} ${vars.space[10]}`,
  "@media": { [mediaMd]: { padding: `${vars.space[8]} ${vars.space[8]} ${vars.space[12]}` } },
});

export const loading = style({
  margin: 0,
  color: vars.color.slate500,
  textAlign: "center",
});

export const card = style({
  maxWidth: 560,
  margin: "0 auto",
  padding: vars.space[6],
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
  "@media": { [mediaMd]: { padding: vars.space[8] } },
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize["2xl"],
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
});

export const subtitle = style({
  margin: `${vars.space[2]} 0 ${vars.space[6]}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate500,
});

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate800,
  paddingBottom: vars.space[2],
  borderBottom: `1px solid ${vars.color.slate100}`,
});

export const infoList = style({
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
});

export const infoRow = style({
  display: "grid",
  gridTemplateColumns: "88px 1fr",
  gap: vars.space[2],
  fontSize: vars.fontSize.sm,
});

export const infoTerm = style({
  margin: 0,
  color: vars.color.slate500,
  fontWeight: vars.fontWeight.medium,
});

export const infoValue = style({
  margin: 0,
  color: vars.color.slate900,
});

export const avatarRow = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space[4],
});

export const avatarFields = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  minWidth: 0,
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

export const input = style({
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate300}`,
  fontSize: vars.fontSize.base,
  width: "100%",
  boxSizing: "border-box",
});

export const textBtn = style({
  alignSelf: "flex-start",
  padding: 0,
  border: "none",
  background: "none",
  fontSize: vars.fontSize.sm,
  color: vars.color.navy,
  textDecoration: "underline",
  cursor: "pointer",
});

export const hint = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.slate500,
});

export const error = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.fault,
});

export const success = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.runningText,
});

export const submit = style({
  alignSelf: "flex-start",
  padding: `${vars.space[3]} ${vars.space[6]}`,
  borderRadius: vars.radius.md,
  border: "none",
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  fontWeight: vars.fontWeight.semibold,
  fontSize: vars.fontSize.sm,
  cursor: "pointer",
  selectors: {
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

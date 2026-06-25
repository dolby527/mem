import { style } from "@vanilla-extract/css";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";
import { GNB_HEIGHT } from "@/components/layout/appGnb.css";

export const page = style({
  minHeight: `calc(100svh - ${GNB_HEIGHT})`,
  background: `linear-gradient(180deg, ${vars.color.slate50} 0%, ${vars.color.white} 40%)`,
});

export const inner = style({
  maxWidth: vars.layout.maxWidthPage,
  margin: "0 auto",
  padding: `${vars.space[10]} ${vars.space[4]} ${vars.space[12]}`,
  "@media": { [mediaMd]: { padding: `${vars.space[12]} ${vars.space[8]} ${vars.space[10]}` } },
});

export const hero = style({
  textAlign: "center",
  marginBottom: vars.space[12],
});

export const eyebrow = style({
  margin: `0 0 ${vars.space[3]}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.color.idle,
});

export const title = style({
  margin: `0 0 ${vars.space[4]}`,
  fontSize: vars.fontSize["3xl"],
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1.2,
  color: vars.color.navy,
  "@media": { [mediaMd]: { fontSize: "2.75rem" } },
});

export const subtitle = style({
  margin: "0 auto",
  maxWidth: "36rem",
  fontSize: vars.fontSize.lg,
  lineHeight: 1.6,
  color: vars.color.slate600,
});

export const mobileCtas = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  marginTop: vars.space[8],
  "@media": { [mediaMd]: { display: "none" } },
});

export const ctaPrimary = style({
  display: "block",
  borderRadius: vars.radius.lg,
  padding: `${vars.space[3]} ${vars.space[5]}`,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  textAlign: "center",
  textDecoration: "none",
  backgroundColor: vars.color.navy,
  color: vars.color.white,
});

export const ctaSecondary = style({
  display: "block",
  borderRadius: vars.radius.lg,
  padding: `${vars.space[3]} ${vars.space[5]}`,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  textAlign: "center",
  textDecoration: "none",
  border: `1px solid ${vars.color.slate300}`,
  backgroundColor: vars.color.white,
  color: vars.color.navy,
});

export const featureGrid = style({
  display: "grid",
  gap: vars.space[5],
  "@media": { [mediaMd]: { gridTemplateColumns: "repeat(3, 1fr)" } },
});

export const featureCard = style({
  padding: vars.space[6],
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

export const featureIcon = style({
  margin: `0 0 ${vars.space[3]}`,
  fontSize: vars.fontSize["2xl"],
});

export const featureTitle = style({
  margin: `0 0 ${vars.space[2]}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
});

export const featureDesc = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.slate600,
});

export const statusSection = style({
  marginTop: vars.space[12],
  padding: vars.space[6],
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  textAlign: "center",
});

export const statusTitle = style({
  margin: `0 0 ${vars.space[4]}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
});

export const statusRow = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: vars.space[3],
});

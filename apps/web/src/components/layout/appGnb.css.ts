import { style } from "@vanilla-extract/css";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const GNB_HEIGHT = "64px";

export const header = style({
  position: "sticky",
  top: 0,
  zIndex: 50,
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  boxShadow: vars.shadow.md,
});

export const inner = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
  maxWidth: vars.layout.maxWidthPage,
  margin: "0 auto",
  padding: `0 ${vars.space[4]}`,
  minHeight: GNB_HEIGHT,
  "@media": { [mediaMd]: { padding: `0 ${vars.space[8]}` } },
});

export const logoLink = style({
  display: "flex",
  flexDirection: "column",
  textDecoration: "none",
  color: "inherit",
  flexShrink: 0,
});

/** 게스트 GNB — 상단 브랜드 (랜딩) */
export const logoKicker = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: vars.color.slate400,
});

export const logoTitle = style({
  margin: 0,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1.2,
});

/** 인증 GNB — 병원명(상) + MEM 부제(하) */
export const brandPrimary = style({
  margin: 0,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1.2,
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": { [mediaMd]: { maxWidth: 320 } },
});

export const brandSecondary = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate400,
  lineHeight: 1.2,
});

export const guestActions = style({
  display: "none",
  alignItems: "center",
  gap: vars.space[4],
  "@media": { [mediaMd]: { display: "flex" } },
});

export const guestLink = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate200,
  textDecoration: "none",
  selectors: {
    "&:hover": { color: vars.color.white },
  },
});

export const guestCta = style({
  borderRadius: vars.radius.md,
  padding: `${vars.space[2]} ${vars.space[4]}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  backgroundColor: vars.color.white,
  color: vars.color.navy,
  textDecoration: "none",
  selectors: {
    "&:hover": { opacity: 0.92 },
  },
});

export const authNav = style({
  display: "none",
  alignItems: "center",
  gap: vars.space[1],
  "@media": { [mediaMd]: { display: "flex" } },
});

export const authNavLink = style({
  borderRadius: vars.radius.md,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  textDecoration: "none",
  transition: "background-color 0.15s ease",
});

export const authNavLinkActive = style({
  backgroundColor: vars.color.whiteAlpha15,
  color: vars.color.white,
});

export const authNavLinkInactive = style({
  color: vars.color.slate300,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.whiteAlpha10,
      color: vars.color.white,
    },
  },
});

export const authRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
  marginLeft: "auto",
});

export const profileLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[2],
  padding: `${vars.space[1]} ${vars.space[2]}`,
  borderRadius: vars.radius.md,
  textDecoration: "none",
  color: "inherit",
  transition: "background-color 0.15s ease",
  selectors: {
    "&:hover": { backgroundColor: vars.color.whiteAlpha10 },
  },
});

export const profileLinkActive = style({
  backgroundColor: vars.color.whiteAlpha15,
});

export const userName = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate200,
  maxWidth: 120,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "none",
  "@media": { [mediaMd]: { display: "block" } },
});

export const logoutBtn = style({
  border: `1px solid ${vars.color.whiteAlpha15}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space[1]} ${vars.space[3]}`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  backgroundColor: "transparent",
  color: vars.color.slate200,
  cursor: "pointer",
  selectors: {
    "&:hover": { backgroundColor: vars.color.whiteAlpha10, color: vars.color.white },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

export const mobileMenuBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  border: "none",
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.whiteAlpha10,
  color: vars.color.white,
  fontSize: vars.fontSize.lg,
  cursor: "pointer",
  "@media": { [mediaMd]: { display: "none" } },
});

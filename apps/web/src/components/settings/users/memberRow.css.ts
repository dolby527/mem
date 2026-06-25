import { style } from "@vanilla-extract/css";
import { mediaLg, mediaTabletOnly } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const USERS_LIST_ROW_H_MOBILE = 96;
export const USERS_LIST_ROW_H_TABLET = 120;
export const USERS_LIST_BODY_H_MOBILE = USERS_LIST_ROW_H_MOBILE * 6;
export const USERS_LIST_BODY_H_TABLET = USERS_LIST_ROW_H_TABLET * 6;

export const desktopGridCols =
  "minmax(140px,1.25fr) minmax(200px,2fr) 120px minmax(220px,1fr)";

export const memberRow = style({
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottom: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: vars.space[3],
  height: USERS_LIST_ROW_H_MOBILE,
  minHeight: USERS_LIST_ROW_H_MOBILE,
  padding: `0 ${vars.space[4]}`,
  "@media": {
    [mediaTabletOnly]: {
      height: USERS_LIST_ROW_H_TABLET,
      minHeight: USERS_LIST_ROW_H_TABLET,
    },
    [mediaLg]: {
      display: "grid",
      gridTemplateColumns: desktopGridCols,
      gap: "22px",
      alignItems: "center",
      padding: `${vars.space[5]} ${vars.space[6]}`,
      minHeight: 88,
      height: "auto",
    },
  },
});

export const memberRowPlaceholder = style([
  memberRow,
  {
    pointerEvents: "none",
    visibility: "hidden",
    borderBottom: "none",
  },
]);

export const cellIdentity = style({
  display: "flex",
  flex: 1,
  gap: vars.space[3],
  minWidth: 0,
  alignItems: "center",
  "@media": {
    [mediaLg]: {
      flex: "unset",
    },
  },
});

export const identityText = style({
  minWidth: 0,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const cellEmail = style({
  display: "none",
  minWidth: 0,
  "@media": {
    [mediaLg]: {
      display: "block",
    },
  },
});

export const cellRole = style({
  display: "none",
  "@media": {
    [mediaLg]: {
      display: "block",
    },
  },
});

export const cellActions = style({
  flexShrink: 0,
  display: "flex",
  justifyContent: "flex-end",
});

export const actionsMobile = style({
  "@media": {
    [mediaLg]: {
      display: "none",
    },
  },
});

export const actionsDesktop = style({
  display: "none",
  gap: vars.space[2],
  flexWrap: "wrap",
  justifyContent: "flex-end",
  "@media": {
    [mediaLg]: {
      display: "flex",
      gap: vars.space[3],
    },
  },
});

export const roleBadgeInline = style({
  "@media": {
    [mediaLg]: {
      display: "none",
    },
  },
});

export const emailInLead = style({
  fontSize: vars.fontSize.sm,
  lineHeight: "20px",
  color: vars.color.slate500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    [mediaLg]: {
      display: "none",
    },
  },
});

export const avatar = style({
  width: 40,
  height: 40,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.slate100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
  flexShrink: 0,
  "@media": {
    [mediaLg]: {
      width: 48,
      height: 48,
      fontSize: vars.fontSize.lg,
    },
  },
});

export const nameCell = style({
  fontWeight: vars.fontWeight.semibold,
  fontSize: vars.fontSize.sm,
  color: vars.color.slate900,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.lg,
      lineHeight: "26px",
    },
  },
});

export const nameRoleRow = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: vars.space[2],
  minWidth: 0,
});

export const emailCell = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.slate600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    [mediaLg]: {
      fontSize: vars.fontSize.base,
      lineHeight: "24px",
    },
  },
});

export const selfNote = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.slate400,
  fontStyle: "italic",
});

import { style } from "@vanilla-extract/css";
import { mediaLg, mediaTabletOnly } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

import {
  USERS_LIST_BODY_H_MOBILE,
  USERS_LIST_BODY_H_TABLET,
  desktopGridCols,
} from "./memberRow.css";

export const usersManagePage = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const usersContentGrow = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const usersListArea = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  marginTop: vars.space[4],
  overflow: "hidden",
  "@media": {
    [mediaLg]: {
      marginTop: 0,
    },
  },
});

export const memberList = style({
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  boxSizing: "border-box",
  height: USERS_LIST_BODY_H_MOBILE,
  minHeight: USERS_LIST_BODY_H_MOBILE,
  maxHeight: USERS_LIST_BODY_H_MOBILE,
  overflow: "hidden",
  "@media": {
    [mediaTabletOnly]: {
      height: USERS_LIST_BODY_H_TABLET,
      minHeight: USERS_LIST_BODY_H_TABLET,
      maxHeight: USERS_LIST_BODY_H_TABLET,
    },
    [mediaLg]: {
      flex: 1,
      flexShrink: 1,
      height: "auto",
      minHeight: 0,
      maxHeight: "none",
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
    },
  },
});

export const usersPagination = style({
  flexShrink: 0,
  marginTop: vars.space[6],
  "@media": {
    [mediaLg]: {
      marginTop: vars.space[5],
    },
  },
});

export const pageTitleRow = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  width: "100%",
});

export const inviteLinkBtn = style({
  flexShrink: 0,
  border: "none",
  background: "transparent",
  padding: 0,
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  lineHeight: "20px",
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.navy,
  cursor: "pointer",
  letterSpacing: "-0.02em",
  "@media": {
    [mediaLg]: {
      display: "none",
    },
  },
});

export const inviteDesktopBtn = style({
  display: "none",
  flexShrink: 0,
  boxSizing: "border-box",
  padding: `0 ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  border: "none",
  backgroundColor: vars.color.navy,
  color: vars.color.white,
  fontFamily: "inherit",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  cursor: "pointer",
  "@media": {
    [mediaLg]: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 56,
      height: 56,
    },
  },
});

export const usersToolbar = style({
  flexDirection: "column",
  alignItems: "stretch",
  "@media": {
    [mediaLg]: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
  },
});

export const usersSearchWrap = style({
  maxWidth: "none",
  width: "100%",
  "@media": {
    [mediaLg]: {
      maxWidth: 560,
    },
  },
});

export const tableHeaderNote = style({
  textAlign: "right",
});

export const tableHeader = style({
  display: "none",
  marginTop: vars.space[6],
  padding: `${vars.space[3]} ${vars.space[5]}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  boxSizing: "border-box",
  border: `1px solid ${vars.color.slate200}`,
  gridTemplateColumns: desktopGridCols,
  gap: vars.space[4],
  alignItems: "center",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate600,
  "@media": {
    [mediaLg]: {
      display: "grid",
      marginTop: vars.space[8],
      padding: `${vars.space[4]} ${vars.space[6]}`,
      gap: vars.space[5],
      fontSize: vars.fontSize.base,
      lineHeight: "22px",
      borderRadius: vars.radius.xl,
    },
  },
});

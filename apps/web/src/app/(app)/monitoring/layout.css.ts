import { style } from "@vanilla-extract/css";
import { mediaLg, mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

/** 대시보드 등과 동일한 페이지 최대 너비 */
export const monitoringShell = style({
  width: "100%",
  maxWidth: vars.layout.maxWidthPage,
  margin: "0 auto",
});

export const monitoringLayout = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  minHeight: "100%",
  "@media": {
    [mediaMd]: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 0,
    },
  },
});

export const treePanel = style({
  display: "none",
  flexShrink: 0,
  width: vars.layout.sidebarWidth,
  borderRight: `1px solid ${vars.color.slate200}`,
  backgroundColor: vars.color.white,
  borderRadius: vars.radius.lg,
  overflow: "hidden",
  "@media": {
    [mediaMd]: {
      display: "flex",
      flexDirection: "column",
      minHeight: "min(640px, calc(100vh - 140px))",
      position: "sticky",
      top: "72px",
      alignSelf: "flex-start",
    },
  },
});

export const treePanelMobile = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  "@media": {
    [mediaMd]: { display: "none" },
  },
});

export const contentColumn = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[5],
  "@media": {
    [mediaMd]: {
      paddingLeft: vars.space[5],
    },
  },
});

/** 모니터링 그리드 — pageContainer 안에서 카드 크기를 다른 화면 카드 그리드와 맞춤 */
export const equipmentGrid = style({
  display: "grid",
  gap: vars.space[3],
  gridTemplateColumns: "1fr",
  "@media": {
    [mediaMd]: { gridTemplateColumns: "repeat(2, 1fr)" },
    [mediaLg]: { gridTemplateColumns: "repeat(3, 1fr)" },
  },
});

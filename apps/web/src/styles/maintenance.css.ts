import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { mediaMd } from "./media.css";
import { vars } from "./theme.css";

export const maintenanceSummarySection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const maintenanceSummaryHeading = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate700,
});

export const maintenanceSummaryGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: vars.space[3],
  "@media": {
    [mediaMd]: {
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: vars.space[4],
    },
  },
});

export const maintenanceSummaryCardLink = style({
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

export const maintenanceSummaryCard = recipe({
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
    summaryKey: {
      scheduled: { borderLeftColor: vars.color.amber800 },
      inProgress: { borderLeftColor: vars.color.navy },
      overdue: { borderLeftColor: vars.color.fault },
      upcomingWeek: { borderLeftColor: vars.color.slate600 },
    },
    /** @deprecated equipment PM badge cards */
    status: {
      PM_SCHEDULED: { borderLeftColor: vars.color.amber800 },
    },
  },
});

export const maintenanceSummaryLabel = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate500,
});

export const maintenanceSummaryCount = style({
  margin: `${vars.space[1]} 0 0`,
  fontSize: vars.fontSize["3xl"],
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "-0.025em",
  color: vars.color.slate900,
});

export const maintenanceBadge = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: vars.radius.full,
    fontWeight: vars.fontWeight.medium,
    whiteSpace: "nowrap",
    border: "none",
  },
  variants: {
    status: {
      PM_SCHEDULED: {
        backgroundColor: vars.color.amber800,
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
    },
  },
  defaultVariants: { size: "md" },
});

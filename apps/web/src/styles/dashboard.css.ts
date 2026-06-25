import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const dashboardSignalsStack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

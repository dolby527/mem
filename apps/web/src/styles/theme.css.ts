import { createGlobalTheme } from "@vanilla-extract/css";
import { tokens } from "./generated/tokens";

export const vars = createGlobalTheme(":root", {
  color: tokens.color,
  space: tokens.space,
  radius: tokens.radius,
  fontSize: tokens.fontSize,
  fontWeight: tokens.fontWeight,
  shadow: tokens.shadow,
  breakpoint: tokens.breakpoint,
  layout: tokens.layout,
});

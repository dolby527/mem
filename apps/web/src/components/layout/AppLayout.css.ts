import { style } from "@vanilla-extract/css";
import { mediaMd } from "@/styles/media.css";
import { vars } from "@/styles/theme.css";

export const root = style({
  display: "flex",
  minHeight: "100svh",
  flexDirection: "column",
});

export const main = style({
  flex: 1,
  padding: `${vars.space[6]} ${vars.space[4]}`,
  "@media": { [mediaMd]: { padding: `${vars.space[8]} ${vars.space[8]}` } },
});

import { recipe } from "@vanilla-extract/recipes";
import { vars } from "@/styles/theme.css";

export const badge = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: vars.radius.full,
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.medium,
  },
  variants: {
    connected: {
      true: {
        color: vars.color.running,
        backgroundColor: vars.color.slate100,
      },
      false: {
        color: vars.color.slate500,
        backgroundColor: vars.color.slate100,
      },
    },
  },
  defaultVariants: {
    connected: false,
  },
});

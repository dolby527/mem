import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 200,
  backgroundColor: "rgba(15, 23, 42, 0.45)",
});

export const inviteModalViewport = style({
  position: "fixed",
  inset: 0,
  zIndex: 201,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[4],
  pointerEvents: "none",
});

export const inviteModalCard = style({
  pointerEvents: "auto",
  width: "100%",
  maxWidth: 440,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.md,
  overflow: "hidden",
});

export const inviteModalScroll = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: vars.space[6],
});

export const modalTitle = style({
  margin: `0 0 ${vars.space[5]}`,
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const modalField = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  marginBottom: vars.space[4],
});

export const modalLabel = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.slate700,
});

export const modalInput = style({
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate300}`,
  fontSize: vars.fontSize.base,
  fontFamily: "inherit",
  color: vars.color.slate900,
  selectors: {
    "&:focus": {
      outline: "none",
      borderColor: vars.color.navy,
      boxShadow: `0 0 0 1px ${vars.color.navy}`,
    },
  },
});

export const modalSelect = style([modalInput]);

export const modalFooterEqual = style({
  display: "flex",
  flexDirection: "row",
  gap: vars.space[3],
  padding: vars.space[5],
  borderTop: `1px solid ${vars.color.slate100}`,
});

export const deleteModalViewport = style([
  inviteModalViewport,
  { alignItems: "center" },
]);

export const deleteModalCard = style([
  inviteModalCard,
  { maxWidth: 400, textAlign: "center" },
]);

export const deleteModalBody = style({
  padding: vars.space[6],
});

export const deleteModalTitle = style({
  margin: `0 0 ${vars.space[3]}`,
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.slate900,
});

export const deleteMsg = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  lineHeight: "22px",
  color: vars.color.slate600,
});

export const deleteModalFooter = style({
  display: "flex",
  flexDirection: "row",
  gap: vars.space[3],
  padding: vars.space[5],
  borderTop: `1px solid ${vars.color.slate100}`,
});

export const faqModalOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[4],
  backgroundColor: "rgba(15, 23, 42, 0.45)",
});

export const faqModalCard = style({
  width: "100%",
  maxWidth: 520,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.md,
  padding: vars.space[6],
  boxSizing: "border-box",
});

export const faqAnswerTextarea = style({
  minHeight: 160,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.slate300}`,
  fontSize: vars.fontSize.base,
  fontFamily: "inherit",
  color: vars.color.slate900,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  resize: "vertical",
  selectors: {
    "&:focus": {
      outline: "none",
      borderColor: vars.color.navy,
      boxShadow: `0 0 0 1px ${vars.color.navy}`,
    },
  },
});

export const faqModalFooter = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: vars.space[3],
  marginTop: vars.space[5],
  paddingTop: vars.space[4],
  borderTop: `1px solid ${vars.color.slate100}`,
});

/* eslint-disable */
// AUTO-GENERATED — do not edit. Source: docs/DESIGN.md
// Regenerate: pnpm --filter @mem/web tokens

export const tokens = {
  color: {
    navy: "#0f2744",
    navyLight: "#1a3a5c",
    white: "#ffffff",
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate300: "#cbd5e1",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
    running: "#16a34a",
    runningBg: "#dcfce7",
    runningBorder: "#bbf7d0",
    runningText: "#166534",
    idle: "#2563eb",
    idleBg: "#dbeafe",
    idleBorder: "#bfdbfe",
    idleText: "#1e40af",
    fault: "#dc2626",
    faultBg: "#fee2e2",
    faultBorder: "#fecaca",
    faultText: "#991b1b",
    offline: "#6b7280",
    offlineBg: "#f3f4f6",
    offlineBorder: "#e5e7eb",
    offlineText: "#374151",
    amber50: "#fffbeb",
    amber200: "#fde68a",
    amber800: "#92400e",
    whiteAlpha10: "rgba(255, 255, 255, 0.1)",
    whiteAlpha15: "rgba(255, 255, 255, 0.15)",
    whiteAlpha90: "rgba(255, 255, 255, 0.9)"
  },
  space: {
    "0": "0",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px"
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px"
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px"
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600"
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  },
  breakpoint: {
    md: "768px",
    lg: "1024px"
  },
  layout: {
    maxWidthPage: "1152px",
    maxWidthDetail: "896px",
    sidebarWidth: "224px"
  }
} as const;

export type DesignTokens = typeof tokens;

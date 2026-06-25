import type { Metadata } from "next";
import { AppGnb } from "@/components/layout/AppGnb";
import { AuthProvider } from "@/providers/AuthProvider";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: "MEM — 의료장비 관리",
  description: "병원별 의료장비 실시간 모니터링",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <AppGnb />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "./AuthGuard"; // <-- Підключаємо нашого охоронця

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "TT Scoreboard",
  description: "Рейтинг настільного тенісу ЧДТУ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        {/* Обертаємо весь додаток */}
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
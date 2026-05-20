import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "TT Scoreboard",
  description: "Professional Tournament Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="bg-black text-white antialiased">
        <Sidebar />
        {/* Контейнер 9:16 */}
        <div className="min-h-screen max-w-[450px] mx-auto bg-[#050505] border-x border-white/5 relative shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
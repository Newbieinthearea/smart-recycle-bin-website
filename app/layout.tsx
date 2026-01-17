import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import SessionProvider from "./components/SessionProvider"; // 👈 Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoBin",
  description: "Smart Recycling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 👇 Wrap ThemeProvider inside SessionProvider (or vice versa, order doesn't matter here) */}
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
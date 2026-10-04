import type { Metadata } from "next";
import { DM_Sans, Unbounded } from "next/font/google";
import "@galyan/theme/css/variables";
import "@galyan/ui/styles.css";
import "./globals.css";
import { AppProviders } from "./providers";
import { LIGHT_THEME_ATTR, themeGuardScript } from "@/lib/theme-guard";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Samantrix Operations & Ecosystem Console",
  description:
    "Internal command center for Samantrix: visitor telemetry, CRM leads, Early 2027 waitlist, and multi-app orchestration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-brand="samantrix"
      data-theme={LIGHT_THEME_ATTR}
      data-color-mode="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
      className={`${dmSans.variable} ${unbounded.variable} font-sans h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeGuardScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

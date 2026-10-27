import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Unbounded } from "next/font/google";
import "@galyan/theme/css/variables";
import "@galyan/ui/styles.css";
import "./globals.css";
import { AppProviders } from "./providers";
import { LIGHT_THEME_ATTR, themeGuardScript } from "@/utils/theme-guard";

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
  title: "Simantrix Operations & Ecosystem Console",
  description:
    "Internal command center for Simantrix: visitor telemetry, CRM leads, Early 2027 waitlist, and multi-app orchestration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-brand="simantrix"
      data-role="simantrix"
      data-theme={LIGHT_THEME_ATTR}
      data-color-mode="light"
      data-scroll-behavior="smooth"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
      className={`${dmSans.variable} ${unbounded.variable} font-sans h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeGuardScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/common/Toast";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pircello Events",
    template: "%s | Pircello Events",
  },
  description:
    "Pircello Events — a professional event management platform for planning, managing, estimating, and delivering exceptional events.",
  applicationName: "Pircello Events",
  authors: [
    {
      name: "Pircello Events",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} bg-[#f8fbff] text-[#0f172a] antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientWrapper from "@/components/layout/ClientWrapper";

export const metadata: Metadata = {
  title: "Lucky 777 - India's No.1 Satta Matka App",
  description: "Lucky777 - Live Satta Matka results, charts, and trusted gaming platform. Free ₹100 Welcome Bonus. Download APK now.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg" },
    ],
    apple: "/favicon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lucky 777",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientWrapper from "@/components/layout/ClientWrapper";

export const metadata: Metadata = {
  title: "Lucky 777",
  description: "Live Market & Gaming Platform",
  manifest: "/manifest.webmanifest",
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

import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientWrapper from "@/components/layout/ClientWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mantri777.com'),
  title: {
    default: "Mantri777 — India's No.1 Trusted Satta Matka Platform & Results App",
    template: "%s | Mantri777",
  },
  description: "Mantri777 is India's most trusted Matka platform. Live fastest Satta Matka results, Kalyan & Milan charts, instant withdrawals, and Free ₹100 Welcome Bonus. Download official APK.",
  keywords: [
    "mantri777",
    "mantri 777",
    "satta matka",
    "kalyan matka",
    "matka results",
    "kalyan chart",
    "milan day",
    "rajdhani day",
    "main bazar",
    "satta matka app",
    "download matka apk",
    "online matka play",
  ],
  authors: [{ name: "Mantri777 Team" }],
  creator: "Mantri777",
  publisher: "Mantri777",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mantri777 — India's No.1 Trusted Satta Matka Platform",
    description: "Get the fastest live Satta Matka results, accurate Jodi charts, 100% instant payouts, and Free ₹100 Welcome Bonus. Download the Android APK.",
    url: "https://mantri777.com",
    siteName: "Mantri777",
    images: [
      {
        url: "/hero-woman.png",
        width: 1200,
        height: 630,
        alt: "Mantri777 Matka App",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mantri777 — India's No.1 Trusted Satta Matka App",
    description: "Fastest live results, Kalyan & Milan charts, and Free ₹100 Welcome Bonus.",
    images: ["/hero-woman.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.jpg", type: "image/jpeg" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mantri777",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#e22e28",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__PWA_DEFERRED_PROMPT__ = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__PWA_DEFERRED_PROMPT__ = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
              });
            `,
          }}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}

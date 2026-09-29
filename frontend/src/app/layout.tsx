import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shyamalchoudhuri.in"),
  title: "Shyamal Choudhuri (1972-2026)",
  description:
    "Interactive Clash of Clans inspired digital memorial honoring Shyamal Choudhuri (1972-2026), featuring a 3D bookshelf library, authentic voice recordings, and sacred tributes.",
  icons: {
    icon: [
      { url: "/Assets/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/Assets/favicon.png",
    apple: [
      { url: "/Assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Shyamal Choudhuri (1972-2026)",
    description: "In Loving Memory of Shyamal Choudhuri (1972-2026). An interactive Clash of Clans inspired 3D digital memorial sanctuary.",
    url: "https://shyamalchoudhuri.in",
    siteName: "Shyamal Choudhuri (1972-2026)",
    images: [
      {
        url: "/Assets/apple-touch-icon.png",
        width: 512,
        height: 512,
        alt: "Shyamal Choudhuri (1972-2026)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a12",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

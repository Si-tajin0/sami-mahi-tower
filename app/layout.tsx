import type { Metadata, Viewport } from "next"; // Viewport টাইপ যুক্ত করা হয়েছে
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileNavbar from "./components/MobileNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ১. ভিউপোর্ট এবং থিম কালার এখানে আলাদাভাবে এক্সপোর্ট করতে হবে
export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ২. মেটাডাটা থেকে themeColor এবং viewport সরিয়ে ফেলা হয়েছে
export const metadata: Metadata = {
  title: "Sami & Mahi Tower",
  description: "Modern Building Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SM Tower",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <MobileNavbar />
      </body>
    </html>
  );
}
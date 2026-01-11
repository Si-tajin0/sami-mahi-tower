import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sami & Mahi Tower",
  description: "Modern Building Management System",
  manifest: "/manifest.json", // এই লাইনটি যোগ করুন
  themeColor: "#1d4ed8",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SM Tower",
    // startupImage: [] // এখানে চাইলে স্প্ল্যাশ স্ক্রিন যোগ করা যায়
  },
  icons: {
    apple: "/apple-touch-icon.png", // অ্যাপল আইকন লিঙ্ক
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

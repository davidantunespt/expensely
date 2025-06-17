import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/Layout/AuthLayout";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Receipt & Expense Tracker",
  description: "Professional expense tracking for freelancers and gig workers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <AuthProvider>
          <OrganizationProvider>
            <AuthLayout>
              {children}
            </AuthLayout>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

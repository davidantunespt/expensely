import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShadcnAuthLayout } from "@/components/Layout/ShadcnAuthLayout";
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
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-100`}
      >
        <AuthProvider>
          <OrganizationProvider>
            <ShadcnAuthLayout>
              {children}
            </ShadcnAuthLayout>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

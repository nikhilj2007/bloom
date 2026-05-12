import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ProfileProvider } from "@/context/ProfileContext";
import { PlaidProvider } from "@/context/PlaidContext";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorthWise — Build Your Financial Confidence",
  description:
    "Connect your Fidelity accounts, track your net worth, and see how your investments compound into your dream career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${syne.variable} ${jakarta.variable} ${jetbrainsMono.variable} antialiased`}
        >
          <ProfileProvider>
            <PlaidProvider>
              {children}
            </PlaidProvider>
          </ProfileProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

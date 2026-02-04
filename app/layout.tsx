import type { Metadata } from "next";
import { Geist, Geist_Mono, Architects_Daughter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
// import { AuthProvider } from "@/lib/providers/auth-provider";
const architectsDaughter = Architects_Daughter({
  variable: "--font-architects",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Income Calculator",
  description:
    "Track your tutoring lessons and calculate income by week and month",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${architectsDaughter.variable} antialiased`}
      >
        {/* <AuthProvider> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}

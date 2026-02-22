import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UNO — Play Online",
  description: "Play UNO online with friends or against AI. No account needed.",
  icons: {
    icon: "/uno-icon.png",
    apple: "/uno-icon.png",
  },
  openGraph: {
    title: "UNO — Play Online",
    description: "Play UNO online with friends or against AI. No account needed.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--bg-surface)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            },
          }}
        />
      </body>
    </html>
  );
}

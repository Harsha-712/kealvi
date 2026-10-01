import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kealvi – Live Q&A & Polling",
  description:
    "AI-powered live Q&A and polling platform for interactive discussions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
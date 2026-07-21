import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sydora AI OS",
  description: "Enterprise AI Marketing Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
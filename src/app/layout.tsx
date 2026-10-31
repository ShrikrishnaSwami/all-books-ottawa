import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "All Books — Rideau Street's Living Archive",
  description:
    "A second-hand bookstore packed floor-to-ceiling on Rideau Street in Ottawa. Come for the hunt. Leave with a story.",
  metadataBase: new URL("https://allbooksottawa.ca"),
  openGraph: {
    title: "All Books — Rideau Street's Living Archive",
    description: "A little chaos. A lot of books. 327 Rideau Street, Ottawa.",
    type: "website",
    locale: "en_CA",
  },
};

export const viewport: Viewport = {
  themeColor: "#10100f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Books — Rideau Street's Living Archive",
  description:
    "A second-hand bookstore packed floor-to-ceiling on Rideau Street in Ottawa. Come for the hunt. Leave with a story.",
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
      <body>{children}</body>
    </html>
  );
}

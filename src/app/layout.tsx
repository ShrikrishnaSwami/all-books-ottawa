import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Books — Independent Bookshop on Rideau Street",
  description:
    "An independent second-hand bookshop on Rideau Street in Ottawa. Browse a changing collection of fiction, science fiction, French literature and hard-to-find books.",
  openGraph: {
    title: "All Books — Rideau Street's Living Archive",
    description: "A little bit of everything. A lot of books. 327 Rideau Street, Ottawa.",
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

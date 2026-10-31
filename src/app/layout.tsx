import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Books | Independent Second-Hand Bookshop in Ottawa",
  description:
    "Discover All Books, an independent second-hand bookshop at 327 Rideau Street in Ottawa. Explore fiction, history, philosophy, science, French literature, classics and unexpected finds.",
  openGraph: {
    title: "All Books | Independent Second-Hand Bookshop in Ottawa",
    description:
      "A compact, characterful second-hand bookshop on Rideau Street, filled with well-loved books, unexpected discoveries and hard-to-find titles.",
    type: "website",
    locale: "en_CA",
  },
};

export const viewport: Viewport = {
  themeColor: "#17130f",
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

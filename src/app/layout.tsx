import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { Nav } from "@/components/ui/Nav";
import { CartToast } from "@/components/ui/CartToast";
import "./globals.css";

/** Display grotesk: Archivo variable (wdth+wght axes) stands in for
 * PP Neue Montreal / Söhne Breit until licensing lands (build spec §1). */
const archivo = localFont({
  src: "../fonts/archivo-variable.woff2",
  variable: "--font-archivo",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deskpaws.example.com"),
  title: "DeskPaws — Your cat stays close. Your desk stays calm.",
  description:
    "The plush basket that clamps to your desk — so nobody sits on the keyboard. Holds 22 kg, fits edges 20–75 mm, tool-free. Ships in 48h, 30-day home trial.",
  openGraph: {
    title: "DeskPaws — Your cat stays close. Your desk stays calm.",
    description:
      "The plush basket that clamps to your desk — so nobody sits on the keyboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="grain">
        <a
          href="#product-cta"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bone"
        >
          Skip to buy
        </a>
        <Nav />
        {children}
        <CartToast />
      </body>
    </html>
  );
}

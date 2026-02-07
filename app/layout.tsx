import type { Metadata } from "next";
import { Space_Grotesk, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart-context";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-heading",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bryt Designs Frontend Challenge",
  description:
    "A frontend challenge created by Bryt Designs for a potential frontend developer position.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${jost.className} ${jost.variable} ${spaceGrotesk.variable} bg-white text-black dark:bg-black dark:text-white`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

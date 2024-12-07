import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { AppProvider } from "./context/AppContext";
import "./globals.css";
import { Providers } from "./Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Liquid.Ai",
  description: "Liquid.Ai",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const wagmiCookie = (await headers()).get("cookie");
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/liquid-ai.svg" />
        <title>Liquid.Ai</title>
        <meta name="description" content="Liquid.Ai" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers wagmiCookie={wagmiCookie}>
          <AppProvider>{children}</AppProvider>
        </Providers>
      </body>
    </html>
  );
}

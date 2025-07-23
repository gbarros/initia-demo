import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";
import { montserrat } from "./fonts";

export const metadata: Metadata = {
  title: "Camp Mamo T-Shirt Shop",
  description: "A demo e-commerce site for Camp Mamo T-Shirts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className="bg-gray-100 min-h-screen flex flex-col font-montserrat">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

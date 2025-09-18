import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Just Pick 3 - Agile Story Point Poker",
  description: "Simple and effective story point estimation for agile teams",
  icons: {
    icon: "/three-clubs_6770263.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
        try {
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        } catch(e) {}
      })();
      `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 dark:bg-gray-900">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

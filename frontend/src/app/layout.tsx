import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactCTA from "@/components/layout/ContactCTA";
import Analytics from "@/components/layout/Analytics";
import { fetchCategories } from "@/lib/strapi";
import type { Category } from "@/types";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Линейные системы — промышленная механика HIWIN",
    template: "%s | Линейные системы",
  },
  description:
    "Промышленная механика со склада в России: HIWIN, Rosca, Delta, Estun. Направляющие, ШВП, актуаторы, сервопривод. Цены, наличие, техподдержка.",
  metadataBase: new URL("https://linear-tech.ru"),
  openGraph: {
    title: "Линейные системы — промышленная механика HIWIN",
    description:
      "Промышленная механика со склада в России: HIWIN, Rosca, Delta, Estun.",
    locale: "ru_RU",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {}
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <ContactCTA />
        <Footer categories={categories} />
        <Analytics />
      </body>
    </html>
  );
}

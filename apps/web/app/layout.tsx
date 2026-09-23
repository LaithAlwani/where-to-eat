import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, El_Messiri } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Toaster } from "@/components/ui/Toaster";
import { getToken } from "@/lib/auth-server";
import "./globals.css";

// Body: IBM Plex Sans Arabic (highly readable). Headings: Tajawal (geometric, bold).
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "وين ناكل",
  description: "اكتشف أحلى المطاعم والكافيهات حواليك في سوريا",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialToken = await getToken();
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${ibmPlexArabic.variable} ${elMessiri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider initialToken={initialToken}>
          <ToastProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Toaster />
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

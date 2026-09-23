import type { Metadata } from "next";
import { Cairo, Almarai } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Toaster } from "@/components/ui/Toaster";
import { getToken } from "@/lib/auth-server";
import "./globals.css";

// Headings: Cairo (bold, geometric). Body: Almarai (clean Arabic text).
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "وين ناكل",
  description: "اكتشف أحلى المطاعم والكافيهات حواليك في سوريا",
};

// Apply the saved theme before paint (default dark) to avoid a flash.
const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialToken = await getToken();
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} ${almarai.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,700,1,0&display=swap"
        />
      </head>
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

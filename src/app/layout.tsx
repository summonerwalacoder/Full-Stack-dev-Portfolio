import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari, Geist } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500"],
  variable: "--font-deva",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sumit-sharma.dev"),
  title: {
    default: "Sumit Kumar Sharma — Portfolio",
    template: "%s — Sumit Kumar Sharma",
  },
  description:
    "Portfolio of Sumit Kumar Sharma, a Computer Science Engineering student specialising in Artificial Intelligence at Invertis University. Projects, skills, and learning journey.",
  openGraph: {
    title: "Sumit Kumar Sharma — Portfolio",
    description:
      "Computer Science Engineering | Artificial Intelligence. Curious by nature. Building by practice.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1C",
  width: "device-width",
  initialScale: 1,
};

const earlyLocaleScript = `(function(){try{var s=localStorage.getItem("sumit.lang");if(!s)return;var g={en:"latin",es:"latin",fr:"latin",de:"latin",hi:"devanagari",mr:"devanagari",ne:"devanagari",ja:"japanese",bn:"bengali",as:"assamese",ta:"tamil",te:"telugu",gu:"gujarati",kn:"kannada",ml:"malayalam",or:"oriya",pa:"gurmukhi",ur:"arabic",sd:"arabic"};if(!g[s])return;document.documentElement.lang=s;document.documentElement.dir=(s==="ur"||s==="sd")?"rtl":"ltr";document.documentElement.dataset.locale=s;document.documentElement.dataset.script=g[s];}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyLocaleScript }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${deva.variable} font-body antialiased`}
      >
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

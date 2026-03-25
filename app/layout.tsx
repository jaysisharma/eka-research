import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { SITE, SITE_URL } from "@/lib/constants";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "space research Nepal",
    "astronomy Nepal",
    "astrophysics",
    "science outreach",
    "Eka Research",
    "Kathmandu science",
    "space science students",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,

  /* Canonical + alternates */
  alternates: {
    canonical: SITE_URL,
  },

  /* Open Graph — image auto-served by app/opengraph-image.tsx */
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    locale: "en_US",
  },

  /* Twitter / X — image inherited from OG */
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    // creator: "@ekaresearch",  ← add when you have a handle
  },

  /* Indexing */
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* Verification — add tokens from Search Console / Bing Webmaster */
  verification: {
    // google: "your-google-site-verification-token",
    // other: { "msvalidate.01": ["your-bing-token"] },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={dmSans.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('eka-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
        <JsonLd />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// import "./globals.css";
// import { Inter } from "next/font/google";
// import { Providers } from "@/app/providers";
// import { Toaster } from "sonner";
// import { GymThemeProvider } from "@/components/GymThemeProvider";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Gym Management System",
//   description: "Manage gyms and members",
//   manifest: "/manifest.json",
//   appleWebApp: { capable: true, statusBarStyle: "default", title: "Gym Manager" },
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="apple-touch-icon" href="/icon-192.png" />
//         <meta name="mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//       </head>
//       <body className={inter.className}>
//         <Providers>
//           <GymThemeProvider>
//             {children}
//           </GymThemeProvider>
//         </Providers>
//         <Toaster position="top-right" richColors />
//       </body>
//     </html>
//   );
// }



import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import { Toaster } from "sonner";
import { GymThemeProvider } from "@/components/GymThemeProvider";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://www.managegym24.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Core SEO ──────────────────────────────────────────────────────────────
  title: {
    default: "ManageGym24 – Gym Management Software for India | WhatsApp & Biometric",
    template: "%s | ManageGym24",
  },
  description:
    "ManageGym24 is India's #1 gym management software. Automate WhatsApp reminders, biometric access, fee collection, member management & analytics. Start free for 30 days.",
  keywords: [
    "gym management software India",
    "gym management system",
    "gym billing software",
    "WhatsApp gym reminders",
    "biometric gym access",
    "gym member management",
    "fitness studio software",
    "gym fee management",
    "gym attendance tracking",
    "ManageGym24",
  ],
  authors: [{ name: "ManageGym24", url: BASE_URL }],
  creator: "ManageGym24",
  publisher: "ManageGym24",
  category: "Business Software",

  // ── Canonical & Robots ───────────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph (Facebook / LinkedIn / WhatsApp preview) ──────────────────
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "ManageGym24",
    title: "ManageGym24 – Gym Management Made Simple. Built for India.",
    description:
      "One platform for members, billing, attendance, WhatsApp automation & biometric access. Trusted by 500+ gyms across India. Free 30-day trial.",
    images: [
      {
        url: "/og-image.png",           // ← place a 1200×630 branded image here
        width: 1200,
        height: 630,
        alt: "ManageGym24 – Gym Management Software Dashboard",
      },
    ],
    locale: "en_IN",
  },

  // ── Twitter / X Card ─────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "ManageGym24 – Gym Management Made Simple. Built for India.",
    description:
      "WhatsApp reminders, biometric access, fee management & analytics — all in one platform for Indian gym owners.",
    images: ["/og-image.png"],
    // creator: "@ManageGym24",   ← uncomment if you have a Twitter handle
  },

  // ── Favicon / Icons ──────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  // ── PWA / Manifest ───────────────────────────────────────────────────────
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ManageGym24",
  },

  // ── Verification (add your codes when ready) ─────────────────────────────
  // verification: {
  //   google: "YOUR_GOOGLE_SEARCH_CONSOLE_CODE",
  //   other: { "msvalidate.01": "YOUR_BING_CODE" },
  // },
};

// ── JSON-LD Structured Data ──────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "ManageGym24",
      url: BASE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      description:
        "India's gym management platform with WhatsApp automation, biometric access, fee collection, member management and real-time analytics.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: "999",
        highPrice: "7999",
        offerCount: "3",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "500",
      },
    },
    {
      "@type": "Organization",
      name: "ManageGym24",
      url: BASE_URL,
      logo: `${BASE_URL}/icon-512.png`,
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      url: BASE_URL,
      name: "ManageGym24",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Additional mobile / PWA meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ManageGym24" />
        <meta name="application-name" content="ManageGym24" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Theme colour for browser chrome */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />

        {/* Geo targeting for India */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
      </head>
      <body className={inter.className}>
        <Providers>
          <GymThemeProvider>
            {children}
          </GymThemeProvider>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
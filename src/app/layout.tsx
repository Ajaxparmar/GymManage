import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import { Toaster } from "sonner";
import { GymThemeProvider } from "@/components/GymThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gym Management System",
  description: "Manage gyms and members",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Gym Manager" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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
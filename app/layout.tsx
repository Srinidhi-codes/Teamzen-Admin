import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teamzen Admin",
  description: "Payroll and workforce administration for Teamzen",
};

/** Runs before paint to avoid theme/accent flash after login. */
const THEME_BOOT_SCRIPT = `
(function() {
  try {
    var root = document.documentElement;
    var storage = localStorage.getItem('payroll-app-storage');
    var accent = 'teal';
    if (storage) {
      var parsed = JSON.parse(storage);
      var state = parsed && parsed.state;
      if (state && state.accent) accent = state.accent;
      else if (state && state.user && state.user.organization && state.user.organization.accent) {
        accent = state.user.organization.accent;
      }
      var org = state && state.user && state.user.organization;
      var plan = org && (org.plan || '').toLowerCase();
      var expires = org && (org.planExpiresAt || org.plan_expires_at);
      var paid = plan === 'pro' || plan === 'elite';
      if (paid && expires) {
        var end = new Date(expires);
        if (!isNaN(end.getTime())) {
          var today = new Date();
          today.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          if (end < today) paid = false;
        }
      }
      if (!paid) accent = 'teal';
    }
    root.setAttribute('data-accent', accent);

    var theme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || ((theme === 'system' || !theme) && prefersDark);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.setAttribute('data-accent', 'teal');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollbarGutter: "stable" }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import en from "@messages/en.json";
import { getContent } from "@/lib/content";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: en.meta.title, template: "%s | Biruk Belete" },
  description: en.meta.description,
  openGraph: { title: en.meta.title, description: en.meta.description, type: "profile", siteName: "Biruk Belete" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#080d12", width: "device-width", initialScale: 1 };

/** "#2dd4bf" -> "45 212 191" so Tailwind can apply alpha to theme colours. */
function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { theme } = await getContent();
  const style = { "--accent": rgb(theme.accent), "--accent2": rgb(theme.accent2) } as CSSProperties;
  return (
    <html lang="en" style={style}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}

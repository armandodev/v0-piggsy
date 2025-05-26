import { defaultMetadata } from "@/utils/metadata";
import { ThemeProvider } from "next-themes";
import { Onest } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

const onest = Onest({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={onest.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCLRA Thrissur",
  description: "Museum Cross Lane Resident's Association, Chembukkavu - Resident Directory Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[--background] text-[--foreground]`}>
        <nav className="sticky top-0 z-40 bg-[--card]/90 backdrop-blur-xl border-b border-[--border]">
          <div className="container mx-auto px-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-[--primary] text-white flex items-center justify-center font-bold">M</div>
                <span className="text-sm md:text-base font-semibold">Museum Cross Lane Residents Association</span>
              </div>
              <div className="flex items-center gap-4 text-xs md:text-sm text-[--muted-foreground]">
                <Link href="/houses" className="hover:text-[--foreground] transition-colors">Directory</Link>
                <Link href="/addhome" className="hover:text-[--foreground] transition-colors">Add Home</Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

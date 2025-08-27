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
        <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-[--border] bg-[--card]/90">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-12 sm:h-14 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-[--primary] text-white flex items-center justify-center font-bold text-xs">M</div>
                <span className="text-[11px] sm:text-sm md:text-base font-semibold">Museum Cross Lane Residents Association</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-[--muted-foreground]">
                <Link href="/houses" className="hover:text-[--foreground] transition-colors">Directory</Link>
                <Link href="/addhome" className="hover:text-[--foreground] transition-colors">Add Home</Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="min-h-screen">
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
            {children}
          </div>
        </div>
        <footer className="border-t border-[--border] backdrop-blur-xl bg-[--card]/80">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-sm text-[--muted-foreground]">© {new Date().getFullYear()} MCLRA. All rights reserved.</p>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/houses" className="hover:underline">Directory</Link>
                <Link href="#" className="hover:underline">Privacy</Link>
                <Link href="#" className="hover:underline">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/contexts";

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
      <body className={`min-h-screen bg-[#f8fafc] text-[#1e293b]`}>
        <nav className="sticky top-0 z-40 bg-[#1e293b] border-b border-[#334155] shadow-lg">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-14 sm:h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[#334155] flex items-center justify-center font-bold text-[#e2e8f0] text-sm sm:text-base shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
                  M
                </div>
                <span className="text-[#e2e8f0] text-sm sm:text-base font-semibold tracking-tight">
                  Museum Cross Lane Residents Association
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  href="/houses" 
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-[#334155] text-[#e2e8f0] hover:bg-[#475569] transition-all rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
                >
                  Directory
                </Link>
                <Link 
                  href="/addhome" 
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-[#334155] text-[#e2e8f0] hover:bg-[#475569] transition-all rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
                >
                  Add Home
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <AuthProvider>
          <div className="min-h-screen">
            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
              {children}
            </div>
          </div>
        </AuthProvider>
        <footer className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-600">© {new Date().getFullYear()} MCLRA. All rights reserved.</p>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/houses" className="hover:underline text-gray-600 hover:text-[#4f46e5]">Directory</Link>
                <Link href="#" className="hover:underline text-gray-600 hover:text-[#4f46e5]">Privacy</Link>
                <Link href="#" className="hover:underline text-gray-600 hover:text-[#4f46e5]">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/contexts";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MCLRA Thrissur",
  description:
    "Museum Cross Lane Resident's Association, Chembukkavu - Resident Directory Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            <div className="container mx-auto px-4 py-6">{children}</div>
          </main>
        </AuthProvider>
        <footer className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} MCLRA. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Link
                  href="/houses"
                  className="hover:underline text-gray-600 hover:text-[#4f46e5]"
                >
                  Directory
                </Link>
                <Link
                  href="#"
                  className="hover:underline text-gray-600 hover:text-[#4f46e5]"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="hover:underline text-gray-600 hover:text-[#4f46e5]"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

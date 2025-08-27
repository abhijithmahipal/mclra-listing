import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCLRA Directory",
  description: "MCLRA Resident Directory Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-gray-50`}>
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">MCLRA Directory</h1>
              <div className="text-sm">
                Museum Cross Lane Residents Association
              </div>
            </div>
          </div>
        </nav>
        <div className="min-h-screen pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}

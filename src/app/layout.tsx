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
      <body className={`min-h-screen bg-[--background] text-[--foreground]`}>
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/10 dark:bg-white/10 border-b border-[--border] text-[--foreground]">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold">MCLRA Directory</h1>
              <div className="text-xs md:text-sm text-[--muted-foreground]">
                Museum Cross Lane Residents Association
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

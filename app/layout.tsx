

import "./globals.css";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body>
        <Sidebar />
        <main className="ml-72 min-h-screen bg-slate-50 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
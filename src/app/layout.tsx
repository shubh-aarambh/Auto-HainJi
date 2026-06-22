import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";
import { CommandMenu } from "@/components/ui/CommandMenu";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auto-HainJi – Website Automation Agent",
  description: "Advanced browser automation agent driven by visual and selector rankers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#0a0a0a]" suppressHydrationWarning>
      <body className={`${outfit.className} flex flex-col min-h-screen text-zinc-100 overflow-hidden bg-[#0a0a0a] relative`} suppressHydrationWarning>
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-0 pb-28">
          {/* Subtle noise/grid could go here, but keeping it clean and minimal for eye comfort */}
          
          <div className="p-8 flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </div>
        </main>
        
        {/* Floating Bottom Dock Container */}
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <Sidebar />
          </div>
        </div>

        <CommandMenu />
      </body>
    </html>
  );
}

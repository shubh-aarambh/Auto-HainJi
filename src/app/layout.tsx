import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";
import { CommandMenu } from "@/components/ui/CommandMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoPilot AI – Website Automation Agent",
  description: "Advanced browser automation agent driven by visual and selector rankers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#09090B]" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen text-zinc-100 overflow-hidden`} suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#09090B] relative">
          <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-fuchsia-600/5 blur-[100px]" />
          
          <div className="p-8 flex-1">
            {children}
          </div>
        </main>
        <CommandMenu />
      </body>
    </html>
  );
}

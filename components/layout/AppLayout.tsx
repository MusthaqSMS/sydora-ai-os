import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0B0B0D] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0B0B0D] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
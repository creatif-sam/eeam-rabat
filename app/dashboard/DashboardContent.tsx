"use client";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSidebar } from "@/components/dashboard/SidebarContext";

export default function DashboardContent({
  children,
  user
}: {
  children: React.ReactNode;
  user: any;
}) {
  const { isDesktopExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className={`transition-all duration-300 ${
        isDesktopExpanded ? 'md:ml-72' : 'md:ml-20'
      }`}>
        <Header user={user} />
        <main className="p-4 md:p-8 pt-16 md:pt-8">{children}</main>
      </div>
    </div>
  );
}
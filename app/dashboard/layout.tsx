import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { Suspense } from "react";
import AuthCheck from "./AuthCheck";
import DashboardContent from "./DashboardContent";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SidebarProvider>
        <AuthCheckWrapper>
          {({ user }) => (
            <DashboardContent user={user}>
              {children}
            </DashboardContent>
          )}
        </AuthCheckWrapper>
      </SidebarProvider>
    </Suspense>
  );
}

async function AuthCheckWrapper({ children }: { children: ({ user }: { user: any }) => React.ReactNode }) {
  const { user } = await AuthCheck();
  return children({ user });
}

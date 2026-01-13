import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Suspense } from "react";
import AuthCheck from "./AuthCheck";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthCheckWrapper>
        {({ user }) => (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Sidebar />
            <div className="md:ml-20">
              <Header user={user} />
              <main className="p-4 md:p-8">{children}</main>
            </div>
          </div>
        )}
      </AuthCheckWrapper>
    </Suspense>
  );
}

async function AuthCheckWrapper({ children }: { children: ({ user }: { user: any }) => React.ReactNode }) {
  const { user } = await AuthCheck();
  return children({ user });
}

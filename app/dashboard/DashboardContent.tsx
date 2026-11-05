"use client";

import Box from "@mui/material/Box";
import Header from "@/components/dashboard/Header";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import Sidebar from "@/components/dashboard/Sidebar";
import type { User } from "@supabase/supabase-js";

export default function DashboardContent({
  children,
  user,
  role
}: {
  children: React.ReactNode;
  user: User;
  role: string | null;
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Sidebar role={role} />
      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Header user={user} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, pb: { xs: 12, md: 4 } }}>
          {children}
        </Box>
      </Box>
      <MobileBottomNav role={role} />
    </Box>
  );
}

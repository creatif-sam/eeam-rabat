"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  DescriptionOutlined,
  Diversity3Outlined,
  EventAvailableOutlined,
  GroupAddOutlined,
  SupportAgentOutlined,
  VolunteerActivismOutlined,
} from "@mui/icons-material";
import { pendingCounts } from "./actions";

import PastoralCounsellingList from "@/components/dashboard/PastoralCounsellingList";
import GroupRequestsDashboard from "@/components/dashboard/GroupRequestsDashboard";
import AttendanceDashboard from "@/components/dashboard/AttendanceDashboard";
import PrayerRequestsDashboard from "@/components/dashboard/PrayerRequestsDashboard";
import VolunteerRequestsDashboard from "@/components/dashboard/VolunteerRequestsDashboard";
import CommissionRequestsDashboard from "@/components/dashboard/CommissionRequestsDashboard";

type TabKey = "attendance" | "volunteer" | "pastoral" | "group" | "prayer" | "request";

const TABS: { key: TabKey; label: string; description: string; icon: SvgIconComponent }[] = [
  { key: "attendance", label: "Assiduité aux cultes", description: "Suivi de la fréquentation des cultes", icon: EventAvailableOutlined },
  { key: "volunteer", label: "Bénévoles", description: "Personnes souhaitant servir dans un ministère", icon: Diversity3Outlined },
  { key: "pastoral", label: "Entretiens pastoraux", description: "Rendez-vous demandés avec un pasteur", icon: SupportAgentOutlined },
  { key: "group", label: "Rejoindre une commission", description: "Demandes d'adhésion aux commissions", icon: GroupAddOutlined },
  { key: "prayer", label: "Sujets de prière", description: "Demandes de prière reçues", icon: VolunteerActivismOutlined },
  { key: "request", label: "Requêtes de responsables", description: "Demandes adressées par les responsables", icon: DescriptionOutlined },
];

const isTab = (v: string | null): v is TabKey => TABS.some(t => t.key === v);

/** Pending counts shown as badges on each tab. */
function usePendingCounts() {
  const [counts, setCounts] = useState<Partial<Record<TabKey, number>>>({});

  const refresh = useCallback(async () => {
    setCounts((await pendingCounts()) as Partial<Record<TabKey, number>>);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, refresh };
}

function FormulairesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get("tab");
  const activeTab: TabKey = isTab(param) ? param : "attendance";
  const { counts, refresh } = usePendingCounts();

  const setTab = (key: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const current = TABS.find(t => t.key === activeTab)!;
  const totalPending = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Formulaires
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalPending > 0
            ? `${totalPending} demande${totalPending > 1 ? "s" : ""} en attente de traitement`
            : "Consultation et traitement des demandes"}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(_, v: TabKey) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: { xs: 0, md: 1 },
            "& .MuiTab-root": { minHeight: 60, textTransform: "none", fontWeight: 600 },
          }}
        >
          {TABS.map(t => {
            const Icon = t.icon;
            const count = counts[t.key] ?? 0;
            return (
              <Tab
                key={t.key}
                value={t.key}
                iconPosition="start"
                icon={<Icon fontSize="small" />}
                label={
                  <Badge
                    badgeContent={count}
                    color="secondary"
                    max={99}
                    sx={{ "& .MuiBadge-badge": { right: -14, top: 2 } }}
                  >
                    <span>{t.label}</span>
                  </Badge>
                }
                sx={{ pr: count ? 3.5 : 2 }}
              />
            );
          })}
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {current.description}
          </Typography>

          {activeTab === "attendance" && <AttendanceDashboard />}
          {activeTab === "volunteer" && <VolunteerRequestsDashboard onChanged={refresh} />}
          {activeTab === "pastoral" && <PastoralCounsellingList />}
          {activeTab === "group" && <GroupRequestsDashboard onChanged={refresh} />}
          {activeTab === "prayer" && <PrayerRequestsDashboard onChanged={refresh} />}
          {activeTab === "request" && <CommissionRequestsDashboard onChanged={refresh} />}
        </Box>
      </Paper>
    </Stack>
  );
}

export default function FormulairesPage() {
  return (
    <Suspense
      fallback={
        <Stack spacing={3}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 1.5 }} />
        </Stack>
      }
    >
      <FormulairesContent />
    </Suspense>
  );
}

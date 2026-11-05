"use client"

import Link from "next/link"
import Alert from "@mui/material/Alert"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import type { SvgIconComponent } from "@mui/icons-material"
import {
  AccessTime,
  ArrowForward,
  AssignmentOutlined,
  ChevronRight,
  Diversity3Outlined,
  EventBusyOutlined,
  EventOutlined,
  GroupAddOutlined,
  GroupsOutlined,
  ManageAccountsOutlined,
  PeopleAltOutlined,
  PlaceOutlined,
  PlayArrowRounded,
  ReceiptLongOutlined,
  SettingsOutlined,
  VerifiedUserOutlined,
  VolunteerActivismOutlined,
  AssessmentOutlined,
  DescriptionOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material"
import WelcomeMessageEditor from "@/components/WelcomeMessageEditor"

export type HomeStats = {
  totalMembers: number
  totalCommissions: number
  pendingLeaderRequests: number
  totalPrayerRequests: number
  pendingCounsellingRequests: number
  pendingGroupRequests: number
  pendingVolunteerRequests: number
  pendingApprovals: number
}

export type HomeFormation = {
  id: string
  title: string
  description: string | null
  image: string
  duration: string
}

export type HomeEvent = {
  title: string
  start_time: string | null
  end_time: string | null
  location: string | null
  event_date: string
}

type Tile = { label: string; desc?: string; icon: SvgIconComponent; color: string; href: string; value?: number }

/** Soft tonal icon badge (Material 3 "tonal" style). */
function TonalIcon({ icon: Icon, color, size = 44 }: { icon: SvgIconComponent; color: string; size?: number }) {
  return (
    <Avatar variant="rounded" sx={{ width: size, height: size, bgcolor: `${color}1f`, color, borderRadius: 3 }}>
      <Icon fontSize="small" />
    </Avatar>
  )
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <Stack direction="row" sx={{ mb: 2, alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {href && (
        <Button component={Link} href={href} endIcon={<ChevronRight />} size="small">
          Voir tout
        </Button>
      )}
    </Stack>
  )
}

function EmptyState({ icon: Icon, text }: { icon: SvgIconComponent; text: string }) {
  return (
    <Paper variant="outlined" sx={{ py: 5, textAlign: "center", borderRadius: 4, borderStyle: "dashed" }}>
      <Icon sx={{ color: "text.disabled", mb: 1 }} />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Paper>
  )
}

export default function DashboardHome({
  isAdmin,
  firstName,
  stats,
  formations,
  upcomingEvent,
}: {
  isAdmin: boolean
  firstName: string | null
  stats: HomeStats
  formations: HomeFormation[]
  upcomingEvent: HomeEvent | null
}) {
  const statTiles: Tile[] = [
    { label: "Membres inscrits", value: stats.totalMembers, icon: PeopleAltOutlined, color: "#0891b2", href: "/dashboard/membres" },
    { label: "Commissions", value: stats.totalCommissions, icon: GroupsOutlined, color: "#7c3aed", href: "/dashboard/groupes" },
    { label: "Requêtes responsables", value: stats.pendingLeaderRequests, icon: DescriptionOutlined, color: "#ea580c", href: "/dashboard/formulaires?tab=request" },
    { label: "Sujets de prière", value: stats.totalPrayerRequests, icon: VolunteerActivismOutlined, color: "#e11d48", href: "/dashboard/formulaires?tab=prayer" },
    { label: "Entretiens pastoraux", value: stats.pendingCounsellingRequests, icon: SupportAgentOutlined, color: "#0d9488", href: "/dashboard/formulaires?tab=pastoral" },
    { label: "Rejoindre commission", value: stats.pendingGroupRequests, icon: GroupAddOutlined, color: "#4f46e5", href: "/dashboard/formulaires?tab=group" },
    { label: "Bénévoles en attente", value: stats.pendingVolunteerRequests, icon: Diversity3Outlined, color: "#16a34a", href: "/dashboard/formulaires?tab=volunteer" },
  ]

  const quickActions: Tile[] = [
    { label: "Gérer les utilisateurs", icon: ManageAccountsOutlined, href: "/dashboard/users", color: "#e11d48" },
    { label: "Journal d'activité", icon: ReceiptLongOutlined, href: "/dashboard/logs", color: "#7c3aed" },
    { label: "Paramètres", icon: SettingsOutlined, href: "/dashboard/settings", color: "#475569" },
    { label: "Membres", icon: PeopleAltOutlined, href: "/dashboard/membres", color: "#0891b2" },
  ]

  const memberLinks: Tile[] = [
    { label: "Événements", desc: "Voir les prochains événements", icon: EventOutlined, href: "/dashboard/events", color: "#e11d48" },
    { label: "Formulaires", desc: "Soumettre une demande", icon: AssignmentOutlined, href: "/dashboard/formulaires", color: "#0d9488" },
    { label: "Rapports", desc: "Consulter les rapports", icon: AssessmentOutlined, href: "/dashboard/rapports", color: "#7c3aed" },
  ]

  return (
    <Stack spacing={4}>
      {/* Welcome banner */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 5,
          p: { xs: 3, md: 5 },
          color: "#fff",
          background: "linear-gradient(135deg, #0891b2 0%, #2563eb 55%, #4338ca 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ position: "relative", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontWeight: 500 }}>
              Bon retour parmi nous{firstName ? `, ${firstName}` : ""} !
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mb: 1.5, fontSize: { xs: 26, md: 34 } }}>
              {isAdmin ? "Espace Administration" : "Espace Membre"}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 640 }}>
              {isAdmin
                ? "Gestion et supervision de l'église — Tableau de bord des leaders"
                : "Bienvenue dans votre espace personnel. Accédez à vos activités et ressources."}
            </Typography>
          </Box>
          {isAdmin && <WelcomeMessageEditor />}
        </Stack>
      </Paper>

      {isAdmin ? (
        <>
          {stats.pendingApprovals > 0 && (
            <Alert
              severity="warning"
              icon={<VerifiedUserOutlined />}
              variant="outlined"
              sx={{ borderRadius: 3, alignItems: "center" }}
              action={
                <Button component={Link} href="/dashboard/users" color="warning" endIcon={<ArrowForward />}>
                  Examiner
                </Button>
              }
            >
              <Typography sx={{ fontWeight: 600 }}>
                {stats.pendingApprovals} compte{stats.pendingApprovals > 1 ? "s" : ""} en attente d&apos;approbation
              </Typography>
              <Typography variant="body2">Approuvez ou rejetez ces comptes.</Typography>
            </Alert>
          )}

          {/* Stats */}
          <Grid container spacing={2}>
            {statTiles.map((stat) => (
              <Grid key={stat.label} size={{ xs: 6, md: 4, lg: 3, xl: "grow" }}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea component={Link} href={stat.href} sx={{ height: "100%" }}>
                    <CardContent>
                      <TonalIcon icon={stat.icon} color={stat.color} />
                      <Typography variant="h5" sx={{ mt: 2 }}>
                        {(stat.value ?? 0).toLocaleString("fr-FR")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick actions */}
          <Box>
            <SectionHeader title="Actions rapides" />
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid key={action.label} size={{ xs: 6, md: 3 }}>
                  <Card sx={{ height: "100%" }}>
                    <CardActionArea component={Link} href={action.href} sx={{ height: "100%" }}>
                      <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 3 }}>
                        <TonalIcon icon={action.icon} color={action.color} size={52} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }} align="center">
                          {action.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Formations */}
          <Box>
            <SectionHeader title="Formations en cours" href="/dashboard/formations" />
            {formations.length > 0 ? (
              <Grid container spacing={3}>
                {formations.map((f) => (
                  <Grid key={f.id} size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: "100%" }}>
                      <CardActionArea component={Link} href="/dashboard/formations" sx={{ height: "100%" }}>
                        <Box sx={{ position: "relative", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <CardMedia component="img" height={180} image={f.image} alt={f.title} />
                          <Chip
                            label="Formation"
                            size="small"
                            sx={{ position: "absolute", top: 12, left: 12, bgcolor: "background.paper", fontWeight: 600 }}
                          />
                        </Box>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                            {f.title}
                          </Typography>
                          {f.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                            >
                              {f.description}
                            </Typography>
                          )}
                          <Chip icon={<AccessTime />} label={f.duration} size="small" variant="outlined" />
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyState icon={EventOutlined} text="Aucune formation active" />
            )}
          </Box>
        </>
      ) : (
        <>
          {/* Member shortcuts */}
          <Grid container spacing={2}>
            {memberLinks.map((item) => (
              <Grid key={item.label} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea component={Link} href={item.href} sx={{ height: "100%" }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <TonalIcon icon={item.icon} color={item.color} size={48} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }}>{item.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.desc}
                        </Typography>
                      </Box>
                      <ChevronRight color="action" />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Upcoming event */}
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>
                <TonalIcon icon={upcomingEvent ? EventOutlined : EventBusyOutlined} color="#e11d48" size={56} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Chip label="Prochain événement" color="secondary" size="small" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }} />
                  {upcomingEvent ? (
                    <>
                      <Typography variant="h5" gutterBottom>
                        {upcomingEvent.title}
                      </Typography>
                      <Stack direction="row" useFlexGap spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
                        <Chip icon={<AccessTime />} size="small" label={`${upcomingEvent.start_time ?? ""} - ${upcomingEvent.end_time ?? ""}`} />
                        {upcomingEvent.location && <Chip icon={<PlaceOutlined />} size="small" label={upcomingEvent.location} />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: "capitalize" }}>
                        {new Date(upcomingEvent.event_date).toLocaleString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                      <Button component={Link} href="/dashboard/events" variant="contained" color="secondary">
                        Voir tous les événements
                      </Button>
                    </>
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      Aucun événement à venir
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Formations */}
          <Box>
            <SectionHeader title="Formations disponibles" href="/dashboard/formations" />
            {formations.length > 0 ? (
              <Grid container spacing={2}>
                {formations.map((f, i) => (
                  <Grid key={f.id} size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardActionArea component={Link} href="/dashboard/formations">
                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <TonalIcon icon={PlayArrowRounded} color={i === 0 ? "#e11d48" : "#7c3aed"} size={48} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600 }} noWrap>
                              {f.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {f.duration}
                            </Typography>
                          </Box>
                          <ChevronRight color="action" />
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyState icon={EventOutlined} text="Aucune formation active" />
            )}
          </Box>
        </>
      )}
    </Stack>
  )
}

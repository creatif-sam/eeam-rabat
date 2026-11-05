import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function DashboardLoading() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" sx={{ height: { xs: 160, md: 208 }, borderRadius: 4 }} />

      <Grid container spacing={2}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, md: 4, lg: 3, xl: "grow" }}>
            <Skeleton variant="rounded" height={112} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={192} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={192} sx={{ borderRadius: 4 }} />
        </Grid>
      </Grid>
    </Stack>
  );
}

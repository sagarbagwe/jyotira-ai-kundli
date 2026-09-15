import { AppShell } from "@/components/app/app-shell";
import { ChartGallery } from "@/components/charts/chart-gallery";
import { getDemoArtifact } from "@/lib/demo";

export const metadata = { title: "Charts" };

export default async function ChartsPage() {
  const { chart } = await getDemoArtifact();
  return (
    <AppShell
      title="Divisional charts"
      description="Inspect D1 through D60 using disclosed Parashari mappings. Birth-time-sensitive charts are gated by accuracy."
    >
      <ChartGallery chart={chart} />
    </AppShell>
  );
}
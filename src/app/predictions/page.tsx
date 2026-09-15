import { AppShell } from "@/components/app/app-shell";
import { TransitPlanner } from "@/components/report/transit-planner";
import { getDemoArtifact } from "@/lib/demo";

export const metadata = { title: "Predictions & Transits" };

export default async function PredictionsPage() {
  const artifact = await getDemoArtifact();
  return (
    <AppShell
      title="Dasha + transit planner"
      description="Calculate past, current or future gochar positions, then request a carefully qualified traditional interpretation."
    >
      <TransitPlanner reportId="demo" chart={artifact.chart} />
    </AppShell>
  );
}
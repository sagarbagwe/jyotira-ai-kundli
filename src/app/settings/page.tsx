import { AppShell } from "@/components/app/app-shell";
import { SettingsForm } from "@/components/forms/settings-form";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Manage display preferences and review the calculation methodology."
    >
      <SettingsForm />
    </AppShell>
  );
}
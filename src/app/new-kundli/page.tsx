import { AppShell } from "@/components/app/app-shell";
import { ResilientKundliForm } from "@/components/forms/resilient-kundli-form";

export const metadata = {
  title: "New Kundli",
  description: "Generate a calculated Kundli and Gemini interpretation without an account or database.",
};

export default function NewKundliPage() {
  return (
    <AppShell
      title="Create a new Kundli"
      description="Calculated astrology and Gemini interpretation, kept only in your browser session."
    >
      <ResilientKundliForm />
    </AppShell>
  );
}

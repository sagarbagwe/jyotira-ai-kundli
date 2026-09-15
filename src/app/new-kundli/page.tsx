import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { NewKundliForm } from "@/components/forms/new-kundli-form";

export const metadata = {
  title: "New Kundli",
  description: "Enter or upload birth information to generate a calculated Kundli.",
};

export default function NewKundliPage() {
  return (
    <AppShell
      title="Create a new Kundli"
      description="Exact astronomical calculations first, grounded AI interpretation second."
    >
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-[12px] border border-line bg-surface" />
        }
      >
        <NewKundliForm />
      </Suspense>
    </AppShell>
  );
}
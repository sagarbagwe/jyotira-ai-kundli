import { Compass } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/app/brand";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="app-background grid min-h-screen place-items-center px-4">
      <Card className="surface-card w-full max-w-lg p-8 text-center">
        <Brand className="justify-center" />
        <Compass className="mx-auto mt-8 size-10 text-primary" />
        <p className="mt-5 text-xs font-bold tracking-[.16em] text-muted uppercase">
          404
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold">
          This chart could not be found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The report may be private, the share link may be disabled, or the
          address may be incorrect.
        </p>
        <Link href="/dashboard" className={`${buttonStyles()} mt-6`}>
          Return to dashboard
        </Link>
      </Card>
    </div>
  );
}
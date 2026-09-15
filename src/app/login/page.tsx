import { Code2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { signIn } from "@/auth";
import { Brand } from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  const googleEnabled = Boolean(
    env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET,
  );
  const githubEnabled = Boolean(
    env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET,
  );

  return (
    <div className="app-background grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 flex items-center justify-between">
          <Brand />
          <ThemeToggle />
        </div>
        <Card className="surface-card p-6 sm:p-8">
          <Badge tone="positive">
            <LockKeyhole className="size-3.5" />
            Secure authentication
          </Badge>
          <h1 className="font-display mt-5 text-3xl font-semibold">
            Welcome to Jyotira
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in to keep birth profiles, reports and uploaded Kundli files
            private.
          </p>

          <div className="mt-7 space-y-3">
            {googleEnabled && (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className={`${buttonStyles({ variant: "secondary", size: "lg" })} w-full`}
                >
                  <span className="grid size-5 place-items-center rounded-full border border-line font-bold text-primary">
                    G
                  </span>
                  Continue with Google
                </button>
              </form>
            )}
            {githubEnabled && (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className={`${buttonStyles({ variant: "secondary", size: "lg" })} w-full`}
                >
                  <Code2 className="size-5" />
                  Continue with GitHub
                </button>
              </form>
            )}
          </div>

          {!googleEnabled && !githubEnabled && (
            <div className="mt-6 rounded-[10px] border border-attention/25 bg-attention-soft p-4 text-sm leading-6 text-attention">
              OAuth providers are not configured. Local DEMO_MODE can still
              open the product showcase; production requires Google or GitHub
              credentials.
            </div>
          )}

          {env.DEMO_MODE && (
            <Link
              href="/dashboard"
              className={`${buttonStyles({ size: "lg" })} mt-6 w-full`}
            >
              Open demo workspace
            </Link>
          )}
          <p className="mt-5 text-center text-xs leading-5 text-muted">
            By continuing, you agree to keep reports private and acknowledge
            the astrology disclaimer.
          </p>
        </Card>
        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-muted hover:text-foreground"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
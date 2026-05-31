import { GitBranch, Info, ShieldAlert, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero Welcome Card */}
      <section className="mb-8 border-4 border-border bg-main p-6 shadow-shadow text-main-foreground">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-3xl font-heading uppercase tracking-wide">
            My Finance Tracker
          </h1>
        </div>
        <p className="text-lg font-base leading-relaxed max-w-2xl">
          An open, local-first finance visualizer built without bloat. Take back
          control of your capital, track offline assets, bonds, stocks, and
          liquidity profiles through hard financial geometry.
        </p>
      </section>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Columns - Philosophy & Core Rules */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Card 1: Features & Capabilities */}
          <div className="border-4 border-border bg-secondary-background p-6 shadow-shadow">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-border pb-2">
              <Info className="h-5 w-5" />
              <h2 className="text-xl font-heading uppercase">
                Supported Portfolios
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-base">
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 bg-chart-1 border-2 border-border" />
                {" "}
                Liquid Accounts
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 bg-chart-2 border-2 border-border" />
                {" "}
                Mutual Funds & Stocks
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 bg-chart-3 border-2 border-border" />
                {" "}
                Fixed Deposits & Bonds
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 bg-chart-4 border-2 border-border" />
                {" "}
                Credit Extensions
              </li>
            </ul>
          </div>

          {/* Card 2: Security & Privacy */}
          <div className="border-4 border-border bg-secondary-background p-6 shadow-shadow">
            <div className="flex items-center gap-2 mb-3 text-chart-4">
              <ShieldAlert className="h-6 w-6" />
              <h2 className="text-xl font-heading uppercase text-foreground">
                Zero-Trust Environment
              </h2>
            </div>
            <p className="font-base leading-relaxed text-sm">
              Your numbers are your business. This app reads data directly from
              your local state setup. No trackers. No third-party data farms.
              Everything stays wrapped locally in your client environment.
            </p>
          </div>
        </div>

        {/* Right Column - Project Telemetry */}
        <div className="flex flex-col gap-6">
          <div className="border-4 border-border bg-secondary-background p-6 shadow-shadow flex-1">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-border pb-2">
              <GitBranch className="h-5 w-5" />
              <h2 className="text-xl font-heading uppercase">App Blueprint</h2>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <p className="font-bold uppercase text-chart-2 mb-1">
                  Architecture
                </p>
                <div className="border-2 border-border bg-background p-2">
                  Deno 2 + TanStack Router
                </div>
              </div>

              <div>
                <p className="font-bold uppercase text-chart-1 mb-1">
                  UI Canvas
                </p>
                <div className="border-2 border-border bg-background p-2">
                  Tailwind v4 + Shadcn Primitives
                </div>
              </div>

              <div>
                <p className="font-bold uppercase text-chart-3 mb-1">
                  Build Target
                </p>
                <div className="border-2 border-border bg-background p-2">
                  Vite Client SPA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

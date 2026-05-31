import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Layers,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function Index() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* 1. Hero Welcomer Banner */}
      <section className="border-4 border-border bg-main p-6 shadow-shadow text-main-foreground flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading uppercase tracking-tight">
            Financial Ledger System
          </h1>
          <p className="font-base max-w-xl text-sm md:text-base opacity-90">
            Real-time visual monitoring of your active entities, capital
            positioning, and total liquidity buffers.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/entities"
            className="flex items-center gap-2 border-2 border-border bg-secondary-background text-foreground font-heading uppercase px-4 py-2.5 text-sm shadow-[2px_2px_0px_0px_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--border)]"
          >
            <Layers className="h-4 w-4" /> View Portfolio
          </Link>
        </div>
      </section>

      {/* 2. High-Level Telemetry Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="border-4 border-border bg-secondary-background p-6 shadow-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-chart-1/10 border-b-2 border-l-2 border-border flex items-center justify-center font-heading text-xl text-chart-1">
            ₹
          </div>
          <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground opacity-70 mb-1">
            Total Combined Portfolio
          </p>
          <h3 className="text-3xl font-heading tracking-tight mb-2">
            ₹24,85,000
          </h3>
          <div className="inline-flex items-center gap-1 text-xs font-mono bg-chart-1 text-main-foreground border border-border px-1.5 py-0.5">
            <TrendingUp className="h-3 w-3" /> +12.4% vs last month
          </div>
        </div>

        {/* Metric 2 */}
        <div className="border-4 border-border bg-secondary-background p-6 shadow-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-chart-2/10 border-b-2 border-l-2 border-border flex items-center justify-center font-heading text-xl text-chart-2">
            LIQ
          </div>
          <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground opacity-70 mb-1">
            Liquid Reserve Capital
          </p>
          <h3 className="text-3xl font-heading tracking-tight mb-2">
            ₹4,12,000
          </h3>
          <div className="inline-flex items-center gap-1 text-xs font-mono bg-chart-2 text-main-foreground border border-border px-1.5 py-0.5">
            <Wallet className="h-3 w-3" /> Ready allocation buffer
          </div>
        </div>

        {/* Metric 3 */}
        <div className="border-4 border-border bg-secondary-background p-6 shadow-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-chart-4/10 border-b-2 border-l-2 border-border flex items-center justify-center font-heading text-xl text-chart-4">
            DEBT
          </div>
          <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground opacity-70 mb-1">
            Active Liabilities (Credit)
          </p>
          <h3 className="text-3xl font-heading tracking-tight mb-2">₹85,400</h3>
          <div className="inline-flex items-center gap-1 text-xs font-mono bg-chart-4 text-white border border-border px-1.5 py-0.5">
            <Activity className="h-3 w-3" /> 4 Statement cycles pending
          </div>
        </div>
      </section>

      {/* 3. Action Hub Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Recent Updates Logging (3/5 Columns) */}
        <div className="lg:col-span-3 border-4 border-border bg-secondary-background p-6 shadow-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-4">
              <h2 className="text-xl font-heading uppercase tracking-wide flex items-center gap-2">
                Recent Entity Activity
              </h2>
              <span className="text-xs font-mono border-2 border-border px-2 py-0.5 bg-background">
                Live State
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "HDFC Nifty 50 Index Fund",
                  type: "Mutual Fund",
                  cost: "+₹15,000",
                  color: "bg-chart-2",
                },
                {
                  title: "SBI Fixed Deposit (1 Year)",
                  type: "Fixed Deposit",
                  cost: "+₹1,00,000",
                  color: "bg-chart-3",
                },
                {
                  title: "ICICI Amazon Pay Card",
                  type: "Credit Card",
                  cost: "-₹4,230",
                  color: "bg-chart-4",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-2 border-border bg-background p-3 hover:translate-x-1 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 border border-border ${item.color}`}
                    />
                    <div>
                      <p className="text-sm font-heading">{item.title}</p>
                      <p className="text-xs font-mono opacity-60">
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <span className="font-heading text-sm font-mono border border-border px-2 py-0.5 bg-secondary-background shadow-[2px_2px_0px_0px_var(--border)]">
                    {item.cost}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/entities"
            className="mt-6 inline-flex items-center justify-center gap-1 text-center font-heading uppercase text-sm border-2 border-border bg-background p-2 transition-all hover:bg-main hover:text-main-foreground"
          >
            Inspect All Registers <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Right Side: Quick System Actions (2/5 Columns) */}
        <div className="lg:col-span-2 border-4 border-border bg-secondary-background p-6 shadow-shadow flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-border pb-3 mb-4">
              <h2 className="text-xl font-heading uppercase tracking-wide">
                Quick Pipeline Setup
              </h2>
            </div>
            <p className="text-sm font-base mb-6 opacity-80">
              Instantly track new asset streams by instantiating sub-entities
              within your registry tree.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/entities"
                className="group flex items-center justify-between border-2 border-border bg-chart-1 text-main-foreground font-heading uppercase text-sm p-3 shadow-[3px_3px_0px_0px_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)]"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 stroke-[3]" />{" "}
                  Register Investment Asset
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                to="/entities"
                className="group flex items-center justify-between border-2 border-border bg-chart-3 text-main-foreground font-heading uppercase text-sm p-3 shadow-[3px_3px_0px_0px_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)]"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 stroke-[3]" /> Record Liquidity Node
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          <div className="mt-8 border-2 border-dashed border-border p-3 text-center text-xs font-mono opacity-60">
            Storage Medium: Local Reactive Engine
          </div>
        </div>
      </section>
    </div>
  );
}

import type { PaymentStatus } from "@prisma/client";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChartNoAxesCombined,
  ChefHat,
  CircleAlert,
  Crown,
  Eye,
  Images,
  IndianRupee,
  MessageSquareText,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DataPoint = { label: string; value: number };

export type AdminDashboardData = {
  generatedAt: string;
  stats: {
    paidRevenue: number;
    paidOrders: number;
    totalUsers: number;
    activeMembers: number;
    publishedRecipes: number;
    totalRecipes: number;
    actionItems: number;
  };
  revenue: Array<DataPoint & { orders: number }>;
  registrations: DataPoint[];
  audience: {
    active: number;
    personalised: number;
    verified: number;
    plans: DataPoint[];
  };
  health: Array<DataPoint & { total: number; href: string }>;
  inventory: { articles: number; ingredients: number; media: number };
  topRecipes: Array<{
    id: string;
    title: string;
    views: number;
    favorites: number;
    reviews: number;
    published: boolean;
  }>;
  pipeline: DataPoint[];
  queue: Array<{
    label: string;
    value: number;
    href: string;
    tone: "amber" | "blue" | "rose";
  }>;
  recentOrders: Array<{
    id: string;
    reference: string;
    customer: string;
    plan: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    createdAt: string;
  }>;
};

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IN", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compact(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function day(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(value));
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function statusTone(status: PaymentStatus) {
  if (status === "Paid" || status === "Success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  if (status === "Processing") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
  }
  return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const publishRate = percentage(data.stats.publishedRecipes, data.stats.totalRecipes);
  const memberRate = percentage(data.stats.activeMembers, data.stats.totalUsers);
  const totalLeads = data.pipeline.reduce((total, stage) => total + stage.value, 0);

  return (
    <div className="space-y-6">
      <section className="admin-taxonomy-hero rounded-[32px] p-5 sm:p-7 lg:p-9">
        <div className="relative z-[1] flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="admin-taxonomy-hero-badge inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
              <Sparkles className="size-3.5" />
              Operations Cockpit
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.7rem]">
                Namaste, admin. Your kitchen is moving.
              </h1>
              <p className="admin-taxonomy-hero-copy mt-3 max-w-2xl text-sm leading-6 sm:text-base">
                Sales, subscriptions, editorial quality and customer conversations in one calm
                view. Prioritise the work that grows Kya Khayen today.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
            <Button asChild className="h-12 rounded-2xl px-5">
              <Link href="/admin/recipes">
                <ChefHat />
                Manage recipes
              </Link>
            </Button>
            <Button asChild variant="outline" className="admin-taxonomy-hero-action h-12 rounded-2xl px-5">
              <Link href="/admin/contact-queries">
                <MessageSquareText />
                Open lead inbox
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative z-[1] mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <HeroStat
            icon={IndianRupee}
            label="Paid revenue"
            value={money(data.stats.paidRevenue)}
            note={`${data.stats.paidOrders} confirmed payments`}
          />
          <HeroStat
            icon={Crown}
            label="Active members"
            value={compact(data.stats.activeMembers)}
            note={`${memberRate}% of registered users`}
          />
          <HeroStat
            icon={ChefHat}
            label="Published recipes"
            value={compact(data.stats.publishedRecipes)}
            note={`${publishRate}% catalog live`}
          />
          <HeroStat
            icon={CircleAlert}
            label="Needs attention"
            value={compact(data.stats.actionItems)}
            note="Approvals, leads and payments"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(325px,1fr)]">
        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Commerce</p>
              <h2 className="mt-2 text-xl font-semibold">Paid revenue pulse</h2>
              <p className="mt-1 text-sm text-muted-foreground">INR collections over the last six months.</p>
            </div>
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/admin/orders">
                View orders <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <RevenueBars points={data.revenue} />
        </section>

        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Action Center</p>
              <h2 className="mt-2 text-xl font-semibold">Today&apos;s queue</h2>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CircleAlert className="size-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {data.queue.map((item) => (
              <QueueRow key={item.label} {...item} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(350px,1.08fr)_minmax(350px,1fr)_minmax(300px,0.9fr)]">
        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Audience</p>
              <h2 className="mt-2 text-xl font-semibold">Member growth</h2>
            </div>
            <UsersRound className="size-5 text-webprimary" />
          </div>
          <RegistrationLine points={data.registrations} />
          <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-5 text-center">
            <TinyStat label="Active" value={data.audience.active} />
            <TinyStat label="Verified" value={data.audience.verified} />
            <TinyStat label="Set up" value={data.audience.personalised} />
          </div>
        </section>

        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Publishing</p>
              <h2 className="mt-2 text-xl font-semibold">Content readiness</h2>
            </div>
            <BookOpenText className="size-5 text-webprimary" />
          </div>
          <div className="mt-6 space-y-5">
            {data.health.map((health) => (
              <Link key={health.label} href={health.href} className="group block space-y-2">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-medium transition-colors group-hover:text-primary">{health.label}</span>
                  <span className="text-muted-foreground">
                    {health.value}/{health.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-webprimary transition-all"
                    style={{ width: `${percentage(health.value, health.total)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex gap-3 border-t pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpenText className="size-3.5" /> {data.inventory.articles} stories</span>
            <span className="flex items-center gap-1"><ChefHat className="size-3.5" /> {data.inventory.ingredients} ingredients</span>
            <span className="flex items-center gap-1"><Images className="size-3.5" /> {data.inventory.media} assets</span>
          </div>
        </section>

        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subscriptions</p>
            <h2 className="mt-2 text-xl font-semibold">Membership mix</h2>
          </div>
          <MembershipMix plans={data.audience.plans} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(380px,1.15fr)_minmax(320px,0.88fr)_minmax(380px,1.1fr)]">
        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <PanelHeading title="Most discovered recipes" eyebrow="Engagement" href="/admin/recipes" />
          <div className="mt-5 space-y-3">
            {data.topRecipes.map((recipe, index) => (
              <Link
                key={recipe.id}
                href={`/admin/recipes/${recipe.id}`}
                className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-colors hover:border-border hover:bg-muted/35"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{recipe.title}</span>
                  <span className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="size-3" /> {compact(recipe.views)}</span>
                    <span className="flex items-center gap-1"><Star className="size-3" /> {recipe.reviews}</span>
                    <span>{recipe.favorites} saves</span>
                  </span>
                </span>
                <span className={`size-2 rounded-full ${recipe.published ? "bg-emerald-500" : "bg-amber-500"}`} />
              </Link>
            ))}
            {!data.topRecipes.length && <EmptyState label="Recipes will appear here after creation." />}
          </div>
        </section>

        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <PanelHeading title="Lead pipeline" eyebrow="CRM" href="/admin/contact-queries" />
          <Pipeline stages={data.pipeline} total={totalLeads} />
        </section>

        <section className="rounded-[28px] border bg-card p-5 shadow-sm sm:p-6">
          <PanelHeading title="Latest orders" eyebrow="Payments" href="/admin/orders" />
          <div className="mt-5 space-y-3">
            {data.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border p-3.5 transition-colors hover:bg-muted/35"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{order.customer}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {order.plan} · {order.reference} · {day(order.createdAt)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold">{money(order.amount, order.currency)}</span>
                  <Badge variant="outline" className={`mt-1 ${statusTone(order.status)}`}>
                    {order.status}
                  </Badge>
                </span>
              </Link>
            ))}
            {!data.recentOrders.length && <EmptyState label="Orders will appear here after checkout." />}
          </div>
        </section>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        Snapshot refreshed {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt))}
      </p>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="admin-taxonomy-stat rounded-3xl px-5 py-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="admin-taxonomy-stat-label text-sm font-medium">{label}</p>
        <Icon className="admin-taxonomy-stat-icon size-5" />
      </div>
      <p className="admin-taxonomy-stat-value mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function RevenueBars({ points }: { points: Array<DataPoint & { orders: number }> }) {
  const maximum = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
      {points.map((point) => (
        <div key={point.label} className="group flex h-full flex-1 flex-col justify-end gap-3">
          <div className="relative flex flex-1 items-end justify-center">
            <div className="absolute bottom-full mb-2 hidden rounded-xl border bg-popover px-3 py-2 text-xs shadow-md group-hover:block">
              <p className="font-semibold">{money(point.value)}</p>
              <p className="text-muted-foreground">{point.orders} orders</p>
            </div>
            <div
              className="w-full max-w-[74px] rounded-t-[18px] bg-gradient-to-t from-primary to-webprimary transition-[height,filter] duration-500 group-hover:brightness-110"
              style={{ height: `${point.value ? Math.max(12, (point.value / maximum) * 100) : 3}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{point.label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{point.orders} paid</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function QueueRow({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "amber" | "blue" | "rose";
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  };
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-2xl border p-3.5 transition-colors hover:bg-muted/35">
      <span className={`flex size-10 items-center justify-center rounded-xl text-lg font-semibold ${colors[tone]}`}>
        {value}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function RegistrationLine({ points }: { points: DataPoint[] }) {
  const maximum = Math.max(...points.map((point) => point.value), 1);
  const coordinates = points.map((point, index) => ({
    x: (index / Math.max(points.length - 1, 1)) * 100,
    y: 88 - (point.value / maximum) * 68,
  }));
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `0,100 ${line} 100,100`;
  return (
    <div className="mt-6">
      <div className="h-[125px]">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="member-area" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M ${area.replaceAll(" ", " L ")} Z`} fill="url(#member-area)" />
          <polyline points={line} fill="none" stroke="var(--primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {coordinates.map((point, index) => (
            <circle key={points[index].label} cx={point.x} cy={point.y} r="2.5" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{points[0]?.label}</span>
        <span>{points.at(-1)?.label}</span>
      </div>
    </div>
  );
}

function TinyStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-semibold">{compact(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function MembershipMix({ plans }: { plans: DataPoint[] }) {
  const total = plans.reduce((sum, plan) => sum + plan.value, 0);
  const first = percentage(plans[0]?.value || 0, total);
  const second = percentage(plans[1]?.value || 0, total);
  return (
    <>
      <div className="mt-6 flex items-center gap-5">
        <div
          className="flex size-28 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) 0 ${first}%, var(--webprimary) ${first}% ${first + second}%, var(--chart-3) ${first + second}% 100%)`,
          }}
        >
          <div className="flex size-[76px] flex-col items-center justify-center rounded-full bg-card">
            <span className="text-xl font-semibold">{total}</span>
            <span className="text-[10px] text-muted-foreground">active</span>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          {plans.slice(0, 3).map((plan, index) => (
            <div key={plan.label} className="flex items-center gap-2 text-sm">
              <span className={`size-2.5 rounded-full ${index === 0 ? "bg-primary" : index === 1 ? "bg-webprimary" : "bg-[var(--chart-3)]"}`} />
              <span className="truncate text-muted-foreground">{plan.label}</span>
              <span className="font-medium">{plan.value}</span>
            </div>
          ))}
        </div>
      </div>
      {!plans.length && <EmptyState label="No active memberships yet." />}
      <Button variant="outline" asChild className="mt-6 w-full rounded-xl">
        <Link href="/admin/subscription-plans">Manage subscriptions <ArrowRight /></Link>
      </Button>
    </>
  );
}

function PanelHeading({ title, eyebrow, href }: { title: string; eyebrow: string; href: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      </div>
      <Button size="icon-sm" variant="ghost" asChild className="rounded-xl">
        <Link href={href} aria-label={`Open ${title}`}><ArrowUpRight /></Link>
      </Button>
    </div>
  );
}

function Pipeline({ stages, total }: { stages: DataPoint[]; total: number }) {
  const shades = ["bg-amber-400", "bg-blue-500", "bg-emerald-500", "bg-slate-400"];
  return (
    <div className="mt-6">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className={shades[index]}
            style={{ width: `${percentage(stage.value, total)}%` }}
          />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-center gap-3">
            <span className={`size-2.5 rounded-full ${shades[index]}`} />
            <p className="flex-1 text-sm text-muted-foreground">{stage.label}</p>
            <p className="text-sm font-semibold">{stage.value}</p>
            <p className="w-10 text-right text-xs text-muted-foreground">{percentage(stage.value, total)}%</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ChartNoAxesCombined className="size-4 text-primary" />
          Conversion health
        </div>
        <p className="mt-2 text-2xl font-semibold">
          {percentage(stages[2]?.value || 0, total)}%
        </p>
        <p className="text-xs text-muted-foreground">of captured leads converted</p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
      {label}
    </p>
  );
}

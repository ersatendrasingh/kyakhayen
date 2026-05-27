"use client";

import {
  ChefHat,
  Crown,
  Eye,
  Search,
  ShieldBan,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ManagedUser } from "@/components/admin/users/user-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function initials(name: string | null, email: string | null) {
  return (name || email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function date(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))
    : "-";
}

function activePlan(user: ManagedUser, referenceDate: string) {
  if (!user.isActive) return undefined;
  const now = new Date(referenceDate);
  return user.UserPlan.find((assignment) => !assignment.endDate || new Date(assignment.endDate) >= now);
}

function planProgress(startDate: Date, endDate: Date | null, referenceDate: string) {
  if (!endDate) return 100;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (end <= start) return 100;
  const reference = new Date(referenceDate).getTime();
  return Math.round(Math.min(100, Math.max(0, ((reference - start) / (end - start)) * 100)));
}

function remainingDays(endDate: Date | null, referenceDate: string) {
  if (!endDate) return null;
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(referenceDate).getTime()) / 86_400_000));
}

export function UsersDashboard({ users, referenceDate }: { users: ManagedUser[]; referenceDate: string }) {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");

  const personalized = users.filter((user) => user.isPersonalised).length;
  const activeMembers = users.filter((user) => Boolean(activePlan(user, referenceDate))).length;
  const verified = users.filter((user) => Boolean(user.emailVerified)).length;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const membership = activePlan(user, referenceDate);
      const matchesSearch =
        !term ||
        (user.name || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (user.phoneNumber || "").toLowerCase().includes(term) ||
        (membership?.plan.name || "").toLowerCase().includes(term);
      const matchesSegment =
        segment === "all" ||
        (segment === "member" && Boolean(membership)) ||
        (segment === "personalized" && user.isPersonalised) ||
        (segment === "pending" && !user.isPersonalised) ||
        (segment === "suspended" && !user.isActive);
      return matchesSearch && matchesSegment;
    });
  }, [referenceDate, search, segment, users]);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="space-y-6">
      <section className="admin-taxonomy-hero rounded-[32px] p-5 sm:p-7 lg:p-9">
        <div className="relative z-[1] max-w-3xl space-y-3">
          <span className="admin-taxonomy-hero-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
            Customers
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Users dashboard</h1>
          <p className="admin-taxonomy-hero-copy text-sm sm:text-base">
            Understand every customer from account creation through membership, meal-plan setup
            and engagement without opening multiple systems.
          </p>
        </div>
        <div className="relative z-[1] mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat icon={UsersRound} label="Registered Users" value={String(users.length)} />
          <Stat icon={Crown} label="Active Access" value={String(activeMembers)} />
          <Stat icon={ChefHat} label="Personalized" value={String(personalized)} />
          <Stat icon={UserRound} label="Email Verified" value={String(verified)} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Customer directory</h2>
            <p className="text-sm text-muted-foreground">
              Plan, preference setup and recent meal-plan status in one view.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-[270px]">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer or membership"
                className="h-12 rounded-2xl pl-11"
              />
            </div>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="!h-12 w-full rounded-2xl px-4 sm:w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="member">Active access</SelectItem>
                <SelectItem value="personalized">Personalized</SelectItem>
                <SelectItem value="pending">Setup pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Preferences</TableHead>
                <TableHead>Meal Plans</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const membership = activePlan(user, referenceDate);
                const daysLeft = membership ? remainingDays(membership.endDate, referenceDate) : null;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/admin/users/${user.id}`} className="group flex items-center gap-3">
                        <Avatar size="lg">
                          <AvatarImage src={user.image || undefined} alt="" />
                          <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium transition-colors group-hover:text-webprimary">
                            {user.name || "Unnamed user"}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                          {!user.isActive && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                              <ShieldBan className="size-3" /> Suspended
                            </span>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-[210px]">
                      {membership ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help space-y-2 py-1">
                              <div className="flex items-center justify-between gap-2">
                                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                  {membership.plan.name}
                                </Badge>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {daysLeft === null ? "Active" : `${daysLeft}d left`}
                                </span>
                              </div>
                              <Progress
                                value={planProgress(membership.startDate, membership.endDate, referenceDate)}
                                className="h-1.5 bg-emerald-100 [&_[data-slot=progress-indicator]]:bg-emerald-500 dark:bg-emerald-500/15"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="space-y-1 rounded-xl p-3">
                            <p className="font-semibold">{membership.plan.name} access</p>
                            <p>Started: {date(membership.startDate)}</p>
                            <p>Ends: {date(membership.endDate)}</p>
                            <p className="font-medium">
                              {daysLeft === null ? "No expiry assigned" : `${daysLeft} days remaining`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge variant="outline">No active access</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.isPersonalised
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        }
                      >
                        {user.isPersonalised ? "Ready" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.UserMealPlan.length}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {date(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{user.Order.length} orders</p>
                      <p className="text-xs text-muted-foreground">{user._count.Favorite} saved dishes</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild size="icon-sm" variant="outline" className="rounded-xl">
                            <Link href={`/admin/users/${user.id}`} aria-label={`Manage ${user.name || "user"}`}>
                              <Eye />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>Manage customer</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                    No customers match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
      </div>
    </TooltipProvider>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7c9a4] bg-background/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{label}</span>
        <Icon className="size-5 text-webprimary" />
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}

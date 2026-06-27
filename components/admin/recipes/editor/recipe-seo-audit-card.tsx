"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Gauge,
  Info,
  SearchCheck,
} from "lucide-react";

import type { RecipeEditorRecord } from "@/components/admin/recipes/editor/recipe-editor-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auditRecipeContent, type RecipeAuditSeverity } from "@/lib/recipe-content-audit";
import { cn } from "@/lib/utils";

function severityStyle(severity: RecipeAuditSeverity) {
  switch (severity) {
    case "critical":
      return {
        icon: CircleAlert,
        label: "Fix first",
        className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        label: "Improve",
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
      };
    case "good":
      return {
        icon: CheckCircle2,
        label: "Good",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
      };
    case "info":
      return {
        icon: Info,
        label: "Optional",
        className:
          "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
      };
  }
}

function gradeClass(grade: string) {
  if (grade === "Excellent") return "text-emerald-600";
  if (grade === "Good") return "text-lime-600";
  if (grade === "Needs work") return "text-amber-600";
  return "text-red-600";
}

export function RecipeSeoAuditCard({ recipe }: { recipe: RecipeEditorRecord }) {
  const audit = auditRecipeContent(recipe);
  const percent = Math.round((audit.score / audit.maxScore) * 100);

  return (
    <Card className="overflow-hidden rounded-2xl py-0">
      <CardHeader className="border-b p-5">
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SearchCheck className="size-5" />
          </span>
          SEO and content audit
        </CardTitle>
        <p className="text-xs leading-5 text-muted-foreground">
          Deterministic checks for manual review. This is not a ranking guarantee.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Audit score
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className={cn("text-3xl font-semibold", gradeClass(audit.grade))}>
                  {percent}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>
            <Badge variant={audit.grade === "Weak" ? "destructive" : "secondary"}>
              {audit.grade}
            </Badge>
          </div>
          <Progress value={percent} className="h-2" />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{audit.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border bg-background p-3">
              <p className="font-semibold text-red-600">{audit.criticalCount}</p>
              <p className="text-xs text-muted-foreground">Fix first</p>
            </div>
            <div className="rounded-xl border bg-background p-3">
              <p className="font-semibold text-amber-600">{audit.warningCount}</p>
              <p className="text-xs text-muted-foreground">Improve</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {audit.sections.map((section) => {
            const sectionPercent = Math.round((section.score / section.maxScore) * 100);
            return (
              <section key={section.id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {sectionPercent}%
                  </span>
                </div>
                <div className="space-y-2">
                  {section.checks.map((item) => {
                    const style = severityStyle(item.severity);
                    const Icon = style.icon;
                    return (
                      <article
                        key={item.id}
                        className={cn("rounded-xl border p-3", style.className)}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className="mt-0.5 size-4 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold">{item.title}</h4>
                              <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                                {style.label}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 opacity-90">{item.detail}</p>
                            {item.fix ? (
                              <p className="mt-2 flex gap-1.5 text-xs leading-5">
                                <CircleHelp className="mt-0.5 size-3.5 shrink-0" />
                                <span>{item.fix}</span>
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

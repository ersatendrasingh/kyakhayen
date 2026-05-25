"use client";

import { Images } from "lucide-react";

import { MediaLibraryWorkspace } from "@/components/admin/media/media-library-dialog";

export function MediaLibraryPage() {
  return (
    <div className="flex flex-col gap-5 lg:h-[calc(100svh-7rem)] lg:min-h-[640px]">
      <section className="admin-taxonomy-hero shrink-0 rounded-[28px] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/10 p-3 text-primary">
            <Images className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Asset studio</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Media library</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Upload images and videos once, then reuse them across recipes, taxonomy and ingredients.
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <MediaLibraryWorkspace />
      </section>
    </div>
  );
}

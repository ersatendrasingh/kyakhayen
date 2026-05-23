"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageIcon, LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import type { BodyTypeRecord } from "@/components/admin/recipe-body-types/body-type-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { uploadMediaDirect } from "@/lib/upload-media-client";

type BodyTypeDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bodyType: BodyTypeRecord | null;
  onSaved: () => void;
};

export function BodyTypeDrawer({
  open,
  onOpenChange,
  bodyType,
  onSaved,
}: BodyTypeDrawerProps) {
  const [title, setTitle] = useState(bodyType?.title ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(bodyType?.imageUrl ?? null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onImageChange = (file: File | undefined) => {
    if (!file) return;

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Body type title is required");
      return;
    }

    try {
      setSubmitting(true);
      let bodyTypeId = bodyType?.id;

      if (bodyTypeId) {
        const response = await fetch(`/api/recipes/body-types/${bodyTypeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmedTitle }),
        });

        if (!response.ok) throw new Error("Unable to update body type.");
      } else {
        const response = await fetch("/api/recipes/body-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmedTitle }),
        });

        if (!response.ok) throw new Error("Unable to create body type.");
        const created = (await response.json()) as { id: string };
        bodyTypeId = created.id;
      }

      if (image && bodyTypeId) {
        const imageUrl = await uploadMediaDirect(image, { bodyTypeId });
        const response = await fetch(`/api/recipes/body-types/${bodyTypeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) throw new Error("Unable to save body type image.");
      }

      toast.success(bodyType ? "Body type updated successfully" : "Body type created successfully");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save body type.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-border/70 bg-background p-0 sm:max-w-[560px]"
      >
        <SheetHeader className="border-b bg-card/70 px-6 py-6 text-left">
          <SheetTitle className="text-2xl">
            {bodyType ? "Edit body type" : "Create body type"}
          </SheetTitle>
          <SheetDescription>
            Manage friendly body-type labels used for recipe discovery.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="rounded-3xl border border-primary/15 bg-primary/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Recipe taxonomy
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Body types help organize recipes through simple, familiar discovery labels.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body-type-title">Body type title</Label>
              <Input
                id="body-type-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Balanced"
                className="h-12 rounded-xl"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Featured image</Label>
              <label className="relative flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30 transition hover:border-primary/40 hover:bg-primary/[0.03]">
                {preview ? (
                  <Image
                    src={preview}
                    alt={title || "Body type preview"}
                    fill
                    sizes="(max-width: 640px) 100vw, 520px"
                    className="object-cover"
                    unoptimized={preview.startsWith("blob:")}
                  />
                ) : (
                  <>
                    <div className="rounded-2xl bg-background p-3 shadow-sm">
                      <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                    <span className="mt-4 text-sm font-medium">Click to upload</span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG or WebP
                    </span>
                  </>
                )}
                {preview && (
                  <span className="absolute bottom-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium shadow-sm">
                    <UploadCloud className="size-4" />
                    Replace image
                  </span>
                )}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => onImageChange(event.target.files?.[0])}
                  disabled={submitting}
                />
              </label>
            </div>
          </div>

          <SheetFooter className="border-t bg-background px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || submitting}>
              {submitting && <LoaderCircle className="animate-spin" />}
              {bodyType ? "Update Body Type" : "Create Body Type"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

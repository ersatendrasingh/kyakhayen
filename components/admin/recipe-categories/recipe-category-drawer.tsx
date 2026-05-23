"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageIcon, LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import type { RecipeCategoryRecord } from "@/components/admin/recipe-categories/recipe-category-types";
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

type RecipeCategoryDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: RecipeCategoryRecord | null;
  onSaved: () => void;
};

export function RecipeCategoryDrawer({
  open,
  onOpenChange,
  category,
  onSaved,
}: RecipeCategoryDrawerProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(category?.imageUrl ?? null);
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
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      let categoryId = category?.id;

      if (categoryId) {
        const response = await fetch(`/api/recipes/categories/${categoryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        if (!response.ok) throw new Error("Unable to update category.");
      } else {
        const response = await fetch("/api/recipes/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        if (!response.ok) throw new Error("Unable to create category.");
        const created = (await response.json()) as { id: string };
        categoryId = created.id;
      }

      if (image && categoryId) {
        const imageUrl = await uploadMediaDirect(image, { categoryId });
        const response = await fetch(`/api/recipes/categories/${categoryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) throw new Error("Unable to save category image.");
      }

      toast.success(category ? "Category updated successfully" : "Category created successfully");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category.");
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
            {category ? "Edit category" : "Create category"}
          </SheetTitle>
          <SheetDescription>
            Build clean recipe discovery groups for the Kya Khayen catalogue.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="rounded-3xl border border-primary/15 bg-primary/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Recipe taxonomy
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Categories are used for browsing and recipe organization across the platform.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipe-category-name">Category name</Label>
              <Input
                id="recipe-category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Breakfast"
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
                    alt={name || "Category preview"}
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
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting && <LoaderCircle className="animate-spin" />}
              {category ? "Update Category" : "Create Category"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

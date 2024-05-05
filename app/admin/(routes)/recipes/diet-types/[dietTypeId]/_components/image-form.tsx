"use client";

import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ImageIcon, Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import FileUpload from "@/components/upload/file-upload";

import { DietTypes } from "@prisma/client";

interface ImageFormProps {
  initialData: DietTypes;
  dietTypeId: string;
}

export const ImageForm = ({ initialData, dietTypeId }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (fileUrl: string) => {
    const imageUrl = { imageUrl: fileUrl.toString() };
    try {
      await axios.patch(`/api/recipes/diet-types/${dietTypeId}`, imageUrl);
      toast.success("Diet type image updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating diet type image", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Diet type image
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add an image
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className="w-6 h-6 pr-2" />
              Edit image
            </>
          )}
        </Button>
      </div>
      {!isEditing && initialData.imageUrl && (
        <div className="relative aspect-video mt-2">
          <Image
            alt={initialData.title}
            src={initialData.imageUrl}
            fill
            sizes="100%"
            priority
            className="object-cover rounded-md"
          />
        </div>
      )}
      {!isEditing && !initialData.imageUrl && (
        <div className="h-60 flex items-center justify-center bg-slate-200 rounded-md">
          <ImageIcon className="w-12 h-12 text-slate-500" />
        </div>
      )}
      {isEditing && (
        <>
          <FileUpload
            previousImageUrl={initialData.imageUrl}
            multiple={false}
            acceptedFileTypes={["image/*"]}
            dietTypeId={initialData.id}
            onChange={(url) => {
              if (url) onSubmit(url);
            }}
          />
          <div className="text-xs text-muted-foreground mt-2">
            16x9 aspect ratio recommended
          </div>
        </>
      )}
    </div>
  );
};

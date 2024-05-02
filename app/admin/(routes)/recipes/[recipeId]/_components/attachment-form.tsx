"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { File, Loader2, PlusCircleIcon, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import FileUpload from "@/components/upload/file-upload";

import { Attachements, Courses } from "@prisma/client";

interface AttachmentFormProps {
  initialData: Courses & { attachements: Attachements[] };
  courseId: string;
}

export const AttachmentForm = ({
  initialData,
  courseId,
}: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (fileUrl: string[]) => {
    const jsonData = JSON.stringify(fileUrl);
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, jsonData);
      toast.success("Course attachment added successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while adding course attachments", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Course attachment deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting course attachment", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {initialData.attachements.length === 0 && (
            <p className="text-sm text-slate-500 mt-2 italic">
              No attachments yet
            </p>
          )}
          {initialData.attachements.length > 0 && (
            <div className="space-y-2">
              {initialData.attachements.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center p-3 bg-sky-100 border-sky-200 text-sky-700 border rounded-md"
                >
                  <File className="w-4 h-4 mr-2 flex-shrink-0" />
                  <p className="text-sm line-clamp-1">{attachment.name}</p>
                  {deletingId === attachment.id && (
                    <div className="ml-auto">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  {deletingId !== attachment.id && (
                    <button
                      className="ml-auto hover:opacity-75 transition"
                      onClick={() => onDelete(attachment.id)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEditing && (
        <>
          <FileUpload
            courseId={initialData.id}
            isAttachment={true}
            acceptedFileTypes={["image/*", "video/mp4", "application/pdf"]}
            multiple={true}
            onChange={(urls: string | string[]) => {
              if (urls) {
                const urlArray = Array.isArray(urls) ? urls : [urls];
                onSubmit(urlArray);
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-2">
            Upload anything here like a PDF, an image or a video.
          </div>
        </>
      )}
    </div>
  );
};

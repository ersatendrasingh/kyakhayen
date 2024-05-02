"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import axios, { AxiosProgressEvent } from "axios";

import { Progress } from "@/components/ui/progress";
import UploadDropZone from "@/components/upload/upload-dropzone";
import UploadButton from "@/components/upload/upload-button";

interface FileUploadProps {
  previousImageUrl?: string | null;
  categoryId?: string | null;
  recipeId?: string | null;
  methodId?: string | null;
  cookingMethodId?: string | null;
  cuisineId?: string | null;
  allergyId?: string | null;
  prakritiId?: string | null;
  acceptedFileTypes: string[];
  multiple?: boolean;
  onChange: (fileUrl: string) => void;
}

const FileUpload = ({
  previousImageUrl,
  categoryId,
  recipeId,
  methodId,
  cookingMethodId,
  cuisineId,
  allergyId,
  prakritiId,
  acceptedFileTypes,
  multiple,
  onChange,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[] | null>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const updateProgressBar = (percent: number): void => {
    setProgress(+percent.toFixed(2));
  };
  const updatePrewiewUrls = (previewUrls: string[]) => {
    setPreviewUrls(previewUrls);
  };
  const updateFile = (files: File[]) => {
    setFiles(files);
  };
  const uploadFileWithProgressBar = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsUploading(true);

    if (!files) {
      return;
    }
    try {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append(`file${i + 1}`, files[i]);
      }
      formData.append("previousImageUrl", previousImageUrl || "");
      formData.append("categoryId", categoryId || "");
      formData.append("recipeId", recipeId || "");
      formData.append("methodId", methodId || "");
      formData.append("cookingMethodId", cookingMethodId || "");
      formData.append("cuisineId", cuisineId || "");
      formData.append("allergyId", allergyId || "");
      formData.append("prakritiId", prakritiId || "");

      const response = await axios.post("/api/s3upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const { loaded, total } = progressEvent;
          if (total !== null && total !== undefined) {
            const percent = Math.floor((loaded * 100) / total);
            updateProgressBar(percent);
          } else {
            setProgress(0);
          }
        },
      });
      if (response.status !== 200) {
        toast.error("Something went wrong while uploading file", {
          position: "top-center",
          autoClose: 5000,
        });
        return;
      } else if (response.status === 200) {
        onChange(response.data);
        setIsUploading(false);
      }
    } catch (error) {
      toast.error("Something went wrong while uploading file", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  return (
    <div>
      <form className="w-full p-3 border border-gray-500 border-dashed rounded-md">
        <UploadDropZone
          updatePrewiewUrls={updatePrewiewUrls}
          multiple={multiple}
          acceptedFileTypes={acceptedFileTypes}
          updateFile={updateFile}
        />
        <div className="flex items-center justify-center mt-2">
          {progress > 0 && (
            <Progress value={progress} className="w-full bg-emerald-500" />
          )}
        </div>
        <div className="flex items-center mt-4  justify-center">
          <UploadButton
            previewUrls={previewUrls}
            onClick={uploadFileWithProgressBar}
            isUploading={isUploading}
          />
        </div>
      </form>
    </div>
  );
};

export default FileUpload;

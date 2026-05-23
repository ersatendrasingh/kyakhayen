import axios, { AxiosProgressEvent } from "axios";

type MediaDestination = {
  categoryId?: string;
  postCategoryId?: string;
  recipeId?: string;
  postId?: string;
  methodId?: string;
  cookingMethodId?: string;
  bodyTypeId?: string;
  cuisineId?: string;
  allergyId?: string;
  mealTimeId?: string;
  nutrientId?: string;
  dietTypeId?: string;
  recipeTypeId?: string;
};

export const uploadMediaDirect = async (
  file: File,
  destination: MediaDestination,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const { data } = await axios.post<{
    uploadUrl: string;
    publicUrl: string;
  }>("/api/media/presign", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    ...destination,
  });

  await axios.put(data.uploadUrl, file, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": file.type,
    },
    onUploadProgress,
  });

  return data.publicUrl;
};

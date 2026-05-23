import axios from "axios";
import { CameraIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
interface UploadProfilePicProps {
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadProfilePic = ({
  setImagePreview,
  setIsUploading,
}: UploadProfilePicProps) => {
  const router = useRouter();
  const { update } = useSession();
  async function resizeAndPreviewImage(
    file: File,
    width: number,
    height: number
  ): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context is not supported"));
          return;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          1
        ); // Change format and quality as needed
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  }
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const fileInput = e.target;

    if (!fileInput.files) {
      setIsUploading(false);
      toast.error("No file was chosen", {
        duration: 5000,
      });
      return;
    }
    const file = fileInput.files[0];

    if (!file.type.startsWith("image")) {
      setIsUploading(false);
      toast.error(`Selected File is invalid`, {
        duration: 5000,
      });
      return;
    }
    const resizedFile = await resizeAndPreviewImage(file, 200, 200);
    try {
      const { data } = await axios.post<{
        uploadUrl: string;
        publicUrl: string;
      }>("/api/media/presign", {
        fileName: "profile.jpg",
        fileSize: resizedFile.size,
        fileType: "image/jpeg",
        profile: true,
      });

      await axios.put(data.uploadUrl, resizedFile, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": "image/jpeg",
        },
      });

      const response = await axios.post("/api/user/update-profile-pic", {
        imageUrl: data.publicUrl,
      });
      update();
      if (response.status !== 200) {
        toast.error("Something went wrong while uploading file", {
          duration: 5000,
        });
        return;
      } else if (response.status === 200) {
        router.refresh();
        setIsUploading(false);
        toast.success("Profile picture updated successfully", {
          duration: 5000,
        });
      }
    } catch (error) {
      setIsUploading(false);
      toast.error("Something went wrong while uploading file", {
        duration: 5000,
      });
    }
  };
  return (
    <div className="absolute bottom-4 right-4">
      <button className="flex items-center justify-center bg-gray-800 text-white p-2 rounded-full">
        <label htmlFor="image-upload" title="Upload Image">
          <input
            id="image-upload"
            type="file"
            className="hidden cursor-pointer"
            onChange={handleImageChange}
          />
          <CameraIcon
            className="w-4 h-4 cursor-pointer"
            style={{ transform: "translateY(-2px)" }}
          />
        </label>
      </button>
    </div>
  );
};

export default UploadProfilePic;

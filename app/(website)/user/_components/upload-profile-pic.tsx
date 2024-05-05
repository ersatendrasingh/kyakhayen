import { useCurrentUser } from "@/hooks/use-current-user";
import axios from "axios";
import { CameraIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  const user = useCurrentUser();
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
      toast.error("No file was chosen", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
    const file = fileInput.files[0];

    if (!file.type.startsWith("image")) {
      toast.error(`Selected File is invalid`, {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
    const resizedFile = await resizeAndPreviewImage(file, 200, 200);
    try {
      let formData = new FormData();
      formData.append("file", resizedFile);
      if (user && user.id) {
        formData.append("userId", user?.id);
      }
      if (user && user?.image) {
        formData.append("previousImage", user?.image);
      }

      const response = await axios.post(
        "/api/user/update-profile-pic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      update();
      if (response.status !== 200) {
        toast.error("Something went wrong while uploading file", {
          position: "top-center",
          autoClose: 5000,
        });
        return;
      } else if (response.status === 200) {
        router.refresh();
        setIsUploading(false);
        toast.success("Profile picture updated successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error("Something went wrong while uploading file", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  return (
    <div className="absolute bottom-1 right-4">
      <button className="flex items-center justify-center bg-gray-800 text-white p-2 rounded-full">
        <label htmlFor="image-upload" title="Upload Image">
          <input
            id="image-upload"
            type="file"
            className="hidden cursor-pointer"
            onChange={handleImageChange}
          />
          <CameraIcon className="w-4 h-4 cursor-pointer" />
        </label>
      </button>
    </div>
  );
};

export default UploadProfilePic;

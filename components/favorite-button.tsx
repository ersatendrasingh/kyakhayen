"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  recipeId: string;
  classNames?: string;
  initialIsFavorited?: boolean;
}

const FavoriteButton = ({
  recipeId,
  classNames,
  initialIsFavorited = false,
}: FavoriteButtonProps) => {
  const [isFavorited, setIsFavorited] = useState<boolean | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleFavorite = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const response = await axios.post("/api/favorites", {
        recipeId,
      });

      if (response.status === 200) {
        setIsFavorited(true);
        setIsLoading(false);
        toast.success("Recipe added to favorites", {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        toast.error("Something went wrong", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleUnfavorite = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const response = await axios.delete(`/api/favorites/${recipeId}`);

      if (response.status === 200) {
        setIsFavorited(false);
        setIsLoading(false);
        toast.success("Recipe removed from favorites", {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        toast.error("Something went wrong", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className={classNames}>
      <button onClick={isFavorited ? handleUnfavorite : handleFavorite}>
        {isFavorited === undefined ? (
          <div className="flex items-center bg-gray-500 rounded-l-3xl px-3 py-1">
            <span className="text-white font-semibold ml-1">Loading...</span>
          </div>
        ) : isFavorited ? (
          <div className="flex items-center rounded-l-3xl bg-red-500 px-3 py-1">
            <Image
              src="/assets/images/unfavorite.png"
              alt="unfavorite"
              width={20}
              height={20}
            />
            <span className="text-white text-xs ml-1">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin w-3 h-3 mr-1" />
                  <span className="text-white">Removing...</span>
                </div>
              ) : (
                "Remove from favorites"
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center bg-green-500 rounded-l-3xl px-3 py-1">
            <Image
              src="/assets/images/favorite.png"
              alt="favorite"
              width={20}
              height={20}
            />
            <span className="text-white text-xs ml-1">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin w-3 h-3 mr-1" />
                  <span className="text-white">Adding...</span>
                </div>
              ) : (
                "Add to favorites"
              )}
            </span>
          </div>
        )}
      </button>
    </div>
  );
};

export default FavoriteButton;

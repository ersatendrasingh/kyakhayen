"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { Heart, HeartOff, Loader2 } from "lucide-react";

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
      <button
        onClick={isFavorited ? handleUnfavorite : handleFavorite}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorited === undefined ? (
          <div className="flex items-center bg-white rounded-b-3xl py-1 px-1">
            <Loader2 className="animate-spin w-4 h-4" stroke="green" />
          </div>
        ) : isFavorited ? (
          <div className="flex items-center bg-white rounded-b-3xl py-1 px-1">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin w-4 h-4" stroke="green" />
              </div>
            ) : (
              <Heart fill="red" stroke="red" size={20} />
            )}
          </div>
        ) : (
          <div className="flex items-center bg-white rounded-b-3xl py-1 px-1">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin w-4 h-4" stroke="red" />
              </div>
            ) : (
              <Heart fill="green" stroke="green" size={20} />
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default FavoriteButton;

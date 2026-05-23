"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

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
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const isFavorited = favoriteOverride ?? initialIsFavorited;
  const [isLoading, setIsLoading] = useState(false);

  const user = useCurrentUser();
  const router = useRouter();

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
        setFavoriteOverride(true);
        setIsLoading(false);
        toast.success("Recipe added to favorites", {
          duration: 5000,
        });
      } else {
        toast.error("Something went wrong", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        duration: 5000,
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
        setFavoriteOverride(false);
        setIsLoading(false);
        toast.success("Recipe removed from favorites", {
          duration: 5000,
        });
      } else {
        toast.error("Something went wrong", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        duration: 5000,
      });
    }
  };

  return (
    <div className={classNames}>
      <button
        onClick={isFavorited ? handleUnfavorite : handleFavorite}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorited ? (
          <div className="flex items-center rounded-b-3xl bg-card px-1 py-1 shadow-sm">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            ) : (
              <Heart className="fill-primary text-primary" size={20} />
            )}
          </div>
        ) : (
          <div className="flex items-center rounded-b-3xl bg-card px-1 py-1 shadow-sm">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            ) : (
              <Heart className="fill-secondary text-primary" size={20} />
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default FavoriteButton;

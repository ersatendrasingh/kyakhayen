"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { BsCalendar2DateFill } from "react-icons/bs";
import { GoUnverified } from "react-icons/go";
import { FaTransgender } from "react-icons/fa6";

import { SlCalender } from "react-icons/sl";
import Container from "@/components/container";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";

import UploadProfilePic from "./upload-profile-pic";
import { formatDate } from "@/lib/formatDate";
import { useCurrentUser } from "@/hooks/use-current-user";
import { capitalizeName } from "@/lib/formateName";
import { useSession } from "next-auth/react";

interface BannerCardProps {
  className?: string;
}

const BannerCard = ({ className }: BannerCardProps) => {
  const user = useCurrentUser();
  const { update } = useSession();
  const hasRunOnce = useRef(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(
    user?.gender?.toLowerCase() === "male"
      ? "/assets/images/man-user-circle-icon.webp"
      : "/assets/images/woman-user-circle-icon.webp"
  );
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (!hasRunOnce.current) {
      update();
      hasRunOnce.current = true;
    }
  }, [update]);

  useEffect(() => {
    if (user?.image) {
      const timestamp = new Date().getTime();
      const imageUrl = user?.image
        ? `${user.image}?t=${timestamp}`
        : user.gender?.toLocaleLowerCase() === "male"
        ? "/assets/images/man-user-circle-icon.webp"
        : "/assets/images/woman-user-circle-icon.webp";
      setImageUrl(imageUrl);
    }
  }, [user?.image, user?.gender]);

  return (
    <div className={cn("w-full sticky top-[70px] z-10", className)}>
      <Container>
        <div className="flex flex-col lg:flex-row justify-between rounded-md bg-gradient-to-b from-rose-400 to-red-500">
          <div className="m-8 flex flex-col lg:flex-row items-center justify-start">
            <div className="mr-4 relative">
              <div className="mb-4 lg:mb-0 text-center lg:text-left ">
                {user ? (
                  imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="User Image"
                        width={180}
                        height={180}
                        priority
                        className="rounded-full border-4 border-sky-100"
                        style={{
                          filter: isUploading ? "blur(4px)" : "none",
                          opacity: isUploading ? "0.5" : "1",
                        }}
                      />

                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={user.name!}
                      width={180}
                      height={180}
                      priority
                      className="relative rounded-full border-4 border-sky-100"
                    />
                  )
                ) : (
                  <Skeleton className="w-44 h-44 rounded-full" />
                )}

                <UploadProfilePic
                  setImagePreview={setImagePreview}
                  setIsUploading={setIsUploading}
                />
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="ml-0 lg:ml-4">
                {user?.name ? (
                  <h1 className="text-2xl font-bold text-sky-100 mb-2 inline-flex items-center">
                    {capitalizeName(user?.name)}
                    {user?.isPersonalised ? (
                      <RiVerifiedBadgeFill
                        className="w-5 h-5 ml-2 text-green-500"
                        title="Personalised"
                      />
                    ) : (
                      <GoUnverified
                        className="w-5 h-5 ml-2 text-white"
                        title="Not Personalised"
                      />
                    )}
                  </h1>
                ) : (
                  <Skeleton className="h-8 w-[300px] rounded-xl mb-2" />
                )}
                {user?.email ? (
                  <p className="text-sky-100 mb-2">{user?.email}</p>
                ) : (
                  <Skeleton className="h-5 w-[280px] rounded-xl mb-2" />
                )}
                {user?.age && (
                  <p className="text-sky-100 mr-4 text-sm font-medium mt-2 lg:mt-0">
                    <BsCalendar2DateFill className="inline w-4 h-4 mr-2" />
                    {user?.age + " Years Old"}
                  </p>
                )}
                {user?.gender && (
                  <p className="text-sky-100 mr-4 text-sm font-medium mt-2 lg:mt-0">
                    <FaTransgender className="inline w-4 h-4 mr-2" />
                    {user?.gender}
                  </p>
                )}

                {user?.createdAt ? (
                  <p className="text-sky-100 mt-2 lg:mt-0 text-muted-foreground">
                    <SlCalender className="inline w-4 h-4 mr-2" />
                    <span className="mr-2">Registered on</span>
                    {formatDate(user?.createdAt)}
                  </p>
                ) : (
                  <Skeleton className="h-5 w-[250px] rounded-xl" />
                )}
              </div>
              <div className="ml-0 lg:ml-4 mt-4 lg:mt-0"></div>
            </div>
          </div>
          <div className="m-0 lg:ml-10 mt-8 lg:mt-0 hidden lg:block items-end justify-end text-end">
            <Image
              src="/assets/images/user-cover.webp"
              alt="Banner Card"
              width={300}
              height={300}
              priority
              className="mr-10"
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BannerCard;

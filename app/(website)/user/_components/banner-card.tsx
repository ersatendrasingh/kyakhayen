"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CameraIcon, Loader2 } from "lucide-react";
import { FaBookBookmark } from "react-icons/fa6";
import { PiCertificate } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import Container from "@/components/container";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";

import UploadProfilePic from "./upload-profile-pic";
import { formatDate } from "@/lib/formatDate";
import { useCurrentUser } from "@/hooks/use-current-user";

interface BannerCardProps {
  className?: string;
}

const BannerCard = ({ className }: BannerCardProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("/assets/default-student.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    if (user?.image) {
      const timestamp = new Date().getTime();
      const imageUrl = user?.image
        ? `${user.image}?t=${timestamp}`
        : "/assets/default-student.jpg";
      setImageUrl(imageUrl);
    }
  }, [user?.image]);

  return (
    <div className={cn("w-full sticky top-[70px] z-10", className)}>
      <Container>
        <div className="flex flex-col lg:flex-row justify-between rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-500">
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
                  <h1 className="text-3xl font-bold text-sky-100 mb-2">
                    {user?.name}
                  </h1>
                ) : (
                  <Skeleton className="h-8 w-[300px] rounded-xl mb-2" />
                )}
                {user?.email ? (
                  <p className="text-sky-100 mb-2">{user?.email}</p>
                ) : (
                  <Skeleton className="h-5 w-[280px] rounded-xl mb-2" />
                )}

                <p className="text-sky-100 mr-4 mt-2 lg:mt-0">
                  <PiCertificate className="inline w-4 h-4 mr-2" />4
                  Certificates
                </p>

                {user?.createdAt ? (
                  <p className="text-sky-100 mt-2 lg:mt-0 text-muted-foreground">
                    <SlCalender className="inline w-3 h-3 mr-2" />
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
              src="/assets/student.png"
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

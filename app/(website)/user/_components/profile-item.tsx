"use client";

import { formatDate } from "@/lib/formatDate";

interface ProfileItemProps {
  label: string;
  value?: string | Date;
}

const ProfileItem = ({ label, value }: ProfileItemProps) => {
  const formattedValue =
    typeof value === "string"
      ? value
      : value instanceof Date
      ? formatDate(value)
      : "";

  return (
    <div className="flex w-full items-center justify-between py-2">
      <div className="w-1/3 font-bold">{label}</div>
      <div className="w-2/3">{formattedValue}</div>
    </div>
  );
};

export default ProfileItem;

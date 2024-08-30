"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "./data-table";
import { SubscriptionPlanType } from "@/types/subscription-plan";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface SubscriptionPlansTableProps {
  subscriptionPlans: SubscriptionPlanType[];
}

const SubscriptionPlansTable = ({
  subscriptionPlans,
}: SubscriptionPlansTableProps) => {
  const columns: ColumnDef<SubscriptionPlanType>[] = [
    {
      accessorKey: "serialNumber",
      header: "Sl. No.",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },

    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "priceInr",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Indian Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{`INR. ${row.getValue("priceInr")}`}</div>
      ),
    },
    {
      accessorKey: "priceUsd",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          International Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{`$ ${row.getValue("priceUsd")}`}</div>
      ),
    },
    {
      accessorKey: "durationMonths",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { durationMonths } = row.original;
        return (
          <div className="text-center">
            {durationMonths! > 1
              ? `${durationMonths} Months`
              : `${durationMonths} Month`}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { isPublished } = row.original;
        return (
          <Badge className={cn(isPublished ? "bg-emerald-500" : "bg-gray-500")}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const formattedTimestamp = createdAt.toLocaleDateString(
          "en-IN",
          options
        );
        return <Badge className="bg-yellow-500">{formattedTimestamp}</Badge>;
      },
    },
    {
      id: "actions",
      header: ({ column }) => {
        return <span>Action</span>;
      },
      cell: ({ row }) => {
        const { id } = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-4 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/subscription-plans/${id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="h-3 w-3 mr-2 cursor-pointer" />
                  Edit
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={subscriptionPlans} />
    </>
  );
};

export default SubscriptionPlansTable;

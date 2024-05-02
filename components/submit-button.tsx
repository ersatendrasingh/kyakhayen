"use client";

import { Button } from "@/components/ui/button";
import { CircleDashedIcon } from "lucide-react";

interface SubmitButtonProps {
  isPending: boolean;
  submitText: string;
}

export const SubmitButton = ({ isPending, submitText }: SubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={isPending}>
      {isPending ? (
        <>
          <CircleDashedIcon className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        submitText
      )}
    </Button>
  );
};

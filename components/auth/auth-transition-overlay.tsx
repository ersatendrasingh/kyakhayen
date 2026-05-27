"use client";

import { Loader2, ShieldCheck } from "lucide-react";

type AuthTransitionOverlayProps = {
  message?: string;
};

export function AuthTransitionOverlay({
  message = "Preparing your account",
}: AuthTransitionOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fcf8f0]/96 backdrop-blur-sm dark:bg-[#091712]/96">
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-[#f2decc] dark:bg-white/10">
        <span className="block h-full w-2/5 animate-[auth-progress_1.05s_ease-in-out_infinite] rounded-r-full bg-[#b83c2e] dark:bg-[#dfb36c]" />
      </div>
      <div className="rounded-[1.7rem] border border-[#eadbc6] bg-[#fffdf9] px-10 py-9 text-center shadow-[0_22px_65px_rgba(68,45,25,0.10)] dark:border-white/8 dark:bg-[#10241e]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f7e8d5] text-[#b83c2e] dark:bg-[#17362e] dark:text-[#dfb36c]">
          <ShieldCheck className="size-6" />
        </span>
        <p className="mt-5 text-lg font-semibold text-[#30251e] dark:text-[#eef2ec]">
          {message}
        </p>
        <p className="mt-2 text-sm text-[#78685b] dark:text-[#aab8b0]">
          Please wait while we securely continue.
        </p>
        <Loader2 className="mx-auto mt-5 size-5 animate-spin text-[#b83c2e] dark:text-[#dfb36c]" />
      </div>
      <style jsx>{`
        @keyframes auth-progress {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(360%);
          }
        }
      `}</style>
    </div>
  );
}

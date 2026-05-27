"use client";

import { Download, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

const DISMISSED_UNTIL_KEY = "kyakhayen-install-dismissed-until";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;
const INSTALLED_MS = 365 * 24 * 60 * 60 * 1000;

function isMobileBrowser() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function isInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isPromptSuppressed() {
  const until = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) || 0);
  return until > Date.now();
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname === "/download-app" ||
      !isMobileBrowser() ||
      isInstalledApp() ||
      isPromptSuppressed()
    ) {
      return;
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleInstalled = () => {
      window.localStorage.setItem(
        DISMISSED_UNTIL_KEY,
        String(Date.now() + INSTALLED_MS),
      );
      setInstallEvent(null);
      setShowPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [pathname]);

  const dismissPrompt = () => {
    window.localStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(Date.now() + DISMISS_MS),
    );
    setShowPrompt(false);
    setInstallEvent(null);
  };

  const installApp = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    window.localStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(Date.now() + (choice.outcome === "accepted" ? INSTALLED_MS : DISMISS_MS)),
    );
    setShowPrompt(false);
    setInstallEvent(null);
  };

  if (pathname === "/download-app" || !showPrompt || !installEvent) return null;

  return (
    <aside
      aria-label="Install Kya Khayen app"
      className="install-prompt-card fixed bottom-[5.35rem] left-3 right-3 z-[48] rounded-[1.35rem] border border-[#244238] bg-[#10231c]/98 p-3.5 shadow-[0_24px_55px_-25px_rgba(5,15,12,0.8)] backdrop-blur-md sm:hidden"
    >
      <button
        type="button"
        aria-label="Dismiss install suggestion"
        onClick={dismissPrompt}
        className="absolute right-2.5 top-2.5 flex size-7 cursor-pointer items-center justify-center rounded-full text-[#a9b9af] transition hover:bg-white/5"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-3 pr-8">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#19352b]">
          <Image
            src="/pwa/icon-192.png"
            alt=""
            width={38}
            height={38}
            className="size-11 object-cover"
          />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#f3eee6]">Your kitchen, one tap away</p>
          <p className="mt-0.5 text-[11px] leading-4 text-[#a9b9af]">
            Install Kya Khayen for meal plans and helpful alerts.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={installApp}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#b63a2b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#ca4635]"
        >
          <Download className="size-3.5" />
          Install app
        </button>
        <button
          type="button"
          onClick={dismissPrompt}
          className="cursor-pointer rounded-full border border-[#29473e] px-4 py-2.5 text-xs font-semibold text-[#c5d1cb]"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}

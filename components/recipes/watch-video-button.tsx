import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock, Play } from "lucide-react";
import VideoPopup from "./video-popup";

interface WatchVideoButtonProps {
  isFree: boolean;
  videoUrl: string | null;
}

const WatchVideoButton = ({ isFree, videoUrl }: WatchVideoButtonProps) => {
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  const openVideoPopup = () => {
    if (isFree) {
      setShowVideoPopup(true);
    }
  };

  const closeVideoPopup = () => {
    setShowVideoPopup(false);
  };
  return (
    <div className="flex justify-end mr-4">
      <button
        className={cn(
          "flex items-center  text-white px-4 py-2 rounded-full text-end",
          isFree ? "bg-green-500" : "bg-gray-500"
        )}
        onClick={openVideoPopup}
        disabled={!isFree}
      >
        {isFree ? (
          <>
            <Play className="w-6 h-6 mr-2" />
            <span>Watch Video</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" /> Video Locked
          </>
        )}
      </button>
      {showVideoPopup && (
        <VideoPopup videoUrl={videoUrl as string} onClose={closeVideoPopup} />
      )}
    </div>
  );
};

export default WatchVideoButton;

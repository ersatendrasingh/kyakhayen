"use client";

interface WebVideoPlayerProps {
  videoUrl: string;
  poster?: string;
}

const WebVideoPlayer = ({ videoUrl, poster }: WebVideoPlayerProps) => {
  const posterUrl = poster ? `${process.env.NEXT_PUBLIC_APP_URL}${poster}` : "";

  return (
    <div className="relative">
      <video controls poster={posterUrl}>
        <source src={videoUrl} />
      </video>
    </div>
  );
};

export default WebVideoPlayer;

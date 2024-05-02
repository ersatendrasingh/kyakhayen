import dynamic from "next/dynamic";

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

  return (
    <div className="w-full h-full rounded-md">
      <ReactPlayer
        url={videoUrl}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              onContextMenu: (e: any) => e.preventDefault(),
            },
          },
        }}
        width="100%"
        height="100%"
        controls={true}
        light={false}
        pip={true}
      />
    </div>
  );
};

export default VideoPlayer;

"use client";
import Container from "@/components/container";
import WebVideoPlayer from "@/components/web-video-player";

const whoPoster = "/assets/unitus-vdo-thumb.jpg";
const WhoAreWe = () => {
  return (
    <div className="w-full flex items-center justify-center pt-12 pb-10 mt-10 mb-10 bg-[#f9f9ff]">
      <Container>
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start">
          <div className="mt-8 lg:mt-0 w-full lg:w-1/2 mb-10 lg:mb-0 mr-0 lg:mr-10 items-center justify-center">
            <WebVideoPlayer
              videoUrl="https://d3svaamk73mozc.cloudfront.net/849ec737-dbd3-4e08-a402-24a736464c91/mp4/Unitus%20Health%20Academy_new_edit_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_6Mbps_qvbr.mp4"
              poster={whoPoster}
            />
          </div>
          <div className="w-full lg:w-1/2 animate-fadeIn">
            <h3 className="text-3xl font-bold text-center text-webprimary mb-10">
              Who Are We
            </h3>
            <p className="text-[18px]">
              Unitus Health Academy, started by Dr Shikha Sharma, is an online
              platform to bring different health sciences under one umbrella and
              provide upskilling opportunities to health professionals and
              health enthusiasts. The courses are designed to be integrated with
              complementary streams of healthcare to bring a unique amalgamation
              of healthcare education keeping the practical aspects of patient
              care. The online platform allows for Global access and ease of
              participation for the students
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default WhoAreWe;

import Image from "next/image";
import React from "react";

const prakritiTypes = ["Vata", "Pitta", "Kapha"] as const;

type PrakritiType = (typeof prakritiTypes)[number];

interface PrakritiInfo {
  type: PrakritiType;
  description: string;
  icon: string;
}

const prakritiData: Record<PrakritiType, PrakritiInfo> = {
  Vata: {
    type: "Vata",
    description:
      "Vata types are energetic, creative, and flexible. They often have a lean body type and dry skin.",
    icon: "/assets/images/vata.png", // Update with the correct path to the icon
  },
  Pitta: {
    type: "Pitta",
    description:
      "Pitta types are intense, intelligent, and goal-oriented. They often have a moderate body type and oily skin.",
    icon: "/assets/images/pitta.png", // Update with the correct path to the icon
  },
  Kapha: {
    type: "Kapha",
    description:
      "Kapha types are calm, loving, and grounded. They often have a sturdy body type and smooth skin.",
    icon: "/assets/images/kapha.png", // Update with the correct path to the icon
  },
};

interface PrakritiInfoCardProps {
  prakriti: PrakritiType;
}

const PrakritiInfoCard: React.FC<PrakritiInfoCardProps> = ({ prakriti }) => {
  const { type, description, icon } = prakritiData[prakriti];

  return (
    <div className="p-6  text-center">
      <Image
        src={icon}
        alt={`${type} icon`}
        className="mx-auto mb-4 "
        width={190}
        height={190}
      />
      <h3 className="text-2xl font-bold text-blue-500 mb-2">{type}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default PrakritiInfoCard;

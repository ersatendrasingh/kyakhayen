"use client";

import Image, { StaticImageData } from "next/image";
interface PaymentMethodSelectionProps {
  imageSrc: StaticImageData;
  gatewayName: string;
  isSelected: boolean;
  onSelect: (gateway: string) => void;
}

const PaymentMethodSelection = ({
  imageSrc,
  gatewayName,
  isSelected,
  onSelect,
}: PaymentMethodSelectionProps) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        className="hidden"
        checked={isSelected}
        name="paymentMethod"
        onChange={() => onSelect(gatewayName)}
      />
      <div
        className={`relative w-36 h-10 border-2  rounded-md overflow-hidden ${
          isSelected ? "border-rose-500" : "border-transparent"
        }`}
      >
        <div className={`absolute inset-0`}>
          <Image src={imageSrc} alt={gatewayName} fill sizes="100%" />
        </div>
      </div>
    </label>
  );
};

export default PaymentMethodSelection;

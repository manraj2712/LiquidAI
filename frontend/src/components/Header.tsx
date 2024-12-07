"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

const Header = () => {
  return (
    <div className="flex justify-between px-8 py-4">
      <div className="flex gap-3 items-center">
        <Image
          alt="liquid-ai"
          src="/liquid-ai.svg"
          width={20}
          height={80}
          className="w-8"
        />
        <p className="text-white">Liquid.ai</p>
      </div>
      {/* <Button className="range-button-active"> */}
      <div className="z-20">
        <ConnectButton />
      </div>
      {/* </Button> */}
    </div>
  );
};

export default Header;

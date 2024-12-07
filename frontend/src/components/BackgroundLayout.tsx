import Image from "next/image";
import React from "react";

const BackgroundLayout = () => {
  return (
    <div className="relative bg-[#030A06] h-screen overflow-hidden">
      <Image
        alt="bg-vector"
        width={1600}
        src="/bg-vector.svg"
        layout="intrinsic"
        height={500}
        className="absolute bottom-0 left-0 right-0 z-0 w-full"
      />
      <Image
        alt="ellipsis-left"
        src="/ellipsis-left.svg"
        layout="intrinsic"
        width={300}
        height={500}
        className="absolute left-0 top-60 z-10"
      />
      <Image
        alt="ellipsis-right"
        src="/ellipsis-right.svg"
        layout="intrinsic"
        width={300}
        height={500}
        className="absolute right-0 top-0 z-10"
      />
    </div>
  );
};

export default BackgroundLayout;

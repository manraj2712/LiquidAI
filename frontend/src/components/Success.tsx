import Image from "next/image";
import Link from "next/link";
import React from "react";

const Success = () => {
  return (
    <div className="bg-gray-40 px-4 py-2 rounded-lg border-thin max-w-lg border-gray-50 flex-col flex gap-4">
      <div className="flex items-center gap-4">
        <Image width={25} height={25} alt="success" src="/success.svg" />
        <p className="text-white text-base font-normal">
          Confirmed on in wallet
        </p>
        <Link href={""} target="_blank">
          <Image width={15} height={15} alt="redirect-link" src="/link.svg" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Image width={25} height={25} alt="success" src="/success.svg" />

        <p className="text-white text-base font-normal">
          Transaction is now getting mined into blockchain
        </p>
        <Link href={""} target="_blank">
          <Image width={15} height={15} alt="redirect-link" src="/link.svg" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Image width={25} height={25} alt="success" src="/success.svg" />
        <div>
          <p className="text-white text-base font-normal">
            Transaction Successfull !
          </p>
          <p className="text-white text-base font-normal">
            You have successfully added liquidity to your SOL-USDC Position.
          </p>
        </div>
        <Link href={""} target="_blank">
          <Image width={15} height={15} alt="redirect-link" src="/link.svg" />
        </Link>
      </div>
    </div>
  );
};

export default Success;

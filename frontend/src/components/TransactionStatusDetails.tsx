import { chainsData } from "@/config/chain";
import { txnStatus } from "@/constants/transaction";
import { TxnStatus } from "@/types/txn";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Spinner from "./ui/Spinner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function TransactionStatusDetails({
  status,
  txnHash,
}: {
  status: TxnStatus;
  txnHash?: string;
}) {
  const [showIframe, setShowIframe] = useState(false);

  const { chainId } = useAccount();

  useEffect(() => {
    if (status === txnStatus.success) {
      setShowIframe(true);
      const timer = setTimeout(() => {
        setShowIframe(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        <span className="text-zinc-400">Approval</span>
        {txnStatus.approving === status ? (
          <Spinner className="w-4 h-4 flex items-center justify-center" />
        ) : [
            txnStatus.approved,
            txnStatus.mining,
            txnStatus.failed,
            txnStatus.success,
          ].includes(status) ? (
          <img src={"/tick.svg"} alt="tick-icon" className="w-4" />
        ) : null}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-zinc-400">Mining</span>
        {txnStatus.mining === status ? (
          <Spinner className="w-4 h-4 flex items-center justify-center" />
        ) : ([txnStatus.failed, txnStatus.success] as string[]).includes(
            status
          ) ? (
          <img src={"/tick.svg"} alt="tick-icon" className="w-4" />
        ) : null}
      </div>
      {(txnStatus.success === status || txnStatus.failed === status) && (
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Status</span>
          {txnStatus.success === status ? (
            <Link
              href={`${chainsData[chainId!].blockExplorerUrl}/tx/${txnHash}`}
              className="cursor-pointer"
              target="_blank"
            >
              <Image
                src={"/link.svg"}
                alt="tick-icon"
                className="w-4 cursor-pointer bg-white"
                width={25}
                height={25}
              />
            </Link>
          ) : (
            <p>Failed</p>
          )}
        </div>
      )}
      {showIframe && (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-black bg-opacity-50">
          <DotLottieReact
            src="https://lottie.host/308d1c41-cdb9-4a03-adf8-3db4e5a7ed08/oha7wkDpqO.lottie"
            loop
            autoplay
          />
        </div>
      )}
    </div>
  );
}

import { getWagmiChainById } from "@/app/wagmi";
import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getWalletClient } from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";

import { txnStatus } from "@/constants/transaction";
import { callApi } from "@/helpers/axios";
import {
  MigrateLiquidityRequest,
  MigrateLiquidityResponse,
} from "@/types/migrateLiquidity";
import { TxnStatus } from "@/types/txn";
import { useState } from "react";
import { Kzg } from "viem";
import { useApprove } from "./useApprove";

const migrateLiquidityService = async (
  request: MigrateLiquidityRequest
): Promise<Omit<MigrateLiquidityResponse, "zapData"> | null> => {
  try {
    const response = await callApi({
      url: "/api/migrate",
      options: {
        method: "POST",
        data: request,
      },
    });
    return {
      callData: response.callData,
      to: response.to,
      value: response.value,
      addLiquidityDetails: response.addLiquidityDetails,
      removeLiquidityDetails: response.removeLiquidityDetails,
    };
  } catch (error) {
    console.error("Error while adding liquidity", error);
    return null;
  }
};

export const useMigrateLiquidity = () => {
  const { address: account, chainId } = useAccount();
  const wagmiConfig = useConfig();
  const { approveNft, isNFTApproved } = useApprove();

  const [txnStatusState, setTxnStatusState] = useState<TxnStatus | null>(null);

  const buildMigrateLiquidity = async (
    request: Omit<MigrateLiquidityRequest, "account" | "chainId">
  ): Promise<Omit<MigrateLiquidityResponse, "zapData"> | null> => {
    if (!account) {
      return null;
    }

    const migratePositionRequest: MigrateLiquidityRequest = {
      account,
      chainId: chainId!,
      ...request,
    };

    try {
      const response = await migrateLiquidityService(migratePositionRequest);
      if (!response) {
        return null;
      }
      return response;
    } catch (error) {
      console.error("Error while adding liquidity", error);
      return null;
    }
  };

  const sendMigrateLiquidityTxn = async (txnData: {
    data: HexString;
    value: bigint;
    to: HexString;
    nftManager: HexString;
    nftId: bigint;
  }) => {
    const { data, to, value, nftId, nftManager } = txnData;

    const walletClient = await getWalletClient(wagmiConfig);

    setTxnStatusState(txnStatus.approving);

    const isApproved = await isNFTApproved({
      nftId,
      nftManager,
    });

    if (!isApproved) {
      const approvalSuccess = await approveNft({
        nftId,
        nftManager,
      });
      if (!approvalSuccess) {
        return;
      }
    }

    setTxnStatusState(txnStatus.mining);

    const txnHash = await walletClient.sendTransaction({
      to,
      data,
      blobs: [],
      maxFeePerBlobGas: BigInt(0),
      value,
      account: account as HexString,
      chain: getWagmiChainById(chainId!),
      kzg: {} as Kzg,
    });

    const publicClient = getPublicClient(chainId!);

    const txnReceipt = await publicClient.waitForTransactionReceipt({
      hash: txnHash,
    });
    if (txnReceipt.status === "reverted") {
      setTxnStatusState(txnStatus.failed);
    }
    if (txnReceipt.status === "success") {
      setTxnStatusState(txnStatus.success);
      // renderToast({
      //   type: ToastTypes.txnSuccess,
      //   content: {
      //     amount: truncateNumber(
      //       formatUnits(token0AmountInWei, token0Details.decimals)
      //     ),
      //     recipient: dzapConstants.appName,
      //     tokenSymbol: token0Details.symbol,
      //   },
      // });
    }
  };

  return {
    buildMigrateLiquidity,
    sendMigrateLiquidityTxn,
    txnStatus: txnStatusState,
  };
};

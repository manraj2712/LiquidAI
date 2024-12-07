import { getWagmiChainById } from "@/app/wagmi";
import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getWalletClient } from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";

import { txnStatus } from "@/constants/transaction";
import { callApi } from "@/helpers/axios";
import {
  RemoveLiquidityRequest,
  RemoveLiquidityResponse,
} from "@/types/removeLiquidity";
import { TxnStatus } from "@/types/txn";
import { useState } from "react";
import { Kzg } from "viem";
import { useApprove } from "./useApprove";

const removeLiquidityService = async (
  request: RemoveLiquidityRequest
): Promise<Omit<RemoveLiquidityResponse, "zapData"> | null> => {
  try {
    const response = await callApi({
      url: "/api/remove",
      options: {
        method: "POST",
        data: request,
      },
    });
    return {
      callData: response.callData,
      to: response.to,
      value: response.value,
      details: response.details,
    };
  } catch (error) {
    console.error("Error while adding liquidity", error);
    return null;
  }
};

export const useRemoveLiquidity = () => {
  const { address: account, chainId } = useAccount();
  const wagmiConfig = useConfig();
  const { approveNft, isNFTApproved } = useApprove();
  const [txnStatusState, setTxnStatusState] = useState<TxnStatus | null>(null);

  const buildRemoveLiquidity = async (request: {
    poolAddress: HexString;
    nftId: bigint;
    provider: string;
    zapOutToken?: {
      address: HexString;
      amount: bigint;
      decimals: number;
    };
  }): Promise<Omit<RemoveLiquidityResponse, "zapData"> | null> => {
    // const walletClient = await getWalletClient(wagmiConfig);
    const { zapOutToken, poolAddress, provider, nftId } = request;
    if (!account) {
      return null;
    }

    const removePositionRequest: RemoveLiquidityRequest = {
      account,
      chainId: chainId!,
      provider,
      poolAddress,
      nftId: nftId.toString(),
      zapOutToken: zapOutToken ? zapOutToken.address : undefined,
    };

    try {
      const response = await removeLiquidityService(removePositionRequest);
      if (!response) {
        return null;
      }
      return response;
    } catch (error) {
      console.error("Error while adding liquidity", error);
      return null;
    }
  };

  const sendRemoveLiquidityTxn = async (txnData: {
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
    txnStatus: txnStatusState,
    buildRemoveLiquidity,
    sendRemoveLiquidityTxn,
  };
};

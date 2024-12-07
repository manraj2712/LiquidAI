import { getWagmiChainById } from "@/app/wagmi";
import {
  AddLiquidityRequest,
  AddLiquidityResponse,
} from "@/types/addLiquidity";
import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getWalletClient } from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";
import { useApprove } from "./useApprove";

import { txnStatus } from "@/constants/transaction";
import { callApi } from "@/helpers/axios";
import { TxnStatus } from "@/types/txn";
import { useState } from "react";
import { Kzg, parseUnits } from "viem";

const addLiquidityService = async (
  request: AddLiquidityRequest
): Promise<Omit<AddLiquidityResponse, "zapData"> | null> => {
  try {
    const response = await callApi({
      url: "/api/add",
      options: {
        method: "POST",
        data: {
          account: request.account,
          poolAddress: request.poolAddress,
          chainId: request.chainId,
          provider: request.provider,
          zapInAmount: request.zapInAmount,
          zapInToken: request.zapInToken,
        } as AddLiquidityRequest,
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

export const useAddLiquidity = () => {
  const { approve } = useApprove();
  const { address: account, chainId } = useAccount();
  const [status, setStatus] = useState<TxnStatus | null>(null);
  const [txnHash, setTxnHash] = useState<HexString | null>(null);

  const wagmiConfig = useConfig();

  const buildAddLiquidity = async (request: {
    poolAddress: HexString;
    zapInToken: {
      address: HexString;
      amount: bigint;
      decimals: number;
    };
    provider: string;
  }): Promise<Omit<AddLiquidityResponse, "zapData"> | null> => {
    // const walletClient = await getWalletClient(wagmiConfig);
    const { zapInToken, poolAddress, provider } = request;
    if (!account) {
      return null;
    }

    const createPositionRequest: AddLiquidityRequest = {
      account,
      chainId: chainId!,
      provider,
      poolAddress,
      zapInAmount: parseUnits(
        zapInToken.amount.toString(),
        zapInToken.decimals
      ).toString(),
      zapInToken: zapInToken.address,
    };

    try {
      const response = await addLiquidityService(createPositionRequest);
      if (!response) {
        return null;
      }
      return response;
    } catch (error) {
      console.error("Error while adding liquidity", error);
      return null;
    }
  };

  const sendAddLiquidityTxn = async (txnData: {
    data: HexString;
    value: bigint;
    to: HexString;
    zapInToken: {
      address: HexString;
      amount: bigint;
    };
  }) => {
    const { data, to, value, zapInToken } = txnData;

    setStatus(txnStatus.approving);

    const isApproved = await approve({
      token: zapInToken,
    });

    if (!isApproved) {
      return null;
    }
    setStatus(txnStatus.approved);
    const walletClient = await getWalletClient(wagmiConfig);

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

    setTxnHash(txnHash);

    setStatus(txnStatus.mining);

    const publicClient = getPublicClient(chainId!);

    const txnReceipt = await publicClient.waitForTransactionReceipt({
      hash: txnHash,
    });

    if (txnReceipt.status === "reverted") {
      setStatus(txnStatus.failed);
    }
    if (txnReceipt.status === "success") {
      setStatus(txnStatus.success);
    }
  };

  return {
    status,
    buildAddLiquidity,
    sendAddLiquidityTxn,
    txnHash,
  };
};

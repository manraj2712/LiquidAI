import { zapContractAbi } from "@/abi/zap";
import { IProvider } from "@/types/iProvider";
import {
  MigrateLiquidityRequest,
  MigrateLiquidityResponse,
} from "@/types/migrateLiquidity";
import { generateBytes32TxnId } from "@/utils/id";
import { getPublicClient } from "@/utils/publicClient";
import { encodeFunctionData } from "viem";
import { generateAddV3LiquidityData } from "../addLiquidity/v3";
import { generateRemoveV3LiquidityData } from "../removeLiquidity/v3";

export const generateMigrateV3LiquidityData = async ({
  request,
  srcProvider,
  destProvider,
}: {
  request: MigrateLiquidityRequest;
  srcProvider: IProvider;
  destProvider: IProvider;
}): Promise<MigrateLiquidityResponse> => {
  const destPool = destProvider.getPoolFromAddress({
    address: request.destPoolAddress,
    chainId: request.chainId,
  });

  const { account, chainId } = request;

  const removeFromSrcZapData = await generateRemoveV3LiquidityData({
    request: {
      account: request.account,
      chainId: request.chainId,
      poolAddress: request.srcPoolAddress,
      provider: srcProvider.details.id,
      nftId: request.nftId,
      zapOutToken: destPool.token0.address,
    },
    provider: srcProvider,
    isFinalStep: false,
  });

  const addToDestZapData = await generateAddV3LiquidityData({
    request: {
      account: request.account,
      chainId: request.chainId,
      poolAddress: request.destPoolAddress,
      zapInAmount: removeFromSrcZapData.details.zapOutToken?.amount || "",
      zapInToken: destPool.token0.address,
    },
    provider: destProvider,
    isFinalStep: true,
  });

  const callData = encodeFunctionData({
    abi: zapContractAbi,
    functionName: "zap",
    args: [
      generateBytes32TxnId(account),
      [...removeFromSrcZapData.zapData, ...addToDestZapData.zapData],
      [],
    ],
  });

  const publicClient = getPublicClient(chainId);
  const blockNumber = await publicClient.getBlockNumber();

  console.log("blockNumber", blockNumber);

  console.dir([...removeFromSrcZapData.zapData, ...addToDestZapData.zapData], {
    depth: null,
  });

  return {
    zapData: [...removeFromSrcZapData.zapData, ...addToDestZapData.zapData],
    callData,
    to: addToDestZapData.to,
    addLiquidityDetails: addToDestZapData.details,
    removeLiquidityDetails: removeFromSrcZapData.details,
    value: (
      BigInt(addToDestZapData.value) + BigInt(removeFromSrcZapData.value)
    ).toString(),
  };
};

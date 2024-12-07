import { BuildAddLiquidityProviderRequest } from "@/types/addLiquidity";
import { BuildTxnResponse } from "@/types/txn";
import { encodeFunctionData } from "viem";
import { aerodromeNFTManagerAbi } from "../abi/nftManager";
import { aerodromeAddresses } from "../config/contracts";

export const getbuildAddLiquidityData = async (
  request: BuildAddLiquidityProviderRequest
): Promise<BuildTxnResponse> => {
  const {
    token0,
    token1,
    lowerTick,
    upperTick,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
    recipient,
    chainId,
    tickSpacing,
  } = request;
  const nftManager = aerodromeAddresses[chainId].nftManager;
  const callData = encodeFunctionData({
    abi: aerodromeNFTManagerAbi,
    functionName: "mint",
    args: [
      {
        token0,
        token1,
        tickLower: lowerTick,
        tickUpper: upperTick,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        recipient,
        sqrtPriceX96: BigInt(0),
        tickSpacing,
        deadline: BigInt(Date.now() + 1000 * 60 * 10),
      },
    ],
  });

  return {
    callData,
    to: nftManager,
    value: BigInt(0),
  };
};

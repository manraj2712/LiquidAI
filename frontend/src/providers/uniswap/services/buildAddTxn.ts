import { BuildAddLiquidityProviderRequest } from "@/types/addLiquidity";
import { BuildTxnResponse } from "@/types/txn";
import { encodeFunctionData } from "viem";
import { uniswapNFTManagerAbi } from "../abi/nftManager";
import { uniswapContracts } from "../config/contracts";

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
    fee,
    chainId,
  } = request;
  const nftManager = uniswapContracts[chainId].nftManager;
  const callData = encodeFunctionData({
    abi: uniswapNFTManagerAbi,
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
        fee,
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

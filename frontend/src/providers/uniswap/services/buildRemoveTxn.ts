import { BuildRemoveLiquidityProviderRequest } from "@/types/removeLiquidity";
import { BuildTxnResponse } from "@/types/txn";
import { encodeFunctionData } from "viem";
import { uniswapNFTManagerAbi } from "../abi/nftManager";
import { uniswapContracts } from "../config/contracts";

export const getbuildRemoveLiquidityData = async (
  request: BuildRemoveLiquidityProviderRequest
): Promise<BuildTxnResponse> => {
  const { tokenId, amount0Min, amount1Min, liquidity, chainId } = request;
  const nftManager = uniswapContracts[chainId].nftManager;
  const callData = encodeFunctionData({
    abi: uniswapNFTManagerAbi,
    functionName: "decreaseLiquidity",
    args: [
      {
        amount0Min,
        amount1Min,
        tokenId,
        deadline: BigInt(Date.now() + 1000 * 60 * 10),
        liquidity,
      },
    ],
  });

  return {
    callData,
    to: nftManager,
    value: BigInt(0),
  };
};

import { AddLiquidityProviderDetails } from "@/types/addLiquidity";
import { HexString } from "@/types/string";
import { zeroAddress } from "viem";
import { uniswapContracts } from "../config/contracts";
import { uniswapV3Pools } from "../config/pools";
import { UniswapNFTManager } from "../contracts/nftManager";
import { UniswapV3Pool } from "../contracts/v3Pool";

export const getAddLiquidityData = async ({
  poolAddress,
  chainId,
}: {
  poolAddress: HexString;
  chainId: number;
  account: HexString;
}): Promise<AddLiquidityProviderDetails> => {
  const nft = uniswapContracts[chainId].nftManager;

  const pool = new UniswapV3Pool({ address: poolAddress, chainId });
  const nftManager = new UniswapNFTManager({ chainId });

  const { token0, token1 } = uniswapV3Pools[chainId][poolAddress];

  const [{ currentTick, tickSpacing, sqrtPriceX96, fee }, lastNftId] =
    await Promise.all([pool.getPoolDetails(), nftManager.getLastNftId()]);

  return {
    farm: zeroAddress,
    lastNftId,
    nft,
    token0: token0.address,
    token1: token1.address,
    currentTick,
    tickSpacing,
    sqrtPriceX96,
    fee,
  };
};

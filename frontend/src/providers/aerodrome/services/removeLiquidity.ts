import { RemoveLiquidityProviderDetails } from "@/types/removeLiquidity";
import { HexString } from "@/types/string";
import { aerodromeAddresses } from "../config/contracts";
import { AerodromeNftManager } from "../contracts/nftManager";
import { AerodromeV3Pool } from "../contracts/v3Pool";

export const getRemoveLiquidityData = async ({
  poolAddress,
  chainId,
  nftId,
}: {
  poolAddress: HexString;
  chainId: number;
  nftId: bigint;
}): Promise<RemoveLiquidityProviderDetails> => {
  const nft = aerodromeAddresses[chainId].nftManager;

  const pool = new AerodromeV3Pool({ address: poolAddress, chainId });
  const nftManager = new AerodromeNftManager({ chainId });

  const [poolDetails, positionDetails] = await Promise.all([
    pool.getPoolDetails(),
    nftManager.getNftDetails({ nftId }),
  ]);

  if (!positionDetails) {
    throw new Error("Position details not found");
  }

  const { token0, token1, sqrtPriceX96, tick, tickSpacing } = poolDetails;
  const { liquidity, tickLower, tickUpper } = positionDetails;

  return {
    nftManagerAddress: nft,
    poolAddress,
    token0,
    token1,
    liquidity,
    lowerTick: tickLower,
    upperTick: tickUpper,
    currentTick: tick,
    sqrtPriceX96,
    tickSpacing,
  };
};

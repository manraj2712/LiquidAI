import { AddLiquidityProviderDetails } from "@/types/addLiquidity";
import { HexString } from "@/types/string";
import { aerodromeAddresses } from "../config/contracts";
import { aerodromePools } from "../config/pools";
import { AerodromeNftManager } from "../contracts/nftManager";
import { AerodromeV3Pool } from "../contracts/v3Pool";
import { zeroAddress } from "viem";

export const getAddLiquidityData = async ({
  poolAddress,
  chainId,
}: {
  poolAddress: HexString;
  chainId: number;
  account: HexString;
}): Promise<AddLiquidityProviderDetails> => {
  const nft = aerodromeAddresses[chainId].nftManager;

  const farm = aerodromePools[chainId][poolAddress].farm || zeroAddress;

  const pool = new AerodromeV3Pool({ address: poolAddress, chainId });
  const nftManager = new AerodromeNftManager({ chainId });

  const [{ token0, token1, tick, tickSpacing, sqrtPriceX96, fee }, lastNftId] =
    await Promise.all([pool.getPoolDetails(), nftManager.getLastNftId()]);

  return {
    farm,
    lastNftId,
    nft,
    token0,
    token1,
    currentTick: tick,
    tickSpacing,
    sqrtPriceX96,
    fee,
  };
};

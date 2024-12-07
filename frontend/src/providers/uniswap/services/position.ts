import { ProviderPositionDetails } from "@/types/position";
import { HexString } from "@/types/string";
import { uniswapV3Pools } from "../config/pools";
import { UniswapNFTManager } from "../contracts/nftManager";
import { UniswapV3Pool } from "../contracts/v3Pool";

export const findUserPositionsByPoolSymbol = async ({
  poolSymbol,
  chainId,
  account,
}: {
  poolSymbol: string;
  chainId: number;
  account: HexString;
}) => {
  const nftManager = new UniswapNFTManager({ chainId });

  const userNfts = await nftManager.getUserNfts({ account });

  const pools = uniswapV3Pools[chainId];

  const userPositionsForPool = userNfts.filter((nft) => {
    Object.values(pools).find((pool) => {
      return (
        nft.token0 === pool.token0.address &&
        nft.token1 === pool.token1.address &&
        `${pool.token0.symbol}/${pool.token1.symbol}` === poolSymbol
      );
    });
  });

  if (userPositionsForPool.length === 0) {
    throw new Error("No positions found for pool");
  }

  return userPositionsForPool.map((nft) => nft.nftId);
};

export const fetchUserPositions = async ({
  address,
  chainId,
}: {
  address: HexString;
  chainId: number;
}): Promise<ProviderPositionDetails[]> => {
  const nftManager = new UniswapNFTManager({ chainId });

  const userNftsDetails = await nftManager.getUserNfts({ account: address });

  const positions: ProviderPositionDetails[] = [];

  await Promise.allSettled(
    userNftsDetails.map(async (nft) => {
      const poolDetails = Object.values(uniswapV3Pools[chainId]).find(
        (pool) => {
          return (
            pool.token0.address === nft.token0 &&
            pool.token1.address === nft.token1
          );
        }
      );

      if (!poolDetails) {
        return;
      }

      const pool = new UniswapV3Pool({
        chainId,
        address: poolDetails.address,
      });

      const { sqrtPriceX96, currentTick } = await pool.getPoolDetails();

      positions.push({
        lowerTick: nft.tickLower,
        upperTick: nft.tickUpper,
        sqrtPriceX96,
        token0: poolDetails.token0.address,
        token1: poolDetails.token1.address,
        nftId: nft.nftId,
        currentTick,
        liquidity: nft.liquidity.toString(),
        poolAddress: poolDetails.address,
      });
    })
  );

  return positions;
};

import { chainsData } from "@/config/chain";
import {
  RemoveLiquidityProviderDetails,
  RemoveLiquidityRequest,
} from "@/types/removeLiquidity";
import { HexString } from "@/types/string";
import { V3PoolUtils } from "@/utils/v3Pools";
import { encodeFunctionData, maxInt128 } from "viem";
import { uniswapNFTManagerAbi } from "../abi/nftManager";
import { uniswapContracts } from "../config/contracts";
import { uniswapV3Pools } from "../config/pools";
import { UniswapNFTManager } from "../contracts/nftManager";
import { UniswapV3Pool } from "../contracts/v3Pool";

export const getRemoveLiquidityData = async ({
  poolAddress,
  chainId,
  nftId,
  request,
}: {
  poolAddress: HexString;
  chainId: number;
  nftId: bigint;
  request: RemoveLiquidityRequest;
}): Promise<RemoveLiquidityProviderDetails> => {
  const nft = uniswapContracts[chainId].nftManager;
  const zapAddress = chainsData[chainId].zap;

  const { token0, token1 } = uniswapV3Pools[chainId][poolAddress];

  const pool = new UniswapV3Pool({ address: poolAddress, chainId });
  const nftManager = new UniswapNFTManager({ chainId });

  const [poolDetails, positionDetails] = await Promise.all([
    pool.getPoolDetails(),
    nftManager.getNftDetails({ nftId }),
  ]);

  if (!positionDetails) {
    throw new Error("Position details not found");
  }

  const {
    sqrtPriceX96,
    currentTick,
    tickSpacing,
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
  } = poolDetails;
  const {
    liquidity,
    tickLower,
    tickUpper,
    feeGrowthInside0LastX128,
    feeGrowthInside1LastX128,
  } = positionDetails;

  const {
    feeGrowthOutsideLower0,
    feeGrowthOutsideLower1,
    feeGrowthOutsideUpper0,
    feeGrowthOutsideUpper1,
  } = await pool.getFeeGrowthOutside({
    lowerTick: tickLower,
    upperTick: tickUpper,
  });

  const { feesEarnedToken0, feesEarnedToken1 } =
    V3PoolUtils.calculateFeesInTokens({
      currentTick,
      lowerTick: tickLower,
      upperTick: tickUpper,
      liquidity,
      token0: {
        decimals: token0.decimals,
      },
      token1: {
        decimals: token1.decimals,
      },
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
      feeGrowthOutsideLower0,
      feeGrowthOutsideLower1,
      feeGrowthOutsideUpper0,
      feeGrowthOutsideUpper1,
      feeGrowthInside0: feeGrowthInside0LastX128,
      feeGrowthInside1: feeGrowthInside1LastX128,
    });

  console.log({
    currentTick,
    lowerTick: tickLower,
    upperTick: tickUpper,
    liquidity,
    token0: {
      decimals: token0.decimals,
    },
    token1: {
      decimals: token1.decimals,
    },
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
    feeGrowthOutsideLower0,
    feeGrowthOutsideLower1,
    feeGrowthOutsideUpper0,
    feeGrowthOutsideUpper1,
    feeGrowthInside0: feeGrowthInside0LastX128,
    feeGrowthInside1: feeGrowthInside1LastX128,
    nftId: nftId,
  });

  const collectFeesData = encodeFunctionData({
    abi: uniswapNFTManagerAbi,
    functionName: "collect",
    args: [
      {
        amount0Max: maxInt128,
        amount1Max: maxInt128,
        recipient: request.zapOutToken ? zapAddress : request.account,
        tokenId: nftId,
      },
    ],
  });

  return {
    poolAddress,
    token0: token0.address,
    token1: token1.address,
    liquidity,
    lowerTick: tickLower,
    upperTick: tickUpper,
    currentTick,
    sqrtPriceX96,
    tickSpacing,
    nftManagerAddress: nft,
    collectFeesData: {
      token0Fee: BigInt(feesEarnedToken0),
      token1Fee: BigInt(feesEarnedToken1),
      callData: collectFeesData,
    },
  };
};

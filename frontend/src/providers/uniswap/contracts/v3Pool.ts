import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getContract } from "viem";
import { uniswapV3PoolAbi } from "../abi/v3Pool";

export class UniswapV3Pool {
  private abi = uniswapV3PoolAbi;
  private address: HexString;
  private chainId: number;

  constructor({ address, chainId }: { address: HexString; chainId: number }) {
    this.address = address;
    this.chainId = chainId;
  }
  public getPoolDetails = async () => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const [
      slot0,
      tickSpacing,
      fee,
      liquidity,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
    ] = await Promise.all([
      contract.read.slot0(),
      contract.read.tickSpacing(),
      contract.read.fee(),
      contract.read.liquidity(),
      contract.read.feeGrowthGlobal0X128(),
      contract.read.feeGrowthGlobal1X128(),
    ]);

    return {
      sqrtPriceX96: slot0[0],
      currentTick: slot0[1],
      tickSpacing,
      fee,
      liquidity,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
    };
  };

  public getFeeGrowthOutside = async ({
    lowerTick,
    upperTick,
  }: {
    lowerTick: number;
    upperTick: number;
  }) => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const [feeGrowthGlobalLowerX128, feeGrowthGlobalUpperX128] =
      await Promise.all([
        contract.read.ticks([lowerTick]),
        contract.read.ticks([upperTick]),
      ]);

    return {
      feeGrowthOutsideLower0: feeGrowthGlobalLowerX128[2],
      feeGrowthOutsideLower1: feeGrowthGlobalLowerX128[3],
      feeGrowthOutsideUpper0: feeGrowthGlobalUpperX128[2],
      feeGrowthOutsideUpper1: feeGrowthGlobalUpperX128[3],
    };
  };
}

import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getContract, PublicClient } from "viem";
import { aerodromeV3PoolAbi } from "../abi/v3Pool";

export class AerodromeV3Pool {
  private address: HexString;
  private chainId: number;
  private publicClient: PublicClient;

  constructor({ address, chainId }: { address: HexString; chainId: number }) {
    this.address = address;
    this.chainId = chainId;
    this.publicClient = getPublicClient(this.chainId);
  }
  public getPoolDetails = async () => {
    const contract = getContract({
      abi: aerodromeV3PoolAbi,
      address: this.address,
      client: this.publicClient,
    });
    const [token0, token1, slot0, liquidity, tickSpacing, fee] =
      await Promise.all([
        contract.read.token0(),
        contract.read.token1(),
        contract.read.slot0(),
        contract.read.liquidity(),
        contract.read.tickSpacing(),
        contract.read.fee(),
      ]);
    return {
      token0,
      token1,
      tick: slot0[1],
      sqrtPriceX96: slot0[0],
      liquidity,
      tickSpacing,
      fee,
    } as {
      token0: HexString;
      token1: HexString;
      tick: number;
      sqrtPriceX96: bigint;
      liquidity: bigint;
      tickSpacing: number;
      fee: number;
    };
  };
}

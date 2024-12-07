import { HexString } from "./string";
import { AddLiquidityTxnDetails } from "./txn";
import { ZapData } from "./zap";

export type AddLiquidityRequest = {
  poolAddress: HexString;
  account: HexString;
  chainId: number;
  zapInToken: HexString;
  zapInAmount: string;
  provider: string;
};

export type AddLiquidityProviderRequest = {
  poolAddress: HexString;
  account: HexString;
  chainId: number;
  zapInToken: HexString;
  zapInAmount: string;
};

export type AddLiquidityProviderDetails = {
  farm: HexString;
  nft: HexString;
  token0: HexString;
  token1: HexString;
  currentTick: number;
  tickSpacing: number;
  sqrtPriceX96: bigint;
  fee: number;
  lastNftId: bigint;
};

export type BuildAddLiquidityProviderRequest = {
  token0: HexString;
  token1: HexString;
  lowerTick: number;
  upperTick: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  recipient: HexString;
  fee: number;
  chainId: number;
  sqrtPriceX96: bigint;
  tickSpacing: number;
};

export type AddLiquidityResponse = {
  callData: HexString;
  to: HexString;
  value: string;
  zapData: ZapData[];
  details: AddLiquidityTxnDetails;
};

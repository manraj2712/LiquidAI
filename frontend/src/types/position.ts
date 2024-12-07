import { HexString } from "./string";

export type ProviderPositionDetails = {
  token0: HexString;
  token1: HexString;
  upperTick: number;
  lowerTick: number;
  sqrtPriceX96: bigint;
  currentTick: number;
  nftId: bigint;
  liquidity: string;
  poolAddress: HexString;
};

export type UserPositionDetails = {
  token0: {
    address: HexString;
    amount: string;
    amountUsd: number;
    decimals: number;
    symbol: string;
    logo: string;
  };
  token1: {
    address: HexString;
    amount: string;
    amountUsd: number;
    decimals: number;
    symbol: string;
    logo: string;
  };
  provider: string;
  poolSymbol: string;
  inRange: boolean;
  nftId: string;
  poolAddress: HexString;
};

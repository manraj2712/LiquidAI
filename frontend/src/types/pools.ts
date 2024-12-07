import { HexString } from "./string";

export type PoolTokenInfo = {
  address: HexString;
  decimals: number;
  symbol: string;
};
export type PoolInfo = {
  address: HexString;
  token0: PoolTokenInfo;
  token1: PoolTokenInfo;
  fee: number;
  tickSpacing: number;
  farm?: HexString;
  provider: string;
};

export type PoolDetails = {
  token0: PoolTokenInfo & { logo: string };
  token1: PoolTokenInfo & { logo: string };
  fee: number;
  provider: string;
  poolAddress: HexString;
};

export type ProviderPools = Record<number, Record<HexString, PoolInfo>>;

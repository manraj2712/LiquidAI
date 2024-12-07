import { HexString } from "./string";
import { RemoveLiquidityTxnDetails } from "./txn";
import { ZapData } from "./zap";

export type RemoveLiquidityRequest = {
  poolAddress: HexString;
  account: HexString;
  provider: string;
  chainId: number;
  zapOutToken?: HexString;
  zapOutAmount?: string;
  nftId: string;
};

export type RemoveLiquidityProviderDetails = {
  poolAddress: HexString;
  liquidity: bigint;
  token0: HexString;
  token1: HexString;
  currentTick: number;
  lowerTick: number;
  upperTick: number;
  tickSpacing: number;
  sqrtPriceX96: bigint;
  nftManagerAddress: HexString;
  collectFeesData?: {
    token0Fee: bigint;
    token1Fee: bigint;
    callData: HexString;
  };
};

export type BuildRemoveLiquidityProviderRequest = {
  amount0Min: bigint;
  amount1Min: bigint;
  tokenId: bigint;
  liquidity: bigint;
  chainId: number;
};

export type RemoveLiquidityResponse = {
  callData: HexString;
  to: HexString;
  value: string;
  details: RemoveLiquidityTxnDetails;
  zapData: ZapData[];
};

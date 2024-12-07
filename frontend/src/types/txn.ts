import { txnStatus } from "@/constants/transaction";
import { HexString } from "./string";

export type BuildTxnResponse = {
  callData: HexString;
  value: bigint;
  to: HexString;
};

export type TxnDetailsTokenData = {
  address: HexString;
  amount: string;
  amountUsd: number;
  decimals: number;
  symbol: string;
  logo: string;
};

export type AddLiquidityTxnDetails = {
  zapInToken: TxnDetailsTokenData;
  token0: TxnDetailsTokenData;
  token1: TxnDetailsTokenData;
  provider: string;
  poolSymbol: string;
  apy: number;
  nftManagerAddress: HexString;
};

export type RemoveLiquidityTxnDetails = {
  zapOutToken?: TxnDetailsTokenData;
  token0: TxnDetailsTokenData;
  token1: TxnDetailsTokenData;
  provider: string;
  poolSymbol: string;
  nftManagerAddress: HexString;
};

export type TxnStatus = keyof typeof txnStatus;

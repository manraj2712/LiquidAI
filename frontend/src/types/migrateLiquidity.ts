import { HexString } from "./string";
import { AddLiquidityTxnDetails, RemoveLiquidityTxnDetails } from "./txn";
import { ZapData } from "./zap";

export type MigrateLiquidityRequest = {
  srcPoolAddress: HexString;
  destPoolAddress: HexString;
  srcProvider: string;
  destProvider: string;
  account: HexString;
  chainId: number;
  nftId: string;
};

export type MigrateLiquidityResponse = {
  zapData: ZapData[];
  callData: HexString;
  to: HexString;
  addLiquidityDetails: AddLiquidityTxnDetails;
  removeLiquidityDetails: RemoveLiquidityTxnDetails;
  value: string;
};

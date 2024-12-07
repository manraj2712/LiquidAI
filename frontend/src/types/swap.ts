import { HexString } from "./string";

export type SwapRequestData = {
  amount: string;
  srcToken: HexString;
  srcDecimals: number;
  destToken: HexString;
  destDecimals: number;
  slippage: number;
};

export type SwapRequest = {
  chainId: number;
  recipient: HexString;
  refundee: HexString;
  sender: HexString;
  data: SwapRequestData[];
};

export type PoolTokensToDestSwapReq = {
  chainId: number;
  recipient: HexString;
  refundee: HexString;
  sender: HexString;
  data: {
    amount0: string;
    amount1: string;
    token0: HexString;
    token1: HexString;
    slippage: number;
  };
};

export type SwapResponse = {
  swapData: {
    callTo: HexString;
    approveTo: HexString;
    from: HexString;
    to: HexString;
    fromAmount: string;
    minToAmount: string;
    swapCallData: HexString;
    permit: HexString;
  }[];
  transactionRequest: {
    txId: HexString;
    data: HexString;
    to: HexString;
    from: HexString;
    chainId: number;
    value: string;
    gasLimit: string;
  };
};

export type SwapData = {
  callTo: HexString;
  approveTo: HexString;
  recipient: HexString;
  callData: HexString;
  from: HexString;
  to: HexString;
  fromAmount: bigint;
  minReturnAmount: bigint;
};

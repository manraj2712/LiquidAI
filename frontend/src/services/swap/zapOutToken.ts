import { HexString } from "@/types/string";
import { SwapRequestData } from "@/types/swap";
import { buildSwapTxn } from "./buildTxn";
import {
  InputTransferType,
  OutputTransferType,
  TokenType,
  ZapData,
} from "@/types/zap";

export const swapPoolTokensToZapOut = async ({
  tokens,
  zapOutToken,
  chainId,
  sender,
  recipient,
  refundee,
  inputTranserType,
  outputTransferType,
}: {
  tokens: {
    address: HexString;
    decimals: number;
    amount: string;
  }[];
  zapOutToken: {
    address: HexString;
    decimals: number;
  };
  chainId: number;
  sender: HexString;
  recipient: HexString;
  refundee: HexString;
  inputTranserType: InputTransferType;
  outputTransferType: OutputTransferType;
}) => {
  const swapRequestData: SwapRequestData[] = [];

  tokens.forEach((token) => {
    if (
      token.address !== zapOutToken.address &&
      BigInt(token.amount) > BigInt(0)
    ) {
      swapRequestData.push({
        amount: token.amount,
        srcToken: token.address,
        srcDecimals: token.decimals,
        destToken: zapOutToken.address,
        destDecimals: zapOutToken.decimals,
        slippage: 0.5,
      });
    }
  });

  if (swapRequestData.length === 0) {
    return null;
  }

  const quotes = await buildSwapTxn({
    chainId,
    recipient,
    refundee,
    sender,
    data: swapRequestData,
  });

  if (!quotes || !quotes.transactionRequest) {
    throw new Error("Failed to get swap quotes");
  }

  if (
    tokens.some(
      (token) =>
        token.address !== zapOutToken.address &&
        !quotes.swapData.find((swapData) => swapData.from === token.address)
    )
  ) {
    throw new Error("Failed to get swap quotes for all tokens");
  }

  const zapOutAmount = tokens.reduce((acc, token) => {
    const tokenAmount =
      quotes.swapData.find((swapData) => swapData.from === token.address)
        ?.minToAmount ?? token.amount;
    return acc + BigInt(tokenAmount);
  }, BigInt(0));

  const { transactionRequest, swapData } = quotes;

  const zapData: ZapData = {
    callData: transactionRequest.data,
    callTo: transactionRequest.to,
    input: tokens.map((token) => ({
      tokenType: TokenType.ERC20,
      transferType: inputTranserType,
      tokenAddress: token.address,
      approveTo: recipient,
      amount: BigInt(token.amount),
      tokenId: BigInt(0),
    })),
    output: [
      {
        tokenType: TokenType.ERC20,
        transferType: outputTransferType,
        tokenAddress: zapOutToken.address,
        recipient,
        minReturn: zapOutAmount,
        tokenId: BigInt(0),
      },
    ],
    isDelegateCall: false,
    nativeValue: BigInt(transactionRequest.value),
  };

  return {
    zapOutAmount,
    transactionRequest,
    swapData,
    zapData,
  };
};

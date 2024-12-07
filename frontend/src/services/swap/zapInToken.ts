import { HexString } from "@/types/string";
import { SwapRequestData } from "@/types/swap";
import {
  InputTransferType,
  OutputToken,
  OutputTransferType,
  TokenType,
  ZapData,
} from "@/types/zap";
import { calculateZapInToTokenDistribution } from "@/utils/amount";
import { buildSwapTxn } from "./buildTxn";

const swapZapInTokenToPoolTokens = async ({
  tokens,
  zapInToken,
  chainId,
  slippage,
  recipient,
  sender,
  refundee,
}: {
  tokens: {
    address: HexString;
    decimals: number;
    amount: string;
  }[];
  zapInToken: {
    address: HexString;
    decimals: number;
  };
  chainId: number;
  slippage: number;
  recipient: HexString;
  sender: HexString;
  refundee: HexString;
}) => {
  const swapRequestData: SwapRequestData[] = [];

  tokens.forEach((token) => {
    if (token.address !== zapInToken.address) {
      swapRequestData.push({
        amount: token.amount,
        srcToken: zapInToken.address,
        srcDecimals: zapInToken.decimals,
        destToken: token.address,
        destDecimals: token.decimals,
        slippage,
      });
    }
  });

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
        token.address !== zapInToken.address &&
        !quotes.swapData.find((swapData) => swapData.to === token.address)
    )
  ) {
    throw new Error("Failed to get swap quotes for all tokens");
  }

  const tokensToAmount = tokens.reduce((acc, token) => {
    acc[token.address] =
      quotes.swapData.find((swapData) => swapData.to === token.address)
        ?.minToAmount ?? token.amount;
    return acc;
  }, {} as { [key: string]: string });

  return {
    ...quotes,
    amounts: tokensToAmount,
  };
};

export const swapZapInTokenForPoolTokens = async ({
  tokens,
  zapInToken,
  chainId,
  sender,
  recipient,
  refundee,
  token1ToToken0,
  outputTransferType,
  inputTransferType,
}: {
  tokens: {
    address: HexString;
    decimals: number;
    price: number;
  }[];
  zapInToken: {
    address: HexString;
    amount: string;
    decimals: number;
    price: number;
  };
  chainId: number;
  sender: HexString;
  recipient: HexString;
  refundee: HexString;
  token1ToToken0: number;
  outputTransferType: OutputTransferType;
  inputTransferType: InputTransferType;
}) => {
  const token0 = tokens[0];
  const token1 = tokens[1];

  const { amount0InWei, amount1InWei } = calculateZapInToTokenDistribution({
    token0: {
      decimals: token0.decimals,
      price: token0.price,
    },
    token1: {
      decimals: token1.decimals,
      price: token1.price,
    },
    zapInToken: {
      decimals: zapInToken.decimals,
      price: zapInToken.price,
    },
    token1ToToken0,
    zapInAmount: zapInToken.amount,
  });

  const { amounts, transactionRequest, swapData } =
    await swapZapInTokenToPoolTokens({
      chainId,
      tokens: [
        {
          address: token0.address,
          decimals: token0.decimals,
          amount: amount0InWei,
        },
        {
          address: token1.address,
          decimals: token1.decimals,
          amount: amount1InWei,
        },
      ],
      zapInToken: {
        address: zapInToken.address,
        decimals: zapInToken.decimals,
      },
      slippage: 0.5,
      recipient,
      sender,
      refundee,
    });

  const output: OutputToken[] = [];

  if (token0.address !== zapInToken.address) {
    output.push({
      tokenAddress: token0.address,
      minReturn: BigInt(amounts[token0.address]),
      recipient,
      tokenId: BigInt(0),
      tokenType: TokenType.ERC20,
      transferType: outputTransferType,
    });
  }

  if (token1.address !== zapInToken.address) {
    output.push({
      tokenAddress: token1.address,
      minReturn: BigInt(amounts[token1.address]),
      recipient,
      tokenId: BigInt(0),
      tokenType: TokenType.ERC20,
      transferType: outputTransferType,
    });
  }

  const zapData: ZapData = {
    input: [
      {
        amount: BigInt(zapInToken.amount),
        approveTo: transactionRequest.to,
        tokenAddress: zapInToken.address,
        tokenId: BigInt(0),
        tokenType: TokenType.ERC20,
        transferType: inputTransferType,
      },
    ],
    callData: transactionRequest.data,
    callTo: transactionRequest.to,
    nativeValue: BigInt(transactionRequest.value),
    isDelegateCall: false,
    output,
  };

  return {
    amounts,
    transactionRequest,
    swapData,
    zapData,
  };
};

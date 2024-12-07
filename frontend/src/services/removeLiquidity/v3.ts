import { zapContractAbi } from "@/abi/zap";
import { chainsData } from "@/config/chain";
import { IProvider } from "@/types/iProvider";
import {
  RemoveLiquidityRequest,
  RemoveLiquidityResponse,
} from "@/types/removeLiquidity";
import { TokenInfo } from "@/types/token";
import {
  InputTransferType,
  OutputTransferType,
  TokenType,
  ZapData,
} from "@/types/zap";
import { generateBytes32TxnId } from "@/utils/id";
import { getSlippageToleranceAndMinAmount } from "@/utils/slippage";
import { V3PoolUtils } from "@/utils/v3Pools";
import { encodeFunctionData, formatUnits } from "viem";
import { swapPoolTokensToZapOut } from "../swap/zapOutToken";
import { getTokensDetails } from "../tokens/details";

export const generateRemoveV3LiquidityData = async ({
  request,
  provider,
  isFinalStep,
}: {
  request: RemoveLiquidityRequest;
  provider: IProvider;
  isFinalStep: boolean;
}): Promise<RemoveLiquidityResponse> => {
  const { account, chainId, poolAddress, zapOutToken, nftId } = request;
  const zapAddress = chainsData[chainId].zap;

  const slippage = 0.5;

  const pool = provider.getPoolFromAddress({
    address: poolAddress,
    chainId,
  });

  if (!pool) {
    throw new Error(`Pool not found.`);
  }

  const providerData = await provider.removeLiquidity({
    chainId,
    pool: pool.address,
    nftId: BigInt(nftId),
    request,
  });

  const {
    currentTick,
    lowerTick,
    nftManagerAddress,
    sqrtPriceX96,
    token0,
    token1,
    upperTick,
    liquidity,
    collectFeesData,
  } = providerData;

  const zapData: ZapData[] = [];

  let { amount0InWei, amount1InWei } = V3PoolUtils.getTokenAmountsForLiquidity({
    liquidity: liquidity.toString(),
    sqrtPriceX96,
    lowerTick,
    upperTick,
    currentTick,
  });

  amount0InWei = (
    BigInt(amount0InWei) + BigInt(collectFeesData?.token0Fee || 0)
  ).toString();
  amount1InWei = (
    BigInt(amount1InWei) + BigInt(collectFeesData?.token1Fee || 0)
  ).toString();

  const { minAmount: amount0Min } = getSlippageToleranceAndMinAmount(
    (BigInt(amount0InWei) + BigInt(collectFeesData?.token0Fee || 0)).toString(),
    slippage
  );
  const { minAmount: amount1Min } = getSlippageToleranceAndMinAmount(
    (BigInt(amount1InWei) + BigInt(collectFeesData?.token1Fee || 0)).toString(),
    slippage
  );

  const tokens = [token0, token1];

  if (zapOutToken) {
    tokens.push(zapOutToken);
  }

  const [{ callData, value }, tokenDetails] = await Promise.all([
    provider.buildRemoveLiquidityTxn({
      // amount0Min: BigInt(amount0Min),
      // amount1Min: BigInt(amount1Min),
      amount0Min: BigInt(0),
      amount1Min: BigInt(0),
      chainId,
      liquidity,
      tokenId: BigInt(nftId),
    }),
    getTokensDetails(tokens, chainId),
  ]);

  const token0Details = tokenDetails[token0];
  const token1Details = tokenDetails[token1];

  zapData.push({
    input: [
      {
        amount: BigInt(0),
        approveTo: nftManagerAddress,
        tokenAddress: nftManagerAddress,
        tokenId: BigInt(nftId),
        tokenType: TokenType.ERC721,
        transferType: InputTransferType.SafeTransferAndApprove,
      },
    ],
    output: collectFeesData
      ? []
      : [
          {
            minReturn: BigInt(0),
            recipient: zapOutToken ? zapAddress : account,
            tokenAddress: token0,
            tokenId: BigInt(0),
            tokenType: TokenType.ERC20,
            transferType: zapOutToken
              ? OutputTransferType.UseMinAndReturnRemainder
              : OutputTransferType.DirectTransferToRecipient,
          },
          {
            minReturn: BigInt(0),
            recipient: zapOutToken ? zapAddress : account,
            tokenAddress: token1,
            tokenId: BigInt(0),
            tokenType: TokenType.ERC20,
            transferType: zapOutToken
              ? OutputTransferType.UseMinAndReturnRemainder
              : OutputTransferType.DirectTransferToRecipient,
          },
        ],
    isDelegateCall: false,
    callData,
    callTo: nftManagerAddress,
    nativeValue: BigInt(value),
  });

  let zapOutTokenDetails: TokenInfo | undefined;
  let zapOutAmount: string = "0";

  if (collectFeesData) {
    zapData.push({
      callData: collectFeesData.callData,
      callTo: nftManagerAddress,
      input: [],
      isDelegateCall: false,
      nativeValue: BigInt(0),
      output: [
        {
          minReturn: BigInt(amount0Min),
          recipient: zapOutToken ? zapAddress : account,
          tokenAddress: token0,
          tokenId: BigInt(nftId),
          tokenType: TokenType.ERC20,
          transferType: zapOutToken
            ? OutputTransferType.UseMinAndReturnRemainder
            : OutputTransferType.DirectTransferToRecipient,
        },
        {
          minReturn: BigInt(amount1Min),
          recipient: zapOutToken ? zapAddress : account,
          tokenAddress: token1,
          tokenId: BigInt(nftId),
          tokenType: TokenType.ERC20,
          transferType: zapOutToken
            ? OutputTransferType.UseMinAndReturnRemainder
            : OutputTransferType.DirectTransferToRecipient,
        },
      ],
    });
  }

  if (zapOutToken) {
    const token0Details = tokenDetails[token0];
    const token1Details = tokenDetails[token1];
    zapOutTokenDetails = tokenDetails[zapOutToken];

    if (!zapOutTokenDetails) {
      throw new Error(`Token details for zapOutToken not found.`);
    }

    const swapResponse = await swapPoolTokensToZapOut({
      tokens: [
        {
          address: token0,
          decimals: token0Details.decimals,
          amount: amount0InWei,
        },
        {
          address: token1,
          decimals: token1Details.decimals,
          amount: amount1InWei,
        },
      ],
      zapOutToken: {
        address: zapOutToken,
        decimals: zapOutTokenDetails.decimals,
      },
      chainId,
      sender: account,
      recipient: zapAddress,
      refundee: account,
      inputTranserType: InputTransferType.ApproveOnly,
      outputTransferType: isFinalStep
        ? OutputTransferType.DirectTransferToRecipient
        : OutputTransferType.UseMinAndReturnRemainder,
    });

    if (swapResponse) {
      const { swapData, zapData: swapZapData } = swapResponse;
      zapOutAmount = swapData
        .reduce((acc, { minToAmount }) => {
          return BigInt(acc) + BigInt(minToAmount);
        }, BigInt(0))
        .toString();

      zapData.push(swapZapData);
    } else {
      zapOutAmount = token0 === zapOutToken ? amount0InWei : amount1InWei;
    }
  }

  const zapCallData = encodeFunctionData({
    abi: zapContractAbi,
    functionName: "zap",
    args: [generateBytes32TxnId(account), zapData, []],
  });
  return {
    callData: zapCallData,
    to: zapAddress,
    zapData,
    value: "0",
    details: {
      nftManagerAddress,
      poolSymbol: `${token0Details.symbol}-${token1Details.symbol}`,
      provider: provider.details.name,
      token0: {
        address: token0,
        amount: amount0InWei.toString(),
        amountUsd:
          +formatUnits(BigInt(amount0InWei), token0Details.decimals) *
          +(token0Details.price || 0),
        symbol: token0Details.symbol,
        decimals: token0Details.decimals,
        logo: token0Details.logo,
      },
      token1: {
        address: token1,
        amount: amount1InWei.toString(),
        amountUsd:
          +formatUnits(BigInt(amount1InWei), token1Details.decimals) *
          +(token1Details.price || 0),
        symbol: token1Details.symbol,
        logo: token1Details.logo,
        decimals: token1Details.decimals,
      },
      zapOutToken:
        zapOutTokenDetails && zapOutToken
          ? {
              address: zapOutToken,
              amount: zapOutAmount,
              amountUsd:
                +formatUnits(
                  BigInt(zapOutAmount),
                  zapOutTokenDetails.decimals
                ) * +(zapOutTokenDetails.price || 0),
              decimals: zapOutTokenDetails.decimals,
              symbol: zapOutTokenDetails.symbol,
              logo: zapOutTokenDetails.logo,
            }
          : undefined,
    },
  };
};

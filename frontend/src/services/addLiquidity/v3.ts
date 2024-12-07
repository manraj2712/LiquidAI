import { zapContractAbi } from "@/abi/zap";
import { chainsData } from "@/config/chain";
import {
  AddLiquidityProviderRequest,
  AddLiquidityResponse,
} from "@/types/addLiquidity";
import { IProvider } from "@/types/iProvider";
import {
  InputTransferType,
  OutputTransferType,
  TokenType,
  ZapData,
} from "@/types/zap";
import { generateBytes32TxnId } from "@/utils/id";
import { getPublicClient } from "@/utils/publicClient";
import { V3PoolUtils } from "@/utils/v3Pools";
import { encodeFunctionData, formatUnits } from "viem";
import { swapZapInTokenForPoolTokens } from "../swap/zapInToken";
import { getTokensDetails } from "../tokens/details";

export const generateAddV3LiquidityData = async ({
  request,
  provider,
  isFinalStep,
}: {
  request: AddLiquidityProviderRequest;
  provider: IProvider;
  isFinalStep: boolean;
}): Promise<AddLiquidityResponse> => {
  // const slippage = 0.5;
  const { poolAddress, chainId, account, zapInAmount, zapInToken } = request;
  const zapAddress = chainsData[chainId].zap;

  const poolInfo = provider.getPoolFromAddress({
    address: poolAddress,
    chainId,
  });

  const [addLiquidityDetails, tokenDetails] = await Promise.all([
    provider.getAddLiquidityDetails({
      pool: poolInfo.address,
      chainId,
      account,
    }),
    getTokensDetails(
      [poolInfo.token0.address, poolInfo.token1.address, zapInToken],
      chainId
    ),
  ]);

  const token0Price = tokenDetails[poolInfo.token0.address].price;
  const token1Price = tokenDetails[poolInfo.token1.address].price;
  const zapInTokenPrice = tokenDetails[zapInToken].price;

  if (!token0Price || !token1Price || !zapInTokenPrice) {
    throw new Error("Failed to get token prices");
  }

  const { currentTick, tickSpacing, sqrtPriceX96, fee, nft } =
    addLiquidityDetails;

  const lowerTick = V3PoolUtils.nearestUsableTick({
    tickSpacing,
    tick: currentTick - tickSpacing,
  });

  const upperTick = V3PoolUtils.nearestUsableTick({
    tickSpacing,
    tick: currentTick + tickSpacing,
  });

  const token1ToToken0 = V3PoolUtils.getToken1Amount({
    formattedToken0Amount: 1,
    sqrtPriceX96: sqrtPriceX96,
    decimal0: tokenDetails[poolInfo.token0.address].decimals,
    decimal1: tokenDetails[poolInfo.token1.address].decimals,
    lowerTick,
    upperTick,
  });

  const zapData: ZapData[] = [];

  const { amounts, zapData: swapZapData } = await swapZapInTokenForPoolTokens({
    tokens: [
      {
        address: poolInfo.token0.address,
        decimals: tokenDetails[poolInfo.token0.address].decimals,
        price: +token0Price,
      },
      {
        address: poolInfo.token1.address,
        decimals: tokenDetails[poolInfo.token1.address].decimals,
        price: +token1Price,
      },
    ],
    zapInToken: {
      address: zapInToken,
      amount: zapInAmount,
      decimals: tokenDetails[zapInToken].decimals,
      price: +zapInTokenPrice,
    },
    chainId: chainId,
    recipient: zapAddress,
    refundee: account,
    sender: account,
    token1ToToken0,
    outputTransferType: OutputTransferType.UseMinAndReturnRemainder,
    inputTransferType: isFinalStep
      ? InputTransferType.ApproveOnly
      : InputTransferType.SafeTransferAndApprove,
  });

  zapData.push(swapZapData);

  const { token0Amount, token1Amount } = V3PoolUtils.calculateOptimalAmount({
    token0: {
      decimals: tokenDetails[poolInfo.token0.address].decimals,
      amount: BigInt(amounts[poolInfo.token0.address]),
    },
    token1: {
      decimals: tokenDetails[poolInfo.token1.address].decimals,
      amount: BigInt(amounts[poolInfo.token1.address]),
    },
    sqrtPriceX96: sqrtPriceX96,
    lowerTick,
    upperTick,
  });

  // const { minAmount: amount0Min } = getSlippageToleranceAndMinAmount(
  //   token0Amount.toString(),
  //   slippage
  // );

  // const { minAmount: amount1Min } = getSlippageToleranceAndMinAmount(
  //   token1Amount.toString(),
  //   slippage
  // );

  const { callData, to, value } = await provider.buildAddLiquidityTxn({
    token0: poolInfo.token0.address,
    token1: poolInfo.token1.address,
    lowerTick,
    upperTick,
    amount0Desired: token0Amount,
    amount1Desired: token1Amount,
    amount0Min: BigInt(0),
    amount1Min: BigInt(0),
    recipient: account,
    fee,
    chainId: chainId,
    sqrtPriceX96,
    tickSpacing,
  });

  zapData.push({
    input: [
      {
        amount: token0Amount,
        approveTo: to,
        tokenAddress: poolInfo.token0.address,
        transferType: InputTransferType.ApproveOnly,
        tokenId: BigInt(0),
        tokenType: TokenType.ERC20,
      },
      {
        amount: token1Amount,
        approveTo: to,
        tokenAddress: poolInfo.token1.address,
        transferType: InputTransferType.ApproveOnly,
        tokenId: BigInt(0),
        tokenType: TokenType.ERC20,
      },
    ],
    callData,
    callTo: to,
    isDelegateCall: false,
    nativeValue: BigInt(value),
    output: [
      // {
      //   minReturn: BigInt(0),
      //   recipient: account,
      //   tokenAddress: nft,
      //   tokenId: BigInt(lastNftId + BigInt(1)),
      //   tokenType: TokenType.ERC721,
      //   transferType: OutputTransferType.DirectTransferToRecipient,
      // },
    ],
  });

  const zapCallData = encodeFunctionData({
    abi: zapContractAbi,
    functionName: "zap",
    args: [generateBytes32TxnId(account), zapData, []],
  });

  const publicClient = getPublicClient(chainId);

  const blockNumber = await publicClient.getBlockNumber();
  console.log({ blockNumber });
  console.log({ account });

  return {
    callData: zapCallData,
    zapData,
    to: zapAddress,
    value: "0",
    // zapData,
    details: {
      nftManagerAddress: nft,
      apy: 100,
      poolSymbol: `${poolInfo.token0.symbol}-${poolInfo.token1.symbol}`,
      provider: provider.details.name,
      token0: {
        address: poolInfo.token0.address,
        amount: token0Amount.toString(),
        amountUsd:
          +formatUnits(
            token0Amount,
            tokenDetails[poolInfo.token0.address].decimals
          ) * +token0Price,
        decimals: tokenDetails[poolInfo.token0.address].decimals,
        symbol: tokenDetails[poolInfo.token0.address].symbol,
        logo: tokenDetails[poolInfo.token0.address].logo,
      },
      token1: {
        address: poolInfo.token1.address,
        amount: token1Amount.toString(),
        amountUsd:
          +formatUnits(
            token1Amount,
            tokenDetails[poolInfo.token1.address].decimals
          ) * +token1Price,
        decimals: tokenDetails[poolInfo.token1.address].decimals,
        symbol: tokenDetails[poolInfo.token1.address].symbol,
        logo: tokenDetails[poolInfo.token1.address].logo,
      },
      zapInToken: {
        address: zapInToken,
        amount: zapInAmount,
        amountUsd:
          +formatUnits(BigInt(zapInAmount), tokenDetails[zapInToken].decimals) *
          +zapInTokenPrice,
        decimals: tokenDetails[zapInToken].decimals,
        symbol: tokenDetails[zapInToken].symbol,
        logo: tokenDetails[zapInToken].logo,
      },
    },
  };
};

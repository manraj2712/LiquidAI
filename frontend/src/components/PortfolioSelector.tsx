"use client";

import { useAppContext } from "@/app/context/AppContext";
import { urls } from "@/constants/urls";
import { callApi } from "@/helpers/axios";
import { getResponseForInput } from "@/services/ai/sendMessage";
import { HexString } from "@/types/string";
import { TokenInfo, TokenReponse } from "@/types/token";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";
import Shimmer from "./ui/shimmer";

const TokenRow = ({
  token,
  onClick,
  isSelected,
}: {
  token: TokenInfo;
  onClick: () => void;
  isSelected: boolean;
}) => {
  return (
    <Button
      key={token.contract}
      onClick={onClick}
      className={`w-full flex gap-4 items-center justify-between rounded-lg bg-gray-80 hover:bg-gray-30 px-2 py-8 ${
        isSelected ? "bg-gray-30" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-30 flex items-center justify-center">
          <img
            src={token.logo}
            alt={`${token.name} icon`}
            className="w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-1 items-start">
          <p className="font-medium text-white">{token.name}</p>
          <p className="text-xs text-white ">{token.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-white">
          {formatUnits(BigInt(token.balance ?? "0"), token.decimals)}
        </p>
        <p className="text-sm text-gray-400">${token.balanceInUsd ?? "0"}</p>
      </div>
    </Button>
  );
};

export default function PortfolioSelector({ isZapIn }: { isZapIn: boolean }) {
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const { addMessage, chatId, removeMessage } = useAppContext();
  const { address, chainId } = useAccount();
  const [portfolioTokens, setPortfolioTokens] = useState<TokenReponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const response = (await callApi({
        url: urls.tokens,
        options: {
          params: {
            chainId: chainId!,
            account: address,
          },
        },
      })) as TokenReponse;

      const portfolio = Object.values(response).filter(
        (token) => BigInt(token.balance || "0") > 0
      );

      setPortfolioTokens(
        portfolio.reduce((acc, token) => {
          acc[token.contract as HexString] = token;
          return acc;
        }, {} as TokenReponse)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSumbit = async () => {
    const response = await getResponseForInput({
      chatId,
      message: `token ${selectedToken?.contract}`,
      chainId: chainId!,
      addMessage,
      removeMessage,
    });
    addMessage(response);
  };

  useEffect(() => {
    if (address) {
      fetchTokens();
    }
  }, [address, chainId]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-md">
        <h2 className="text-lg font-medium text-white mb-4 text-left bg-gray-40 px-4 py-2 rounded-lg border-thin border-gray-20">
          {isZapIn
            ? "Select the token which you want to zap in to add liquidity"
            : "Select the token which you want to zap out from the liquidity"}
        </h2>
        <div className="space-y-4 bg-gray-40 rounded-lg px-4 py-4 max-w-md">
          <h2 className="text-xl text-white mb-2">Your Portfolio</h2>
          <hr className="border-thin mt-2 border-gray-20"></hr>
          <div className="mb-6">
            <div className="text-sm text-gray-400">Total Value</div>
            <Shimmer width="200px" height="16px" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 gap-40 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <Shimmer
                    width="30px"
                    height="30px"
                    className="rounded-full"
                  />

                  <div className="flex flex-col gap-2">
                    <Shimmer width="40px" height="8px" />
                    <Shimmer width="40px" height="8px" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Shimmer width="100px" height="16px" />
                  <Shimmer width="120px" height="16px" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-full justify-end">
            <Shimmer width="50%" height="30px" />
          </div>
        </div>
      </div>
    );
  }

  if (isConfirmed && selectedToken) {
    return (
      <div className="bg-gray-40 rounded-full px-2">
        <TokenRow token={selectedToken} onClick={() => {}} isSelected={false} />
      </div>
    );
  }
  return (
    <div className="w-full max-w-md px-6 rounded-xl flex gap-3 flex-col text-white">
      <h2 className="text-lg font-medium text-white mb-4 text-left bg-gray-40 px-4 py-2 rounded-lg border-thin border-gray-20">
        {isZapIn
          ? "Select the token which you want to zap in to add liquidity"
          : "Select the token which you want to zap out from the liquidity"}{" "}
      </h2>

      <div className="bg-gray-40 rounded-lg border-thin border-gray-20">
        <div className="pt-4 px-4">
          <h3 className="text-lg font-medium mb-4">Your Portfolio</h3>
        </div>
        <hr className="border-thin mt-2 border-gray-20"></hr>
        <div className="p-4">
          <div className="mb-2">
            <p>Total Value</p>
            <p className="text-2xl font-medium">
              $
              {Object.values(portfolioTokens)
                .reduce((acc, token) => {
                  return acc + parseFloat(token.balanceInUsd ?? "0");
                }, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="h-auto max-h-80 overflow-y-scroll  flex flex-col gap-4">
            {Object.values(portfolioTokens).map((token) => (
              <TokenRow
                onClick={() => {
                  setSelectedToken(token);
                }}
                isSelected={selectedToken?.contract === token.contract}
                token={token}
                key={token.contract}
              />
            ))}
          </div>
        </div>

        <hr className="mt-2 border-thin border-gray-20"></hr>
        <div className="flex items-center px-4 py-2 justify-end">
          <Button
            onClick={() => {
              if (selectedToken) {
                setIsConfirmed(true);
                handleTokenSumbit();
              }
            }}
            disabled={!selectedToken}
            className={
              "w-1/2 py-3 px-4 range-button-active disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            }
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

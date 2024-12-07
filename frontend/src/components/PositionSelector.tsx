"use client";

import { useAppContext } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import { callApi } from "@/helpers/axios";
import { aerodromeDetails } from "@/providers/aerodrome/config/details";
import { uniswapDetails } from "@/providers/uniswap/config/details";
import { getResponseForInput } from "@/services/ai/sendMessage";
import { UserPositionDetails } from "@/types/position";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import AIThinkingState from "./AiThinking";
import { TextMessage } from "./ChatMessages";
import Shimmer from "./ui/shimmer";

const PositionRow = ({
  position,
  onClick,
}: {
  position: UserPositionDetails;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start p-4 h-auto transition-all bg-gray-70`}
      onClick={onClick}
    >
      <PositionDetailsRow position={position} />
    </Button>
  );
};

export const PositionSelector = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [userPositions, setUserPositions] = useState<UserPositionDetails[]>([]);

  const { address, chainId } = useAccount();

  const { addMessage, chatId } = useAppContext();

  const [selectedPosition, setSelectedPosition] =
    useState<UserPositionDetails | null>(null);

  useEffect(() => {
    const fetchUserPositions = async () => {
      try {
        const response = await callApi({
          url: "/api/user/positions",
          options: {
            method: "POST",
            data: {
              chainId,
              account: address,
            },
          },
        });
        setUserPositions(response);
      } catch {
        setUserPositions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserPositions();
  }, []);

  if (isLoading) {
    <AIThinkingState />;
  }
  if (!isLoading && userPositions.length === 0) {
    return (
      <div>
        <TextMessage message="You don't have any positions to migrate" />
      </div>
    );
  }
  if (!isLoading && selectedPosition) {
    return (
      <div className="w-full justify-start p-4 h-auto transition-all bg-gray-70 rounded-xl">
        <PositionDetailsRow position={selectedPosition} />
      </div>
    );
  }
  return (
    <div className="space-y-4 m-4">
      <h3 className="text-lg font-medium text-white">Select Source Pool</h3>
      <div className="h-auto max-h-[300px] rounded-lg border border-zinc-800 bg-gray-20 p-4 overflow-y-scroll">
        <div className="space-y-3">
          {userPositions?.length === 0 ? (
            <div className="flex items-center justify-between  text-white rounded-lg p-4 w-[300px] h-[80px]">
              <div className="flex items-center space-x-2">
                <Shimmer width="24px" height="24px" className="rounded-full" />
                <Shimmer width="24px" height="24px" className="rounded-full" />
                <Shimmer width="80px" height="16px" />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <Shimmer width="40px" height="16px" />
                  <Shimmer width="40px" height="12px" />
                </div>
                <div className="flex flex-col items-center">
                  <Shimmer width="40px" height="16px" />
                  <Shimmer width="40px" height="12px" />
                </div>
                <Shimmer width="24px" height="24px" className="rounded-full" />
              </div>
            </div>
          ) : (
            userPositions?.map((position, index) => (
              <PositionRow
                position={position}
                key={`${position.token0.address}-${position.token1.address}-${index}`}
                onClick={async () => {
                  setSelectedPosition(position);

                  const response = await getResponseForInput({
                    chatId,
                    message: `pool=${position.token0.symbol}/${position.token1.symbol}, nftId=${position.nftId}, chainId=${chainId}, provider=${position.provider}`,
                    chainId: chainId!,
                  });
                  addMessage(response);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const PositionDetailsRow = ({
  position,
}: {
  position: UserPositionDetails;
}) => {
  return (
    <div className="w-full text-white">
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            {[position.token0, position.token1].map((token, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full bg-zinc-800 p-0.5 ${
                  index > 0 ? "-ml-2" : ""
                }`}
              >
                <img
                  src={token.logo}
                  alt={`${token.symbol} icon`}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
            ))}
          </div>
          <span className="text-lg font-medium">{`${position.token0.symbol}/${position.token1.symbol}`}</span>
        </div>

        <div
          className={`px-2 py-0.5 rounded-full text-sm flex items-center gap-1 ${
            position.inRange ? "bg-green-400" : "bg-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              position.inRange ? "text-green-400" : "text-red-400"
            }`}
          />
          {position.inRange ? "In Range" : "Out of Range"}
        </div>
      </div>
      <div className="flex justify-between items-center">
        {" "}
        <div className="mt-3 flex items-center gap-3 text-sm text-zinc-400">
          {[position.token0, position.token1].map((token, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-zinc-800 p-0.5">
                  <img
                    src={token.logo}
                    alt={`${token.symbol} icon`}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                </div>
                <span>{token.symbol}</span>
                {/* <span>{token.amountUsd}%</span> */}
                <span>${Number(token.amountUsd).toFixed(2)}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        {position.provider.toLowerCase() === uniswapDetails.id ? (
          <img
            src={uniswapDetails.logo}
            width={16}
            height={16}
            className="rounded-full"
          />
        ) : (
          <img
            src={aerodromeDetails.logo}
            width={16}
            height={16}
            className="rounded-full"
          />
        )}
      </div>
    </div>
  );
};

export default PositionSelector;

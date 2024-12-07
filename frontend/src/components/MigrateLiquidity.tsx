import { useAppContext } from "@/app/context/AppContext";
import { callApi } from "@/helpers/axios";
import { LiquidityFactory } from "@/LiquidityFactory";
import { aerodromeDetails } from "@/providers/aerodrome/config/details";
import { uniswapDetails } from "@/providers/uniswap/config/details";
import { getResponseForInput } from "@/services/ai/sendMessage";
import { PoolDetails } from "@/types/pools";
import { UserPositionDetails } from "@/types/position";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import AIThinkingState from "./AiThinking";
import { TextMessage } from "./ChatMessages";
import { Button } from "./ui/button";

const PoolSelector = ({
  pools,
  setPools,
  setSelectedPool,
}: {
  pools: PoolDetails[];
  setPools: (pools: PoolDetails[]) => void;
  setSelectedPool: (pool: PoolDetails) => void;
}) => {
  const { chainId } = useAccount();
  useEffect(() => {
    const fetchPools = async () => {
      const factory = new LiquidityFactory();
      const response = await factory.getAllPools(chainId!);
      setPools(response);
    };
    fetchPools();
  }, []);

  if (pools.length === 0) {
    return <div>Loading...</div>;
  }
  return pools.map((pool, index) => (
    <button
      className={`w-full justify-start p-4 h-auto transition-all hover:bg-zinc-900 hover:shadow-lg rounded-lg  border border-zinc-800 bg-gray-20 `}
      key={pool.token0.address + pool.token1.address + index}
      onClick={() => setSelectedPool(pool)}
    >
      <div className="flex items-center justify-between gap-3 h-auto max-h-[300px] rounded-lg">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            {[pool.token0, pool.token1].map((token, index) => (
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

          <span className="text-lg text-white font-medium">{`CL${pool.fee}`}</span>

          <span className="text-lg text-white font-medium">
            {pool.token0.symbol}/{pool.token1.symbol}``
          </span>
        </div>
        <span className="bg-zinc-800 text-white px-2 py-0.5 rounded-full text-sm">
          {`${pool.fee / 1000}%`}
        </span>
      </div>

      <div className="mt-3 flex items-center text-sm text-zinc-400 justify-between">
        <div className="flex gap-3">
          {[pool.token0, pool.token1].map((token, index) => (
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
              </div>
            </React.Fragment>
          ))}
        </div>

        {pool.provider.toLowerCase() === uniswapDetails.id ? (
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
    </button>
  ));
};

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
      className={`w-full justify-start p-4 h-auto transition-all hover:bg-zinc-900 hover:shadow-lg border border-zinc-800 bg-gray-20`}
      onClick={onClick}
    >
      <PositionDetailsRow position={position} />
    </Button>
  );
};

const PositionSelector = ({
  setSelectedPosition,
}: {
  selectedPosition: UserPositionDetails | null;
  setSelectedPosition: (position: UserPositionDetails) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const [userPositions, setUserPositions] = useState<UserPositionDetails[]>([]);

  const { address, chainId } = useAccount();

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

  return (
    <div className="w-1/2">
      <h3 className="text-lg font-medium text-white mb-4">
        Select Your Position to Migrate
      </h3>
      <div className="h-auto max-h-[300px] rounded-lg border border-zinc-800 bg-gray-40 p-4 overflow-y-scroll">
        <div className="space-y-3">
          {userPositions.map((position, index) => (
            <PositionRow
              position={position}
              key={`${position.token0.address}-${position.token1.address}-${index}`}
              onClick={async () => {
                setSelectedPosition(position);
              }}
            />
          ))}
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

const Migrate = () => {
  const [selectedPool, setSelectedPool] = useState<PoolDetails | null>(null);
  const [selectedPosition, setSelectedPosition] =
    useState<UserPositionDetails | null>(null);

  const { chainId } = useAccount();

  const { addMessage } = useAppContext();
  const [pools, setPools] = useState<PoolDetails[]>([]);

  const submit = async () => {
    if (!selectedPool || !selectedPosition) {
      return;
    }
    const position = selectedPosition;
    const pool = selectedPool;

    const response = await getResponseForInput({
      chatId: chainId?.toString() ?? "",
      chainId: chainId!,
      message: `srcPoolAddress=${position.poolAddress} destPoolAddress=${pool.poolAddress} srcProvider=${position.provider} destProvider=${pool.provider} chainId=${chainId} nftId=${position.nftId}`,
    });
    addMessage(response);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-lg font-medium text-white text-left bg-gray-40 px-4 py-2 rounded-lg border-thin border-gray-20 mb-4">
        Choose the pools to migrate your liquidity.
      </h2>
      <div className="bg-zinc-900 border-zinc-800 rounded-xl w-full ">
        <div className="flex gap-4 p-4">
          <PositionSelector
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
          />
          <div className="w-1/2">
            <h3 className="text-lg font-medium text-white mb-4">
              Select Your New Pool to Migrate
            </h3>
            <div className="flex flex-col gap-4 h-auto max-h-[300px] rounded-lg border border-zinc-800 bg-gray-40 p-4 overflow-y-scroll">
              <PoolSelector
                pools={pools}
                setPools={setPools}
                setSelectedPool={setSelectedPool}
              />
            </div>
          </div>
        </div>
        {(selectedPosition || selectedPool) && (
          <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800 mt-2 shadow-lg">
            <div className="text-white flex gap-4 items-center w-full">
              {selectedPosition ? (
                <div className="w-1/2 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-2">
                    Selected Position
                  </h4>
                  <PositionDetailsRow position={selectedPosition} />
                </div>
              ) : (
                <div className="w-1/2 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-center">
                  <p>Select a Position</p>
                </div>
              )}
              {selectedPool ? (
                <div className="w-1/2 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-2">
                    Selected Pool
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                          {[selectedPool.token0, selectedPool.token1].map(
                            (token, index) => (
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
                            )
                          )}
                        </div>
                        <span className="text-lg font-medium">{`${selectedPool.token0.symbol}/${selectedPool.token1.symbol}`}</span>
                      </div>
                      <span className="bg-zinc-800 text-white px-2 py-0.5 rounded-full text-sm">
                        {`${selectedPool.fee / 1000}%`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                      <div className="flex gap-3">
                        {[selectedPool.token0, selectedPool.token1].map(
                          (token, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5"
                            >
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
                            </div>
                          )
                        )}
                      </div>
                      {selectedPool.provider.toLowerCase() ===
                      uniswapDetails.id ? (
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
                </div>
              ) : (
                <div className="w-1/2 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-center">
                  <p>Select a Pool</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center px-4 py-2 justify-center">
          <Button
            className="w-3/4 py-3 px-4 range-button-active disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            onClick={submit}
            disabled={!selectedPool || !selectedPosition}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Migrate;

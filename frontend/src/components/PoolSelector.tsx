import React, { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { LiquidityFactory } from "@/LiquidityFactory";
import { aerodromeDetails } from "@/providers/aerodrome/config/details";
import { uniswapDetails } from "@/providers/uniswap/config/details";
import { getResponseForInput } from "@/services/ai/sendMessage";
import { PoolDetails } from "@/types/pools";
import { useAccount } from "wagmi";

const PoolSelector = () => {
  const [pools, setPools] = useState<PoolDetails[]>([]);
  const [selectedPool, setSelectedPool] = useState<PoolDetails | null>(null);
  const { addMessage, chatId } = useAppContext();

  const { chainId } = useAccount();

  useEffect(() => {
    const fetchPools = async () => {
      const factory = new LiquidityFactory();
      const response = await factory.getAllPools(chainId!);
      setPools(response);
    };
    fetchPools();
  }, []);

  const onPoolSelect = async (pool: PoolDetails) => {
    setSelectedPool(pool);
    const response = await getResponseForInput({
      message: `I want to select pool ${pool.token0.symbol}/${pool.token1.symbol} and provider is ${pool.provider}`,
      chatId,
      chainId: chainId!,
    });
    addMessage(response);
  };

  const PoolButton = ({ pool }: { pool: PoolDetails }) => (
    <button
      className={`w-full justify-start p-4 h-auto transition-all bg-gray-20 ${
        selectedPool?.token0.symbol === pool.token0.symbol &&
        selectedPool?.token1.symbol === pool.token1.symbol
          ? "bg-zinc-900 border-zinc-700 cursor-not-allowed"
          : "hover:bg-zinc-900 hover:shadow-lg border-zinc-800 cursor-pointer"
      } rounded-lg`}
      onClick={() => {
        if (
          !selectedPool ||
          selectedPool.token0.symbol !== pool.token0.symbol ||
          selectedPool.token1.symbol !== pool.token1.symbol
        )
          onPoolSelect(pool);
      }}
      disabled={
        selectedPool?.token0.symbol === pool.token0.symbol &&
        selectedPool?.token1.symbol === pool.token1.symbol
      }
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
            {pool.token0.symbol}/{pool.token1.symbol}
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
  );

  return (
    <div className="flex flex-col gap-3">
      {!selectedPool && (
        <>
          <h2 className="text-lg font-medium text-white mb-4 text-left bg-gray-40 px-4 py-2 rounded-lg border-thin border-gray-20">
            Select the Pool you want to add liquidity to
          </h2>
          <div className="flex flex-col gap-4 bg-gray-40 p-4 rounded-xl h-auto max-h-[400px] overflow-y-scroll">
            {pools.map((pool, index) => (
              <PoolButton key={index} pool={pool} />
            ))}
          </div>
        </>
      )}
      {selectedPool && (
        <div className="flex flex-col gap-3 bg-gray-40 p-4 rounded-xl h-auto">
          <h2 className="text-lg font-medium text-white mb-4 text-left bg-gray-40 px-4 py-2 rounded-lg border-thin border-gray-20">
            Selected Pool
          </h2>
          <PoolButton pool={selectedPool} />
        </div>
      )}
    </div>
  );
};

export default PoolSelector;

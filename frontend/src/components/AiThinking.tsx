"use client";

import React, { useEffect, useState } from "react";

const thinkingMessages = [
  "Analyzing liquidity pools...",
  "Calculating optimal routes...",
  "Checking Uniswap V3 positions...",
  "Simulating transaction outcome...",
  "Estimating gas fees...",
  "Verifying smart contracts...",
  "Optimizing slippage parameters...",
  "Preparing transaction details...",
];

const AIThinkingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % thinkingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-6 backdrop-blur-sm animate-fade-in">
          <div className="space-y-4">
            <p className="text-gray-200 text-sm animate-fade-in">
              {thinkingMessages[messageIndex]}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full animate-progress-bar" />
              </div>
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThinkingState;

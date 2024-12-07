import { getWagmiChainById } from "@/app/wagmi";
import { chainsData } from "@/config/chain";
import { txnStatus } from "@/constants/transaction";
import { HexString } from "@/types/string";
import { TxnStatus } from "@/types/txn";
import { getPublicClient } from "@/utils/publicClient";
import { useState } from "react";
import { erc20Abi, erc721Abi, maxUint256, zeroAddress } from "viem";
import { useAccount, useConfig } from "wagmi";
import { getWalletClient } from "wagmi/actions";

export const useApprove = () => {
  const [txnStatusState, setTxnStatusState] = useState<null | TxnStatus>(null);

  const { address, chainId } = useAccount();

  const publicClient = getPublicClient(chainId!);

  const wagmiConfig = useConfig();

  const getAllowance = async (tokenAddress: HexString) => {
    try {
      const zapContractAddress = chainsData[chainId!].zap;

      if (tokenAddress === zeroAddress) {
        return maxUint256;
      } else {
        const allowance = await publicClient.readContract({
          abi: erc20Abi,
          address: tokenAddress,
          functionName: "allowance",
          args: [address as HexString, zapContractAddress],
        });
        return allowance;
      }
    } catch (error) {
      console.error("Error in getAllowance", error);
      return BigInt(0);
    }
  };

  const isNFTApproved = async ({
    nftId,
    nftManager,
  }: {
    nftManager: HexString;
    nftId: bigint;
  }): Promise<boolean> => {
    try {
      const zapContractAddress = chainsData[chainId!].zap;
      const allowance = await publicClient.readContract({
        abi: erc721Abi,
        address: nftManager,
        functionName: "getApproved",
        args: [nftId],
      });
      return allowance === zapContractAddress;
    } catch (error) {
      console.error("Error in getNftAllowance", error);
      return false;
    }
  };

  const approve = async ({
    token,
  }: {
    token: {
      address: HexString;
      amount: bigint;
    };
  }) => {
    setTxnStatusState(txnStatus.mining);
    const allowance = await getAllowance(token.address);

    if (allowance < token.amount) {
      const isApproved = await approveToken({
        amountInWei: token.amount,
        tokenAddress: token.address,
      });
      if (!isApproved) {
        setTxnStatusState(txnStatus.failed);
        return false;
      }
    }
    setTxnStatusState(txnStatus.success);
    return true;
  };

  const approveNft = async ({
    nftId,
    nftManager,
  }: {
    nftManager: HexString;
    nftId: bigint;
  }) => {
    try {
      const walletClient = await getWalletClient(wagmiConfig);
      const zapContractAddress = chainsData[chainId!].zap;
      const txnHash = await walletClient.writeContract({
        abi: erc721Abi,
        account: address,
        address: nftManager,
        args: [zapContractAddress, nftId],
        functionName: "approve",
        chain: getWagmiChainById(chainId!),
      });

      const txnReceipt = await publicClient.waitForTransactionReceipt({
        hash: txnHash,
      });
      if (txnReceipt.status === "reverted") {
        setTxnStatusState(txnStatus.failed);
      }
      return true;
    } catch (e: unknown) {
      console.error("Error in approveNft", e);
      return false;
    }
  };

  const approveToken = async ({
    tokenAddress,
    amountInWei,
  }: {
    tokenAddress: HexString;
    amountInWei: bigint;
  }) => {
    try {
      const walletClient = await getWalletClient(wagmiConfig);
      const zapContractAddress = chainsData[chainId!].zap;
      const txnHash = await walletClient.writeContract({
        abi: erc20Abi,
        account: address,
        address: tokenAddress,
        args: [zapContractAddress, amountInWei],
        functionName: "approve",
        chain: getWagmiChainById(chainId!),
      });

      const txnReceipt = await publicClient.waitForTransactionReceipt({
        hash: txnHash,
      });
      if (txnReceipt.status === "reverted") {
        setTxnStatusState(txnStatus.failed);
      }
      return true;
    } catch (e: unknown) {
      console.error("Error in approveToken", e);
      return false;
    }
  };

  return {
    approve,
    approveNft,
    isNFTApproved,
    txnStatus: txnStatusState,
    getAllowance,
  };
};

import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getContract } from "viem";
import { uniswapNFTManagerAbi } from "../abi/nftManager";
import { uniswapContracts } from "../config/contracts";

export class UniswapNFTManager {
  private abi = uniswapNFTManagerAbi;
  private chainId: number;
  private address: HexString;

  constructor({ chainId }: { chainId: number }) {
    this.address = uniswapContracts[chainId].nftManager;
    this.chainId = chainId;
  }
  public getUserTotalNfts = async (address: HexString) => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const [balance] = await Promise.all([contract.read.balanceOf([address])]);

    return balance;
  };

  public getLastNftId = async () => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const totalNfts = await this.getTotalSuppliedNFTs();

    const lastNftId = await contract.read.tokenByIndex([totalNfts - BigInt(1)]);

    return lastNftId;
  };

  public getUserNftIds = async ({ account }: { account: HexString }) => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const totalNfts = await this.getUserTotalNfts(account);

    const nftIds = await Promise.all(
      Array.from({ length: Number(totalNfts) }).map(async (_, index) => {
        const nftId = await contract.read.tokenOfOwnerByIndex([
          account,
          BigInt(index),
        ]);

        return nftId;
      })
    );

    return nftIds;
  };

  public getUserNfts = async ({ account }: { account: HexString }) => {
    const nftIds = await this.getUserNftIds({ account });

    const nftDetails = await Promise.all(
      nftIds.map(async (nftId) => {
        const details = await this.getNftDetails({ nftId });
        return {
          nftId,
          ...details,
        };
      })
    );

    return nftDetails;
  };

  public getNftDetails = async ({ nftId }: { nftId: bigint }) => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const [details] = await Promise.all([contract.read.positions([nftId])]);

    return {
      tickLower: details[5],
      tickUpper: details[6],
      liquidity: details[7],
      token0Fee: details[10],
      token1Fee: details[11],
      token0: details[2],
      token1: details[3],
      feeGrowthInside0LastX128: details[8],
      feeGrowthInside1LastX128: details[9],
    };
  };

  public getTotalSuppliedNFTs = async () => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const totalNfts = await contract.read.totalSupply();

    return totalNfts;
  };
}

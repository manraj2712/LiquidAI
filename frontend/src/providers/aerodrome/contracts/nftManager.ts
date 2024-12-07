import { HexString } from "@/types/string";
import { getPublicClient } from "@/utils/publicClient";
import { getContract, PublicClient } from "viem";
import { aerodromeNFTManagerAbi } from "../abi/nftManager";
import { aerodromeAddresses } from "../config/contracts";

type NftDetails = {
  nftId: bigint;
  nonce: bigint;
  operator: HexString;
  token0: HexString;
  token1: HexString;
  tickSpacing: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
};

export class AerodromeNftManager {
  private chainId: number;
  private publicClient: PublicClient;
  private address: HexString;
  private abi = aerodromeNFTManagerAbi;

  constructor({ chainId }: { chainId: number }) {
    this.chainId = chainId;
    this.address = aerodromeAddresses[chainId].nftManager;
    this.publicClient = getPublicClient(this.chainId);
  }

  public getUserTotalNfts = async ({
    account,
  }: {
    account: HexString;
  }): Promise<bigint> => {
    const contract = getContract({
      abi: this.abi,
      address: this.address,
      client: this.publicClient,
    });
    try {
      const balance = await contract.read.balanceOf([account]);
      return balance as bigint;
    } catch (error) {
      console.log(error);
      return BigInt(0);
    }
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

  public getNftDetails = async ({ nftId }: { nftId: bigint }) => {
    try {
      const contract = getContract({
        abi: aerodromeNFTManagerAbi,
        address: this.address,
        client: this.publicClient,
      });

      const response = await contract.read.positions([nftId]);

      return {
        nonce: response[0],
        operator: response[1],
        token0: response[2],
        token1: response[3],
        tickSpacing: response[4],
        tickLower: response[5],
        tickUpper: response[6],
        liquidity: response[7],
        feeGrowthInside0LastX128: response[8],
        feeGrowthInside1LastX128: response[9],
        tokensOwed0: response[10],
        tokensOwed1: response[11],
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  public getUserNftIds = async ({ account }: { account: HexString }) => {
    const publicClient = getPublicClient(this.chainId);

    const contract = getContract({
      address: this.address,
      abi: this.abi,
      client: publicClient,
    });

    const totalNfts = await this.getUserTotalNfts({ account });

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

    const nftDetails: NftDetails[] = [];

    await Promise.allSettled(
      nftIds.map(async (nftId) => {
        const details = await this.getNftDetails({ nftId });

        if (!details) {
          return;
        }

        nftDetails.push({
          nftId,
          ...details,
        });
      })
    );

    return nftDetails;
  };
  public getTotalSuppliedNFTs = async () => {
    const contract = getContract({
      abi: this.abi,
      address: this.address,
      client: this.publicClient,
    });
    try {
      const balance = await contract.read.totalSupply();
      return balance as bigint;
    } catch (error) {
      console.log(error);
      return BigInt(0);
    }
  };
}

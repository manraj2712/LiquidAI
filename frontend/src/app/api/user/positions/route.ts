import { supportedChainIds } from "@/config/chain";
import { callApi } from "@/helpers/axios";
import { LiquidityFactory } from "@/LiquidityFactory";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const factory = new LiquidityFactory();
    const response = await factory.getUserPositions(body);
    await getPositionsFromGraph(body.userAddress, body.chainId);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        error,
      },
      { status: 500 }
    );
  }
}

export const getPositionsFromGraph = async (
  userAddress: string,
  chainId: number
) => {
  const query = `
  {
    positions(where: {owner: "${userAddress}"}) {
      id
      owner
      token0 {
        id
        decimals
        symbol
      }
      token1 {
        id
        symbol
        decimals
      }
      liquidity
    }
  }`;

  const response = await callApi({
    url:
      chainId === supportedChainIds.base
        ? "https://gateway.thegraph.com/api/f65b5c4de85b3e9f345b34cb7e896214/subgraphs/id/GqzP4Xaehti8KSfQmv3ZctFSjnSUYZ4En5NRsiTbvZpz"
        : "https://gateway.thegraph.com/api/f65b5c4de85b3e9f345b34cb7e896214/subgraphs/id/43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        query: query,
      },
    },
  });

  console.log("response", response);
};

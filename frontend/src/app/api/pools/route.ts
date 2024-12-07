import { LiquidityFactory } from "@/LiquidityFactory";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const chainId = request.nextUrl.searchParams.get("chainId");
    const factory = new LiquidityFactory();
    const response = await factory.getAllPools(Number(chainId));
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

import { LiquidityFactory } from "@/LiquidityFactory";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const factory = new LiquidityFactory();
    const response = await factory.removeLiquidity(body);
    return NextResponse.json(
      {
        callData: response.callData,
        to: response.to,
        value: response.value,
        details: response.details,
      },
      { status: 200 }
    );
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

import { LiquidityFactory } from "@/LiquidityFactory";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const factory = new LiquidityFactory();
    const response = await factory.getAllPools();
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

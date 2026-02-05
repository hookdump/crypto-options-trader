import { NextResponse } from "next/server";
import { getPositions } from "@/lib/binance-api";

export async function GET() {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "API credentials not configured" },
      { status: 401 }
    );
  }

  try {
    const positions = await getPositions(apiKey, apiSecret);
    return NextResponse.json(positions);
  } catch (error) {
    console.error("Positions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

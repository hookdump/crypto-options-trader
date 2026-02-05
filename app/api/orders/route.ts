import { NextResponse } from "next/server";
import { getOpenOrders } from "@/lib/binance-api";

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
    const orders = await getOpenOrders(apiKey, apiSecret);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

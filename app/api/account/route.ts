import { NextResponse } from "next/server";
import { getAccountInfo } from "@/lib/binance-api";

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
    const accountInfo = await getAccountInfo(apiKey, apiSecret);
    return NextResponse.json(accountInfo);
  } catch (error) {
    console.error("Account info error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch account" },
      { status: 500 }
    );
  }
}

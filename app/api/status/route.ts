import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  return NextResponse.json({
    apiConfigured: !!(apiKey && apiSecret),
    timestamp: Date.now(),
  });
}

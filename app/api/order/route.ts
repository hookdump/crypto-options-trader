import { NextResponse } from "next/server";
import { placeOrder, cancelOrder } from "@/lib/binance-api";

export async function POST(request: Request) {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "API credentials not configured" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { symbol, side, type, quantity, price, timeInForce, reduceOnly, postOnly } = body;

    if (!symbol || !side || !type || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await placeOrder(apiKey, apiSecret, {
      symbol,
      side,
      type,
      quantity,
      price,
      timeInForce,
      reduceOnly,
      postOnly,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Place order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "API credentials not configured" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { symbol, orderId, clientOrderId } = body;

    if (!symbol || (!orderId && !clientOrderId)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await cancelOrder(apiKey, apiSecret, symbol, orderId, clientOrderId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel order" },
      { status: 500 }
    );
  }
}

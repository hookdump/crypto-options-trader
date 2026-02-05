"use client";

import { useEffect, useCallback } from "react";
import { useOptionsStore, usePreferencesStore } from "@/lib/store";

export function useUserData() {
  const { setPositions, setOpenOrders, setAccountInfo } = useOptionsStore();
  const { apiConfigured } = usePreferencesStore();

  // Fetch account info
  const fetchAccountInfo = useCallback(async () => {
    if (!apiConfigured) return;

    try {
      const response = await fetch("/api/account");
      if (response.ok) {
        const data = await response.json();
        setAccountInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch account info:", error);
    }
  }, [apiConfigured, setAccountInfo]);

  // Fetch positions
  const fetchPositions = useCallback(async () => {
    if (!apiConfigured) return;

    try {
      const response = await fetch("/api/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    }
  }, [apiConfigured, setPositions]);

  // Fetch open orders
  const fetchOpenOrders = useCallback(async () => {
    if (!apiConfigured) return;

    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOpenOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch open orders:", error);
    }
  }, [apiConfigured, setOpenOrders]);

  // Refresh all user data
  const refreshUserData = useCallback(async () => {
    await Promise.all([
      fetchAccountInfo(),
      fetchPositions(),
      fetchOpenOrders(),
    ]);
  }, [fetchAccountInfo, fetchPositions, fetchOpenOrders]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!apiConfigured) return;

    refreshUserData();

    // Refresh every 10 seconds
    const interval = setInterval(refreshUserData, 10000);

    return () => clearInterval(interval);
  }, [apiConfigured, refreshUserData]);

  return {
    fetchAccountInfo,
    fetchPositions,
    fetchOpenOrders,
    refreshUserData,
  };
}

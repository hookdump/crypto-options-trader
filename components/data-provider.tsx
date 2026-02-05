"use client";

import { useEffect } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useUserData } from "@/hooks/use-user-data";
import { usePreferencesStore } from "@/lib/store";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { setApiConfigured } = usePreferencesStore();

  // Initialize market data hooks
  useMarketData();
  useUserData();

  // Check API status on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/status");
        if (response.ok) {
          const { apiConfigured } = await response.json();
          setApiConfigured(apiConfigured);
        }
      } catch (error) {
        console.error("Failed to check API status:", error);
      }
    };

    checkApiStatus();
  }, [setApiConfigured]);

  return <>{children}</>;
}

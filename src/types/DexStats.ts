export interface ChainDexActivity {
  approx_median_usd_volume: number;
  avg_txn_fees: number;
  avg_txn_fees_usd: number;
  avg_usd_volume: number;
  days_active: number;
  first_timestamp: string;
  last_timestamp: string;
  project_count: number;
  project_used: string[];
  total_txn_fees: number;
  total_txn_fees_usd: number;
  total_usd_volume: number;
  txn_count: number;
}

export interface ProcessedDexStats {
  totalTrades: number;
  totalVolumeUSD: number;
  firstTrade: string;
  lastTrade: string;
  chainsUsed: number;
  chains: {
    [key: string]: {
      volumeUSD: number;
      trades: number;
      projects: string[];
      daysActive: number;
      avgTradeSize: number;
      totalFees: number;
    }
  };
  mostUsedChain: string;
  mostUsedDex: string;
  topProjects: string[];
} 
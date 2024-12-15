export interface ChainActivity {
  chain: string;
  numberOfTransactions: number;
  contractsUsed: number;
  eoaInteractions: number;
  valueTransferred: number;
  gasUsed: number;
}

export interface DexStats {
  totalVolumeUSD: number;
  topProjects: string[];
  chains: {
    [key: string]: {
      volumeUSD: number;
    };
  };
}

export interface YearInCryptoStats {
  chains: ChainActivity[];
  totalTransactions: number;
  totalContractsUsed: number;
  totalValueTransferred: number;
  mostUsedChain: string;
  dexStats: DexStats;
} 
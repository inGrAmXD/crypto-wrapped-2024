import { ChainDexActivity, ProcessedDexStats } from '../types/DexStats';

export class ExtendedStatsService {
  private apiUrl: string = "https://api.allium.so/api/v1/explorer/queries/aWP33lUAMsaK3xgb81o0/run";
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API_KEY es requerida para inicializar ExtendedStatsService");
    }
    this.apiKey = apiKey;
  }

  public async getExtendedStats(address: string): Promise<ProcessedDexStats> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ wallet_address: address }),
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const data = await response.json();
      return this.processExtendedData(data);
    } catch (error: any) {
      throw new Error(`Error obteniendo stats extendidos: ${error.message}`);
    }
  }

  private processExtendedData(rawData: any): ProcessedDexStats {
    const dexData = rawData.data[0];
    const activityDetails = JSON.parse(dexData.dex_activity_details);

    // Procesar datos por chain
    const chainStats: { [key: string]: any } = {};
    let totalProjects = new Set<string>();
    let maxVolume = 0;
    let mostUsedChain = '';

    Object.entries(activityDetails).forEach(([chain, activity]: [string, any]) => {
      const chainActivity = activity as ChainDexActivity;
      
      chainStats[chain] = {
        volumeUSD: chainActivity.total_usd_volume,
        trades: chainActivity.txn_count,
        projects: chainActivity.project_used,
        daysActive: chainActivity.days_active,
        avgTradeSize: chainActivity.avg_usd_volume,
        totalFees: chainActivity.total_txn_fees_usd
      };

      // Actualizar chain con más volumen
      if (chainActivity.total_usd_volume > maxVolume) {
        maxVolume = chainActivity.total_usd_volume;
        mostUsedChain = chain;
      }

      // Agregar proyectos al set total
      chainActivity.project_used.forEach(project => totalProjects.add(project));
    });

    // Encontrar el DEX más usado
    const projectCounts = new Map<string, number>();
    Object.values(activityDetails).forEach((activity: any) => {
      activity.project_used.forEach((project: string) => {
        projectCounts.set(project, (projectCounts.get(project) || 0) + 1);
      });
    });

    const mostUsedDex = Array.from(projectCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      totalTrades: dexData.dex_trade_count,
      totalVolumeUSD: dexData.dex_volume_usd,
      firstTrade: dexData.dex_first_timestamp,
      lastTrade: dexData.dex_last_timestamp,
      chainsUsed: dexData.dex_chains_count,
      chains: chainStats,
      mostUsedChain,
      mostUsedDex,
      topProjects: Array.from(totalProjects)
    };
  }
} 
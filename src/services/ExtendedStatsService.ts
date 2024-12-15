import { ChainDexActivity, ProcessedDexStats } from '../types/DexStats';

export class ExtendedStatsService {
  private apiUrl: string = "https://api.allium.so/api/v1/explorer/queries/aWP33lUAMsaK3xgb81o0/run";
  private apiKey: string;
  private maxRetries: number = 3;
  private timeout: number = 30000; // 30 segundos

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API_KEY es requerida para inicializar ExtendedStatsService");
    }
    this.apiKey = apiKey;
  }

  public async getExtendedStats(address: string): Promise<ProcessedDexStats> {
    try {
      // Optimizar la consulta DEX
      const optimizedDexQuery = `
        WITH filtered_dex_txs AS (
          SELECT *
          FROM dex.trades
          WHERE from_address = LOWER('${address}')
          AND block_timestamp >= '2024-01-01'
        )
        SELECT
          COUNT(*) as dex_trade_count,
          SUM(amount_usd) as dex_volume_usd,
          MIN(block_timestamp) as dex_first_timestamp,
          MAX(block_timestamp) as dex_last_timestamp,
          COUNT(DISTINCT chain) as dex_chains_count,
          JSON_OBJECT_AGG(
            chain,
            JSON_OBJECT(
              'total_usd_volume', SUM(amount_usd),
              'txn_count', COUNT(*),
              'project_used', ARRAY_AGG(DISTINCT project),
              'days_active', COUNT(DISTINCT DATE(block_timestamp)),
              'avg_usd_volume', AVG(amount_usd),
              'total_txn_fees_usd', SUM(fee_usd)
            )
          ) as dex_activity_details
        FROM filtered_dex_txs
        GROUP BY from_address`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          wallet_address: address,
          query: optimizedDexQuery,
          config: {
            use_cache: true,
            timeout: 15000
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.getDefaultStats();
      }

      const data = await response.json();
      return this.processExtendedData(data);
    } catch (error) {
      console.warn('Error getting DEX stats, returning defaults:', error);
      return this.getDefaultStats();
    }
  }

  private getDefaultStats(): ProcessedDexStats {
    return {
      totalTrades: 0,
      totalVolumeUSD: 0,
      firstTrade: new Date().toISOString(),
      lastTrade: new Date().toISOString(),
      chainsUsed: 0,
      chains: {},
      mostUsedChain: 'none',
      mostUsedDex: 'none',
      topProjects: []
    };
  }

  private processExtendedData(rawData: any): ProcessedDexStats {
    try {
      const dexData = rawData.data[0];
      
      // Si no hay datos de actividad DEX, devolver valores por defecto
      if (!dexData || !dexData.dex_activity_details) {
        return this.getDefaultStats();
      }

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
        totalTrades: dexData.dex_trade_count || 0,
        totalVolumeUSD: dexData.dex_volume_usd || 0,
        firstTrade: dexData.dex_first_timestamp || new Date().toISOString(),
        lastTrade: dexData.dex_last_timestamp || new Date().toISOString(),
        chainsUsed: dexData.dex_chains_count || 0,
        chains: chainStats || {},
        mostUsedChain: mostUsedChain || 'none',
        mostUsedDex: mostUsedDex || 'none',
        topProjects: Array.from(totalProjects || [])
      };
    } catch (error) {
      console.error('Error procesando datos DEX:', error);
      return this.getDefaultStats();
    }
  }
} 
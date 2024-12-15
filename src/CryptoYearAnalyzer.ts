import { ExtendedStatsService } from './services/ExtendedStatsService';
import { 
  YearInCryptoStats, 
  ChainActivity, 
  AlliumQueryRunResponse, 
  AlliumQueryResultResponse 
} from './types/CryptoTypes';

export class CryptoYearAnalyzer {
  private baseUrl: string = "https://api.allium.so/api/v1/explorer";
  private queryId: string = "iqDLnmgMP9uoZ0dS7I5Y";
  private apiKey: string;
  private extendedStatsService: ExtendedStatsService;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API_KEY es requerida para inicializar CryptoYearAnalyzer");
    }
    this.apiKey = apiKey;
    this.extendedStatsService = new ExtendedStatsService(apiKey);
  }

  /**
   * Obtiene y procesa las estadísticas del año en crypto para una dirección específica
   * @param address Dirección de la wallet a analizar
   * @returns Estadísticas procesadas del año en crypto
   */
  public async getYearInCryptoStats(address: string): Promise<YearInCryptoStats> {
    try {
        const rawData = await this.fetchDataFromAllium(address);
        const stats = this.processRawData(rawData);

        try {
            // Intentar obtener datos DEX, pero no bloquear si falla
            const dexStats = await this.extendedStatsService.getExtendedStats(address);
            return {
                ...stats,
                dexStats
            };
        } catch (error) {
            console.warn('Error obteniendo stats DEX, continuando sin ellos:', error);
            return {
                ...stats,
                dexStats: {
                    totalVolumeUSD: 0,
                    topProjects: [],
                    chains: {}
                }
            };
        }
    } catch (error) {
        console.error('Error in getYearInCryptoStats:', error);
        throw error;
    }
  }

  private async fetchDataFromAllium(address: string): Promise<AlliumQueryResponse> {
    // 1. Iniciar la consulta
    const queryRunId = await this.startQueryRun(address);
    
    // 2. Esperar a que la consulta se complete
    await this.waitForQueryCompletion(queryRunId);
    
    // 3. Obtener los resultados
    return await this.fetchQueryResults(queryRunId);
  }

  private async startQueryRun(address: string): Promise<string> {
    try {
        // Optimizar la consulta SQL para reducir el tiempo de ejecución
        const optimizedQuery = `
            WITH filtered_txs AS (
                SELECT DISTINCT t.hash, t.to_address, t.value, t.gas
                FROM ethereum.raw.transactions t
                WHERE t.from_address = LOWER('{{param585}}')
                AND t._created_at >= '2024-01-01'
            )
            SELECT
                ens.name AS ens_name,
                COUNT(DISTINCT t.hash) AS number_of_transactions,
                COUNT(DISTINCT c.address) AS contracts_used,
                COUNT(DISTINCT t.to_address) - COUNT(DISTINCT c.address) AS eoa_interactions,
                SUM(t.value / POW(10, 18)) AS value_transferred,
                SUM(t.gas) AS gas_used
            FROM filtered_txs t
            LEFT JOIN ethereum.ens.primary_records_latest ens
                ON LOWER('{{param585}}') = ens.address
            LEFT JOIN ethereum.raw.contracts c
                ON t.to_address = c.address
            GROUP BY ens.name`;

        const response = await fetch(`${this.baseUrl}/queries/${this.queryId}/run-async`, {
            method: 'POST',
            body: JSON.stringify({
                parameters: { param585: address },
                run_config: { 
                    limit: 25000,
                    query: optimizedQuery
                }
            }),
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error iniciando la consulta: ${response.status}`);
        }

        const data = await response.json();
        return data.run_id;
    } catch (error) {
        console.error('Error in startQueryRun:', error);
        throw error;
    }
  }

  private async waitForQueryCompletion(queryRunId: string, maxAttempts = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            console.log(`Checking query status (attempt ${attempt + 1}/${maxAttempts}) for runId: ${queryRunId}`);
            const response = await fetch(`${this.baseUrl}/query-runs/${queryRunId}`, {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.apiKey,
                },
            });

            if (!response.ok) {
                console.error('Status check failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    queryRunId
                });
                throw new Error(`Error verificando estado de la consulta: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Query status response:', data);
            
            // Verificar si la consulta está completada o tuvo éxito
            if (data.status === 'completed' || data.status === 'success') {
                console.log('Query completed successfully');
                return;
            }
            if (data.status === 'failed') {
                throw new Error(`La consulta falló: ${data.error}`);
            }

            // Reducir el tiempo de espera entre intentos
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error checking query status:', error);
            throw error;
        }
    }

    throw new Error('Tiempo de espera agotado para la consulta');
  }

  private async fetchQueryResults(queryRunId: string): Promise<AlliumQueryResponse> {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${this.baseUrl}/query-runs/${queryRunId}/results`, {
            method: 'POST',
            headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                config: {
                    limit: 100,
                    offset: 0
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching results:', {
                status: response.status,
                statusText: response.statusText,
                queryRunId,
                errorText
            });
            throw new Error(`Error obteniendo resultados: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as AlliumQueryResultResponse;
        console.log('Results received:', data);

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Resultados incompletos o inválidos');
        }

        // Convertir la respuesta al formato esperado con las 4 cadenas principales
        return {
            data: [{
                year_in_crypto: JSON.stringify([
                    {
                        chain: 'ethereum',
                        number_of_transactions: data.data[0]?.number_of_transactions || 0,
                        contracts_used: data.data[0]?.contracts_used || 0,
                        eoa_interactions: data.data[0]?.eoa_interactions || 0,
                        value_transferred: data.data[0]?.value_transferred || 0,
                        gas_used: data.data[0]?.gas_used || 0
                    },
                    {
                        chain: 'optimism',
                        number_of_transactions: 0,
                        contracts_used: 0,
                        eoa_interactions: 0,
                        value_transferred: 0,
                        gas_used: 0
                    },
                    {
                        chain: 'zksync',
                        number_of_transactions: 0,
                        contracts_used: 0,
                        eoa_interactions: 0,
                        value_transferred: 0,
                        gas_used: 0
                    },
                    {
                        chain: 'arbitrum',
                        number_of_transactions: 0,
                        contracts_used: 0,
                        eoa_interactions: 0,
                        value_transferred: 0,
                        gas_used: 0
                    }
                ])
            }]
        };
    } catch (error) {
        console.error('Error in fetchQueryResults:', error);
        throw error;
    }
  }

  private processRawData(rawData: AlliumQueryResponse): YearInCryptoStats {
    try {
        // Extraer el array de actividades por cadena
        const yearInCryptoData = JSON.parse(rawData.data[0].year_in_crypto);
        console.log('Processed data:', yearInCryptoData);

        // Procesar los datos de cada cadena
        const chains: ChainActivity[] = yearInCryptoData.map((chain: any) => ({
            chain: chain.chain,
            numberOfTransactions: Number(chain.number_of_transactions) || 0,
            contractsUsed: Number(chain.contracts_used) || 0,
            eoaInteractions: Number(chain.eoa_interactions) || 0,
            valueTransferred: Number(chain.value_transferred) || 0,
            gasUsed: Number(chain.gas_used) || 0
        }));

        // Calcular estadísticas totales
        const totalTransactions = chains.reduce((sum, chain) => sum + chain.numberOfTransactions, 0);
        const totalContractsUsed = chains.reduce((sum, chain) => sum + chain.contractsUsed, 0);
        const totalValueTransferred = chains.reduce((sum, chain) => sum + chain.valueTransferred, 0);

        // Encontrar la cadena más usada
        const mostUsedChain = chains.reduce((prev, current) => 
            (current.numberOfTransactions > prev.numberOfTransactions) ? current : prev
        ).chain;

        // Asegurarnos de que los valores numéricos sean números y no strings
        const result = {
            chains,
            totalTransactions: Number(totalTransactions),
            totalContractsUsed: Number(totalContractsUsed),
            totalValueTransferred: Number(totalValueTransferred),
            mostUsedChain,
            dexStats: {
                totalVolumeUSD: 0, // Valor por defecto
                topProjects: [], // Array vacío por defecto
                chains: {} // Objeto vacío por defecto
            }
        };

        console.log('Final processed result:', result);
        return result;
    } catch (error) {
        console.error('Error in processRawData:', error);
        if (error instanceof Error) {
            throw new Error(`Error procesando los datos: ${error.message}`);
        }
        throw new Error('Error desconocido procesando los datos');
    }
  }
} 
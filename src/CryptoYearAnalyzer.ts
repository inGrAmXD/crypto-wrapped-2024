export class CryptoYearAnalyzer {
  private apiUrl: string = "https://api.allium.so/api/v1/explorer/queries/DiXRTAyw6iyH4QW7jgdM/run";
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API_KEY es requerida para inicializar CryptoYearAnalyzer");
    }
    this.apiKey = apiKey;
  }

  /**
   * Obtiene y procesa las estadísticas del año en crypto para una dirección específica
   * @param address Dirección de la wallet a analizar
   * @returns Estadísticas procesadas del año en crypto
   */
  public async getYearInCryptoStats(address: string): Promise<YearInCryptoStats> {
    const rawData = await this.fetchDataFromAllium(address);
    return this.processRawData(rawData);
  }

  private async fetchDataFromAllium(address: string): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ param585: address }),
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la solicitud (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  private processRawData(rawData: any): YearInCryptoStats {
    try {
      // Extraer el array de actividades por cadena
      const yearInCryptoData = JSON.parse(rawData.data[0].year_in_crypto);

      // Procesar los datos de cada cadena
      const chains: ChainActivity[] = yearInCryptoData.map((chain: any) => ({
        chain: chain.chain,
        numberOfTransactions: chain.number_of_transactions || 0,
        contractsUsed: chain.contracts_used || 0,
        eoaInteractions: chain.eoa_interactions || 0,
        valueTransferred: chain.value_transferred || 0,
        gasUsed: chain.gas_used || 0
      }));

      // Calcular estadísticas totales
      const totalTransactions = chains.reduce((sum, chain) => sum + chain.numberOfTransactions, 0);
      const totalContractsUsed = chains.reduce((sum, chain) => sum + chain.contractsUsed, 0);
      const totalValueTransferred = chains.reduce((sum, chain) => sum + chain.valueTransferred, 0);

      // Encontrar la cadena más usada
      const mostUsedChain = chains.reduce((prev, current) => 
        (current.numberOfTransactions > prev.numberOfTransactions) ? current : prev
      ).chain;

      return {
        chains,
        totalTransactions,
        totalContractsUsed,
        totalValueTransferred,
        mostUsedChain
      };
    } catch (error) {
      throw new Error(`Error procesando los datos: ${error.message}`);
    }
  }
} 
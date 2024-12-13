export class AlliumService {
  private apiUrl: string = "https://api.allium.so/api/v1/explorer/queries/DiXRTAyw6iyH4QW7jgdM/run";
  private apiKey: string = process.env.API_KEY || "";

  constructor() {
    if (!this.apiKey) {
      throw new Error("API_KEY no está definida en las variables de ambiente");
    }
  }

  public async runQuery(param585: string): Promise<any> {
    const requestBody = {
      param585: param585
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody),
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

  public async runQueries(param201List: string[]): Promise<any[]> {
    if (!Array.isArray(param201List) || param201List.length === 0) {
      throw new Error("Debe proporcionar un array de direcciones válido");
    }
    
    const promises = param201List.map(param201 => this.runQuery(param201));
    
    try {
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      throw error;
    }
  }
} 
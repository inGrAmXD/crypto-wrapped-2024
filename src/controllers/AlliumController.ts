import { AlliumService } from "../services/AlliumService";

export class AlliumController {
  private service: AlliumService;

  constructor() {
    this.service = new AlliumService();
  }

  public async handleQuery(address: string): Promise<Response> {
    try {
      const param201 = address;

      if (!param201) {
        return new Response(JSON.stringify({ error: "param201 es requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await this.service.runQuery(param201);

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  public async handleMultipleQueries(addresses: string[]): Promise<Response> {
    try {
      if (!addresses || addresses.length === 0) {
        return new Response(JSON.stringify({ error: "Debe proporcionar al menos una dirección" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const results = await this.service.runQueries(addresses);

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
} 
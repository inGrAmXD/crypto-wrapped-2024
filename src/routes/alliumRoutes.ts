import { AlliumController } from "../controllers/AlliumController";

const controller = new AlliumController();

export default async function alliumRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  const singleAddressMatch = url.pathname.match(/^\/address\/(.+)$/);
  if (singleAddressMatch && req.method === "GET") {
    const address = decodeURIComponent(singleAddressMatch[1]);
    return controller.handleQuery(address);
  }

  if (url.pathname === "/addresses" && req.method === "GET") {
    const addressesParam = url.searchParams.get("addresses");
    
    if (!addressesParam) {
      return new Response(JSON.stringify({ error: "El parámetro 'addresses' es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const addresses = addressesParam.split(",").map(addr => addr.trim()).filter(addr => addr !== "");
    
    if (addresses.length === 0) {
      return new Response(JSON.stringify({ error: "Debe proporcionar al menos una dirección válida" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return controller.handleMultipleQueries(addresses);
  }

  return new Response("Not Found", { status: 404 });
} 
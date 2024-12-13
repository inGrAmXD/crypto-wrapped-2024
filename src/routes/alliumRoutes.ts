import { AlliumController } from "../controllers/AlliumController";
import { CryptoYearAnalyzer } from "../CryptoYearAnalyzer";
import { file } from "bun";
import { join } from "path";

const controller = new AlliumController();
const analyzer = new CryptoYearAnalyzer(process.env.API_KEY || "");

export default async function alliumRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Servir archivos estáticos
  if (req.method === "GET") {
    let path = url.pathname;
    
    // Si es la ruta raíz, servir index.html
    if (path === "/") {
      path = "/index.html";
    }

    // Intentar servir archivo estático
    try {
      const publicPath = join(import.meta.dir, "../public", path);
      const staticFile = await file(publicPath).text();
      const contentType = getContentType(path);
      
      return new Response(staticFile, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      // Si no es un archivo estático, continuar con las rutas de la API
    }
  }

  // Rutas existentes de la API...
  const singleAddressMatch = url.pathname.match(/^\/api\/address\/(.+)$/);
  if (singleAddressMatch && req.method === "GET") {
    const address = decodeURIComponent(singleAddressMatch[1]);
    return controller.handleQuery(address);
  }

  const statsAddressMatch = url.pathname.match(/^\/stats\/(.+)$/);
  if (statsAddressMatch && req.method === "GET") {
    const address = decodeURIComponent(statsAddressMatch[1]);
    try {
      const stats = await analyzer.getYearInCryptoStats(address);
      return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
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

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const contentTypes: { [key: string]: string } = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
  };
  return contentTypes[ext || ''] || 'text/plain';
} 
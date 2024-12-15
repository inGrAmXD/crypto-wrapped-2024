import { CryptoYearAnalyzer } from "../CryptoYearAnalyzer";
import { file } from "bun";
import { join } from "path";

const analyzer = new CryptoYearAnalyzer(process.env.API_KEY || "");

export default async function alliumRoutes(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // API endpoint
    if (path === '/api/stats' && req.method === 'POST') {
        try {
            const body = await req.json();
            const { address } = body;

            if (!address) {
                return new Response(JSON.stringify({ error: "Dirección requerida" }), {
                    status: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }

            const stats = await analyzer.getYearInCryptoStats(address);
            return new Response(JSON.stringify(stats), {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=300",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({ 
                error: error instanceof Error ? error.message : "Error desconocido" 
            }), {
                status: 500,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
    }

    // Servir archivos estáticos
    try {
        // Si es la ruta raíz, servir index.html
        const filePath = path === '/' ? '/index.html' : path;
        const publicPath = join(import.meta.dir, "../public", filePath);
        const staticFile = await file(publicPath).text();
        
        return new Response(staticFile, {
            headers: { 
                "Content-Type": getContentType(filePath),
                "Cache-Control": "public, max-age=3600"
            }
        });
    } catch (error) {
        return new Response("Not Found", { status: 404 });
    }
}

function getContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon'
    };
    return contentTypes[ext || ''] || 'text/plain';
} 
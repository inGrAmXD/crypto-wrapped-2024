import { CryptoYearAnalyzer } from "../CryptoYearAnalyzer";
import { file } from "bun";
import { join } from "path";
import { ethers } from 'ethers';

const analyzer = new CryptoYearAnalyzer(process.env.API_KEY || "");

const NFT_CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS_OPTIMISM || '';
const NFT_ABI = [
    "function mint(address to, string memory tokenURI) public",
    "function hasMinted(address user) public view returns (bool)"
];

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

    // Nuevo endpoint para minteo
    if (path === '/api/mint' && req.method === 'POST') {
        try {
            const { address } = await req.json();

            if (!address) {
                return new Response(JSON.stringify({ error: "Dirección requerida" }), {
                    status: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }

            // Obtener los datos del año
            const stats = await analyzer.getYearInCryptoStats(address);

            // Preparar los datos del NFT
            const nftData = {
                contractAddress: process.env.CONTRACT_ADDRESS_OPTIMISM,
                abi: ["function mint(string memory tokenURI) public"],
                chainId: 11155420, // Optimism Sepolia
                metadata: {
                    name: `Crypto Year in Review 2024 - ${address.substring(0, 6)}`,
                    description: "Your Web3 journey of 2024",
                    image: "ipfs://...", // Aquí irá la imagen generada
                    attributes: [
                        {
                            trait_type: "Total Transactions",
                            value: stats.totalTransactions
                        },
                        {
                            trait_type: "Most Used Chain",
                            value: stats.mostUsedChain
                        },
                        {
                            trait_type: "Total Value Transferred",
                            value: stats.totalValueTransferred
                        }
                    ]
                }
            };

            return new Response(JSON.stringify(nftData), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({ 
                error: error instanceof Error ? error.message : "Error en el minteo" 
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

async function uploadToIPFS(metadata: any): Promise<string> {
    // Implementar lógica de subida a IPFS
    // Puedes usar servicios como Pinata o nft.storage
    return "ipfs://...";
} 
import { ethers } from 'ethers';
import { YearInCryptoStats } from '../types/CryptoTypes';
import { NFTGenerator, NFTAttributes } from '../NFTGenerator';

export class NFTService {
  private provider: ethers.providers.Provider;
  private nftGenerator: NFTGenerator;
  private contractABI: any; // Importar ABI del contrato
  
  constructor() {
    this.nftGenerator = new NFTGenerator();
    // Inicializar provider según la red
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }

  public async canMint(address: string): Promise<boolean> {
    const mintStartDate = new Date(process.env.MINT_START_DATE || '');
    const now = new Date();
    
    if (now < mintStartDate) return false;
    
    // Verificar si ya minteó
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS_OPTIMISM || '',
      this.contractABI,
      this.provider
    );
    
    return !(await contract.hasMinted(address));
  }

  public async generateNFTMetadata(stats: YearInCryptoStats): Promise<NFTAttributes> {
    return this.nftGenerator.generateNFTMetadata(stats);
  }

  public async mintNFT(address: string, stats: YearInCryptoStats): Promise<string> {
    const metadata = await this.generateNFTMetadata(stats);
    
    // Aquí iría la lógica para mintear el NFT
    // Necesitarías conectar con la wallet del usuario y llamar al contrato
    
    return "Transaction Hash"; // Retornar el hash de la transacción
  }
} 
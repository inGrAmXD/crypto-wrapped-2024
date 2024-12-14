import { YearInCryptoStats } from './types/CryptoTypes';
import { NFTArtGenerator } from './NFTArtGenerator';

export interface NFTAttributes {
  rarity: string;
  items: string[];
  achievements: string[];
  powerLevel: number;
}

export class NFTGenerator {
  private artGenerator: NFTArtGenerator;

  constructor() {
    this.artGenerator = new NFTArtGenerator();
  }

  private calculateRarity(stats: YearInCryptoStats): string {
    const totalValue = stats.totalValueTransferred;
    if (totalValue > 1000) return 'legendary';
    if (totalValue > 100) return 'rare';
    return 'common';
  }

  private calculateItems(stats: YearInCryptoStats): string[] {
    const items: string[] = [];
    
    // Añadir items basados en las cadenas utilizadas
    stats.chains.forEach(chain => {
      if (chain.numberOfTransactions > 0) {
        items.push(`${chain.chain}_badge`);
      }
      if (chain.valueTransferred > 100) {
        items.push(`${chain.chain}_crown`);
      }
    });

    // Items especiales basados en actividad
    if (stats.totalContractsUsed > 50) items.push('contract_master_cape');
    if (stats.totalTransactions > 1000) items.push('transaction_wizard_staff');

    return items;
  }

  private calculateAchievements(stats: YearInCryptoStats): string[] {
    const achievements: string[] = [];
    
    if (stats.totalTransactions > 500) {
      achievements.push('transaction_master');
    }
    if (stats.totalContractsUsed > 30) {
      achievements.push('contract_wizard');
    }
    // Más logros basados en diferentes métricas...

    return achievements;
  }

  public generateNFTMetadata(stats: YearInCryptoStats): NFTAttributes {
    return {
      rarity: this.calculateRarity(stats),
      items: this.calculateItems(stats),
      achievements: this.calculateAchievements(stats),
      powerLevel: Math.floor(stats.totalTransactions / 10)
    };
  }

  public generateNFTImage(attributes: NFTAttributes): string {
    return this.artGenerator.generateCharacterCSS(attributes);
  }

  public generateCompleteMetadata(stats: YearInCryptoStats): any {
    const attributes = this.generateNFTMetadata(stats);
    const image = this.generateNFTImage(attributes);

    return {
      name: `Year in Crypto 2024 #${stats.totalTransactions}`,
      description: `A unique NFT representing your crypto journey in 2024`,
      image: `data:image/svg+xml;base64,${Buffer.from(image).toString('base64')}`,
      attributes: [
        {
          trait_type: "Rarity",
          value: attributes.rarity
        },
        {
          trait_type: "Power Level",
          value: attributes.powerLevel
        },
        {
          trait_type: "Items",
          value: attributes.items.length
        },
        {
          trait_type: "Achievements",
          value: attributes.achievements.length
        }
      ]
    };
  }
} 
import { NFTAttributes } from './NFTGenerator';

export interface CharacterStyle {
  bodyColor: string;
  accessoryColor: string;
  weaponType: string;
  backgroundColor: string;
  specialEffects: string[];
}

export class NFTArtGenerator {
  private readonly RARITY_COLORS = {
    common: ['#6b7280', '#9ca3af', '#d1d5db'],
    rare: ['#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8'],
    legendary: ['#f59e0b', '#fbbf24', '#fcd34d', '#92400e']
  };

  private readonly CHAIN_COLORS = {
    ethereum: '#627EEA',
    arbitrum: '#28A0F0',
    optimism: '#FF0420',
    base: '#0052FF',
    zksync: '#8C8DFC',
    scroll: '#FDB82B'
  };

  public generateCharacterCSS(attributes: NFTAttributes): string {
    const colors = this.generateColorPalette(attributes.rarity);
    const hasStaff = attributes.items.includes('transaction_wizard_staff');
    const hasCape = attributes.items.includes('contract_master_cape');
    const chainBadges = attributes.items.filter(item => item.endsWith('_badge'));
    const chainCrowns = attributes.items.filter(item => item.endsWith('_crown'));

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100" height="100">
        <defs>
          <filter id="pixelate">
            <feFlood x="4" y="4" height="2" width="2"/>
          </filter>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <!-- Patrón para la textura de la capa -->
          <pattern id="capePattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="${colors[2]}"/>
            <rect width="2" height="2" fill="${colors[3] || colors[2]}"/>
          </pattern>
        </defs>

        <!-- Fondo con grid de píxeles -->
        <rect width="64" height="64" fill="#2a2a2a"/>
        <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" stroke="#333" stroke-width="0.5"/>
        </pattern>
        <rect width="64" height="64" fill="url(#grid)"/>

        ${hasCape ? `
        <!-- Capa pixelada con patrón -->
        <path d="M22 20 h20 l-2 30 h-16 l-2 -30" 
              fill="url(#capePattern)" 
              filter="url(#glow)"/>
        ` : ''}

        <!-- Cuerpo principal (estilo 8-bit mejorado) -->
        <g transform="translate(20,15)">
          <!-- Corona si tiene chainCrowns -->
          ${chainCrowns.length > 0 ? `
          <path d="M4 -4 h16 l2 4 l-20 0 z" 
                fill="${this.CHAIN_COLORS[chainCrowns[0].split('_')[0]]}"
                filter="url(#glow)"/>
          ` : ''}

          <!-- Cabeza con más detalles -->
          <rect x="6" y="0" width="12" height="12" fill="${colors[0]}"/>
          <!-- Ojos con animación para parpadeo -->
          <g class="eyes">
            <rect x="8" y="4" width="2" height="2" fill="black">
              <animate attributeName="height"
                       values="2;0;2"
                       dur="3s"
                       repeatCount="indefinite"/>
            </rect>
            <rect x="14" y="4" width="2" height="2" fill="black">
              <animate attributeName="height"
                       values="2;0;2"
                       dur="3s"
                       repeatCount="indefinite"/>
            </rect>
          </g>
          
          <!-- Torso con detalles -->
          <rect x="4" y="12" width="16" height="20" fill="${colors[1]}"/>
          <rect x="8" y="12" width="8" height="20" fill="${colors[2]}" opacity="0.3"/>
          
          <!-- Brazos con articulaciones -->
          <g class="left-arm">
            <rect x="0" y="12" width="4" height="8" fill="${colors[1]}"/>
            <rect x="0" y="20" width="4" height="8" fill="${colors[0]}">
              <animate attributeName="transform"
                       values="rotate(0 2 20);rotate(-10 2 20);rotate(0 2 20)"
                       dur="2s"
                       repeatCount="indefinite"/>
            </rect>
          </g>
          <g class="right-arm">
            <rect x="20" y="12" width="4" height="8" fill="${colors[1]}"/>
            <rect x="20" y="20" width="4" height="8" fill="${colors[0]}">
              <animate attributeName="transform"
                       values="rotate(0 22 20);rotate(10 22 20);rotate(0 22 20)"
                       dur="2s"
                       repeatCount="indefinite"/>
            </rect>
          </g>
          
          <!-- Piernas con animación de movimiento -->
          <g class="legs">
            <rect x="4" y="32" width="6" height="12" fill="${colors[1]}">
              <animate attributeName="transform"
                       values="rotate(0 7 32);rotate(-5 7 32);rotate(0 7 32)"
                       dur="1s"
                       repeatCount="indefinite"/>
            </rect>
            <rect x="14" y="32" width="6" height="12" fill="${colors[1]}">
              <animate attributeName="transform"
                       values="rotate(0 17 32);rotate(5 17 32);rotate(0 17 32)"
                       dur="1s"
                       repeatCount="indefinite"/>
            </rect>
          </g>

          <!-- Badges de chains en el pecho -->
          ${chainBadges.map((badge, index) => `
            <circle cx="${8 + index * 4}" cy="16" r="1.5" 
                    fill="${this.CHAIN_COLORS[badge.split('_')[0]]}"
                    filter="url(#glow)"/>
          `).join('')}
        </g>

        ${hasStaff ? `
        <!-- Bastón mágico mejorado -->
        <g transform="translate(44,10)">
          <rect x="0" y="0" width="4" height="40" fill="${colors[3] || '#92400e'}"/>
          <g filter="url(#glow)">
            <path d="M-3 -3 l10 0 l-5 5 z" fill="${colors[2]}">
              <animate attributeName="opacity"
                       values="0.5;1;0.5"
                       dur="2s"
                       repeatCount="indefinite"/>
              <animateTransform attributeName="transform"
                               type="rotate"
                               values="0 2 2;360 2 2"
                               dur="4s"
                               repeatCount="indefinite"/>
            </path>
          </g>
        </g>
        ` : ''}

        <!-- Efectos de logros mejorados -->
        ${attributes.achievements.includes('transaction_master') ? `
        <g transform="translate(50,5)">
          <path d="M0 0 l2 4 l2 -4 l-2 1 z" fill="#f59e0b">
            <animate attributeName="transform"
                     values="translate(0,0);translate(0,-2);translate(0,0)"
                     dur="1s"
                     repeatCount="indefinite"/>
          </path>
        </g>
        ` : ''}
        
        ${attributes.achievements.includes('contract_wizard') ? `
        <g transform="translate(10,10)" filter="url(#glow)">
          <path d="M0 0 l2 2 l2 -2 l-2 -2 z" fill="#f59e0b">
            <animate attributeName="transform"
                     values="scale(1);scale(1.5);scale(1)"
                     dur="1.5s"
                     repeatCount="indefinite"/>
            <animate attributeName="opacity"
                     values="0;1;0"
                     dur="1.5s"
                     repeatCount="indefinite"/>
          </path>
        </g>
        ` : ''}

        <!-- Aura según rareza -->
        ${attributes.rarity === 'legendary' ? `
        <circle cx="32" cy="32" r="30" 
                stroke="url(#capePattern)" 
                stroke-width="2" 
                fill="none" 
                opacity="0.3">
          <animate attributeName="stroke-width"
                   values="0;3;0"
                   dur="3s"
                   repeatCount="indefinite"/>
          <animateTransform attributeName="transform"
                           type="rotate"
                           values="0 32 32;360 32 32"
                           dur="10s"
                           repeatCount="indefinite"/>
        </circle>
        ` : ''}
      </svg>
    `;
  }

  private generateColorPalette(rarity: string): string[] {
    return this.RARITY_COLORS[rarity as keyof typeof this.RARITY_COLORS] || this.RARITY_COLORS.common;
  }
} 
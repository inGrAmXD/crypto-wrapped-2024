// Variables globales
let provider = null;
let signer = null;
let storyData = [];
let currentStory = 0;
let storyTimeout;
const STORY_DURATION = 5000; // 5 segundos por historia

// Agregar array de mensajes de carga
const loadingMessages = [
    "Analyzing your transactions...",
    "Calculating your trading volume...",
    "Finding your favorite chains...",
    "Preparing your crypto story...",
    "Almost ready..."
];

// Cache para los datos de usuario
let userStatsCache = null;

// Agregar al inicio del archivo
const VERSION = Date.now();

// Funciones de UI
function updateUIForConnectedWallet() {
    if (!walletConnector.userAddress) return;
    
    document.getElementById('walletAddress').textContent = 
        `${walletConnector.userAddress.substring(0, 6)}...${walletConnector.userAddress.substring(-4)}`;
    document.getElementById('connectWalletBtn').style.display = 'none';
    document.getElementById('disconnectWalletBtn').style.display = 'flex';
}

function updateUIForDisconnected() {
    document.getElementById('walletAddress').textContent = '';
    document.getElementById('connectWalletBtn').style.display = 'flex';
    document.getElementById('disconnectWalletBtn').style.display = 'none';
    document.getElementById('storiesContainer').style.display = 'none';
    document.getElementById('initialScreen').style.display = 'flex';
}

function showWalletModal() {
    const modal = document.getElementById('walletModal');
    modal.style.display = 'flex';
    modal.style.zIndex = '1000';
}

function hideWalletModal() {
    const modal = document.getElementById('walletModal');
    modal.style.display = 'none';
}

// Funciones de historias
async function loadUserData() {
    const stats = userStatsCache;

    storyData = [
        {
            type: 'welcome',
            title: "Welcome to Your Crypto Year in Review",
            subtitle: "Let's explore your Web3 journey of 2024"
        },
        {
            type: 'transactions',
            title: "Your Transaction Count",
            value: `${stats.totalTransactions}`,
            subtitle: `Including ${stats.totalContractsUsed} contract interactions and ${stats.chains[0].eoaInteractions} EOA interactions`
        },
        {
            type: 'chains',
            title: "Chain Activity",
            value: stats.mostUsedChain.toUpperCase(),
            subtitle: `Most active chain with ${stats.chains[0].numberOfTransactions} transactions`
        },
        {
            type: 'gas',
            title: "Gas Usage",
            value: `${formatNumber(stats.chains[0].gasUsed)}`,
            subtitle: "Total gas used across all transactions"
        },
        {
            type: 'value',
            title: "Value Transferred",
            value: `${stats.totalValueTransferred.toFixed(4)} ETH`,
            subtitle: `Across ${stats.chains.filter(c => c.numberOfTransactions > 0).length} different chains`
        },
        {
            type: 'summary',
            title: "That's a Wrap!",
            subtitle: "Mint your NFT to commemorate your crypto journey",
            mintButton: true
        }
    ];
}

function initializeProgressBar() {
    const progressBar = document.querySelector('.story-progress-bar');
    progressBar.innerHTML = storyData.map(() => 
        `<div class="progress-segment"><div class="progress-fill"></div></div>`
    ).join('');
}

function showStory(index) {
    if (index < 0 || index >= storyData.length) return;
    
    if (storyTimeout) {
        clearTimeout(storyTimeout);
    }
    
    currentStory = index;
    
    // Actualizar barra de progreso
    document.querySelectorAll('.progress-segment').forEach((segment, i) => {
        if (i < index) {
            segment.classList.add('active');
        } else if (i === index) {
            segment.classList.add('active');
            segment.querySelector('.progress-fill').style.animation = 'progressAnimation 5s linear';
        } else {
            segment.classList.remove('active');
        }
    });

    // Mostrar contenido de la historia
    const story = storyData[index];
    const storiesContent = document.querySelector('.stories-content');
    
    storiesContent.innerHTML = `
        <div class="story-content" style="animation: fadeInUp 0.5s ease-out">
            <h2>${story.title}</h2>
            ${story.value ? `<div class="stat-highlight">${story.value}</div>` : ''}
            <p>${story.subtitle}</p>
            ${story.mintButton ? `
                <div style="display: flex; justify-content: center; width: 100%;">
                    <button onclick="mintNFT()" class="mint-button">
                        Mint Your NFT
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    // Configurar temporizador para la siguiente historia
    if (index < storyData.length - 1) {
        storyTimeout = setTimeout(() => showStory(index + 1), STORY_DURATION);
    }
}

// Función para mostrar la pantalla de carga
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) {
        console.error('Loading screen element not found');
        return;
    }
    
    document.getElementById('initialScreen').style.display = 'none';
    document.getElementById('walletConnectedScreen').style.display = 'none';
    loadingScreen.style.display = 'flex';
    
    // Actualizar mensaje de carga
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.textContent = 'Analyzing your transactions...';
    }
}

// Función para actualizar mensajes de carga
async function updateLoadingMessages() {
    const loadingMessageElement = document.getElementById('loadingMessage');
    for (const message of loadingMessages) {
        loadingMessageElement.textContent = message;
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 segundos por mensaje
    }
}

// Modificar la función initializeStories
async function initializeStories(statsData) {
    if (!statsData) {
        console.error('No stats data available');
        return;
    }

    try {
        // Crear las historias basadas en los datos reales
        storyData = [
            {
                type: 'welcome',
                title: "Welcome to Your Crypto Year in Review",
                subtitle: `Let's explore your Web3 journey of 2024`
            },
            {
                type: 'transactions',
                title: "Your Transaction Activity",
                value: `${statsData.totalTransactions}`,
                subtitle: `${statsData.totalContractsUsed} contracts interacted with and ${statsData.chains[0].eoaInteractions} EOA interactions`
            },
            {
                type: 'chains',
                title: `${statsData.mostUsedChain.toUpperCase()} Champion`,
                value: `${formatNumber(statsData.chains[0].gasUsed)}`,
                subtitle: `Gas used on your favorite chain with ${statsData.chains[0].numberOfTransactions} transactions`
            },
            {
                type: 'value',
                title: "Total Value Moved",
                value: `${statsData.totalValueTransferred.toFixed(4)} ETH`,
                subtitle: `Active on ${statsData.chains.filter(c => c.numberOfTransactions > 0).length} different chains`
            },
            {
                type: 'dex',
                title: "DEX Activity",
                value: `$${formatNumber(statsData.dexStats.totalVolumeUSD)}`,
                subtitle: statsData.dexStats.topProjects.length > 0 ? 
                    `Most used: ${statsData.dexStats.topProjects[0]}` : 
                    "Ready to start your DEX journey"
            },
            {
                type: 'summary',
                title: "That's a Wrap!",
                subtitle: "Mint your NFT to commemorate your journey",
                mintButton: true
            }
        ];

        // Mostrar contenedor de historias
        const storiesContainer = document.getElementById('storiesContainer');
        storiesContainer.style.display = 'block';
        
        // Inicializar y mostrar historias
        initializeProgressBar();
        showStory(0);

    } catch (error) {
        console.error('Error initializing stories:', error);
        alert('Error loading your crypto journey. Please try again.');
    }
}

function navigateStory(direction) {
    const newIndex = currentStory + direction;
    if (newIndex >= 0 && newIndex < storyData.length) {
        showStory(newIndex);
    }
}

function shareResults() {
    alert('Share functionality coming soon!');
}

// Clase WalletConnector
class WalletConnector {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.currentWalletType = null;
    }

    async connectMetaMask() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // Forzar desconexión primero
            if (window.ethereum.selectedAddress) {
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                });
            }

            // Crear nuevo provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            
            // Forzar nuevo popup de conexión
            await this.provider.send("eth_requestAccounts", []);

            // Obtener nuevo signer
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            this.currentWalletType = 'metamask';

            return {
                address: this.userAddress,
                provider: this.provider,
                signer: this.signer
            };

        } catch (error) {
            console.error('MetaMask connection error:', error);
            throw error;
        }
    }

    async connectPhantom() {
        try {
            if (!window.solana || !window.solana.isPhantom) {
                throw new Error('Phantom is not installed');
            }

            // Forzar desconexión primero
            if (window.solana.isConnected) {
                await window.solana.disconnect();
                // Pequeña pausa para asegurar la desconexión
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Forzar nueva conexión
            const resp = await window.solana.connect({ onlyIfTrusted: false });
            this.userAddress = resp.publicKey.toString();
            this.currentWalletType = 'phantom';
            
            return {
                address: this.userAddress,
                publicKey: resp.publicKey
            };

        } catch (error) {
            console.error('Phantom connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.currentWalletType === 'metamask' && window.ethereum) {
                // Limpiar la caché de permisos de MetaMask
                try {
                    await window.ethereum.request({
                        method: "wallet_requestPermissions",
                        params: [{
                            eth_accounts: {}
                        }]
                    });
                } catch (e) {
                    console.log("MetaMask permission reset error:", e);
                }
                this.provider = null;
                this.signer = null;
            } else if (this.currentWalletType === 'phantom' && window.solana?.isConnected) {
                await window.solana.disconnect();
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.userAddress = null;
            this.currentWalletType = null;
            
            // Limpiar cualquier caché del navegador
            localStorage.removeItem('walletconnect');
            localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
            
        } catch (error) {
            console.error('Disconnect error:', error);
            throw error;
        }
    }
}

// Instancia global del WalletConnector
const walletConnector = new WalletConnector();

// Función mejorada para obtener estadísticas
async function fetchUserStats(address) {
    try {
        console.log('Fetching stats for address:', address);
        const response = await fetch('/api/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stats received:', data);
        userStatsCache = data;
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error; // Re-throw para manejar en el nivel superior
    }
}

// Función para limpiar cache al desconectar
async function forceCleanup() {
    userStatsCache = null; // Limpiar cache
    localStorage.clear();
    sessionStorage.clear();
    // ... resto del código de cleanup
}

// Función mejorada para mostrar la pantalla de wallet conectada
async function showWalletConnectedScreen(stats) {
    const walletConnectedScreen = document.getElementById('walletConnectedScreen');
    
    const content = `
        <div class="connected-content">
            <h2>Wallet Connected!</h2>
            <div class="wallet-info">Your wallet is ready</div>
            <button id="startWrappedBtn" class="start-wrapped-btn">
                VIEW MY CRYPTO WRAPPED
                <span class="btn-icon">→</span>
            </button>
            <button id="disconnectBtn" class="disconnect-btn">
                Disconnect
                <span class="btn-icon">←</span>
            </button>
        </div>
    `;

    walletConnectedScreen.innerHTML = content;
    walletConnectedScreen.style.display = 'flex';
    
    // Event listener para el botón de wrapped
    document.getElementById('startWrappedBtn').addEventListener('click', () => {
        walletConnectedScreen.style.display = 'none';
        initializeStories(stats);
    });

    // Event listener para el botón de desconectar
    document.getElementById('disconnectBtn').addEventListener('click', () => {
        window.location.reload();
    });
}

// Función auxiliar para capitalizar
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para formatear números
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Función para copiar dirección
function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        const copyBtn = document.querySelector('.copy-address');
        copyBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#1DB954" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
        setTimeout(() => {
            copyBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#1DB954" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
            `;
        }, 2000);
    });
}

// Modificar la función connectSpecificWallet
async function connectSpecificWallet(walletType) {
    try {
        hideWalletModal();
        showLoadingScreen();
        
        let address;
        if (walletType === 'metamask') {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            address = accounts[0];
        }

        if (!address) {
            throw new Error('No se pudo obtener la dirección');
        }

        console.log('Connected address:', address);

        // Obtener estadísticas
        const stats = await fetchUserStats(address);
        
        // Ocultar pantalla de carga
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('initialScreen').style.display = 'none';
        
        // Mostrar pantalla de wallet conectada
        await showWalletConnectedScreen(stats);

    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error: ' + error.message);
        document.getElementById('loadingScreen').style.display = 'none';
        updateUIForDisconnected();
    }
}

function setupWalletListeners() {
    if (walletConnector.currentWalletType === 'metamask' && window.ethereum) {
        window.ethereum.on('accountsChanged', async () => {
            await walletConnector.disconnect();
            updateUIForDisconnected();
        });

        window.ethereum.on('disconnect', async () => {
            await walletConnector.disconnect();
            updateUIForDisconnected();
        });
    }

    if (walletConnector.currentWalletType === 'phantom' && window.solana) {
        window.solana.on('disconnect', async () => {
            await walletConnector.disconnect();
            updateUIForDisconnected();
        });
    }
}

async function connectWallet() {
    await forceCleanup();
    await walletConnector.disconnect();
    showWalletModal();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Forzar limpieza al cargar la página
    await forceCleanup();
    await walletConnector.disconnect();
    updateUIForDisconnected();

    document.querySelectorAll('.wallet-option').forEach(button => {
        button.addEventListener('click', async () => {
            await connectSpecificWallet(button.dataset.wallet);
        });
    });

    document.querySelector('.close-modal').addEventListener('click', hideWalletModal);
    
    document.getElementById('walletModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            hideWalletModal();
        }
    });

    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('disconnectWalletBtn').addEventListener('click', async () => {
        await walletConnector.disconnect();
        updateUIForDisconnected();
    });

    // Botones de navegación de historias
    document.querySelector('.prev-btn').addEventListener('click', () => navigateStory(-1));
    document.querySelector('.next-btn').addEventListener('click', () => navigateStory(1));

    // Remover el event listener duplicado del DOMContentLoaded
    document.getElementById('startWrappedBtn').removeEventListener('click', async () => {
        // Este event listener ya no es necesario porque lo manejamos en showWalletConnectedScreen
    });
});

// Prevenir reconexión automática
window.addEventListener('load', () => {
    if (window.ethereum) {
        window.ethereum.autoRefreshOnNetworkChange = false;
    }
});

// Función para formatear números grandes
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Función para formatear valor en USD
function formatUSD(value) {
    if (value === 0) return '$0';
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(2);
}

// Función para mintear
async function mintNFT() {
    try {
        if (!window.ethereum) {
            throw new Error('Please install MetaMask');
        }

        const stats = userStatsCache;
        if (!stats) {
            throw new Error('No hay datos disponibles');
        }

        // Crear preview
        const previewModal = document.createElement('div');
        previewModal.className = 'nft-preview-modal';

        // Agregar estilos inline para asegurar que las variables CSS estén disponibles
        const styleVars = `
            <style>
                :root {
                    --primary-color: #4158D0;
                    --secondary-color: #C850C0;
                    --accent-color: #FFCC70;
                    --background-dark: #1a1a2e;
                }
            </style>
        `;

        previewModal.innerHTML = `
            ${styleVars}
            <div class="nft-preview-content">
                <div class="nft-card">
                    <div class="nft-image">
                        ${getAvatarSvg(stats)}
                    </div>
                    <div class="nft-info">
                        <h3>Tu NFT Year in Crypto 2024</h3>
                        <p>Este NFT representa tu actividad en Web3 durante 2024</p>
                        <div class="nft-stats">
                            <div class="stat">
                                <span class="label">Transacciones</span>
                                <span class="value">${stats.totalTransactions}</span>
                            </div>
                            <div class="stat">
                                <span class="label">Chain Favorita</span>
                                <span class="value">${stats.mostUsedChain}</span>
                            </div>
                            <div class="stat">
                                <span class="label">Valor Total</span>
                                <span class="value">${stats.totalValueTransferred.toFixed(4)} ETH</span>
                            </div>
                        </div>
                        <div class="mint-actions">
                            <button class="mint-button" onclick="confirmMint(this)">
                                Mint NFT
                            </button>
                            <button class="close-button" onclick="this.closest('.nft-preview-modal').remove()">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(previewModal);
        console.log('Modal agregado al DOM');

    } catch (error) {
        console.error('Error en mintNFT:', error);
        alert('Error: ' + error.message);
    }
}

function getAvatarSvg(stats) {
    // Determinar nivel y rareza basado en stats
    const level = Math.floor(stats.totalTransactions / 10);
    const rarity = stats.totalTransactions > 100 ? 'legendary' : 
                  stats.totalTransactions > 50 ? 'rare' : 'common';

    // Colores basados en rareza
    const colors = {
        legendary: ['#FFD700', '#FFA500', '#FF8C00'],
        rare: ['#4158D0', '#C850C0', '#FFCC70'],
        common: ['#3498db', '#2ecc71', '#9b59b6']
    };

    const [color1, color2, color3] = colors[rarity];

    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="300" height="300">
        <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${color1}"/>
                <stop offset="50%" style="stop-color:${color2}"/>
                <stop offset="100%" style="stop-color:${color3}"/>
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <!-- Añadir más efectos aquí -->
        </defs>

        <!-- Fondo con patrón -->
        <rect width="64" height="64" fill="var(--background-dark)"/>
        <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="none" stroke="${color1}" stroke-width="0.5" opacity="0.1"/>
        </pattern>
        <rect width="64" height="64" fill="url(#grid)"/>

        <!-- Personaje con más detalles -->
        <g transform="translate(20,10)">
            <!-- Aura de poder -->
            <circle cx="12" cy="20" r="22" 
                stroke="url(#bodyGradient)" 
                stroke-width="0.5"
                fill="none"
                opacity="0.3">
                <animate attributeName="r"
                    values="22;24;22"
                    dur="3s"
                        repeatCount="indefinite"/>
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 20"
                    to="360 12 20"
                    dur="10s"
                        repeatCount="indefinite"/>
            </circle>

            <!-- Cuerpo mejorado -->
            <g class="body">
                <rect x="6" y="0" width="12" height="12" fill="url(#bodyGradient)" rx="2"/>
                <rect x="4" y="12" width="16" height="20" fill="url(#bodyGradient)" rx="3"/>
            </g>

            <!-- Cara más expresiva -->
            <g class="face">
                <circle cx="9" cy="6" r="1.5" fill="#fff">
                        <animate attributeName="r"
                        values="1.5;1;1.5"
                        dur="3s"
                            repeatCount="indefinite"/>
                    </circle>
                <circle cx="15" cy="6" r="1.5" fill="#fff">
                    <animate attributeName="r"
                        values="1.5;1;1.5"
                        dur="3s"
                        repeatCount="indefinite"/>
                </circle>
                <path d="M9 8 Q12 11 15 8" 
                    stroke="#fff" 
                    fill="none"
                    stroke-width="0.5">
                    <animate attributeName="d"
                        values="M9 8 Q12 11 15 8;M9 8 Q12 12 15 8;M9 8 Q12 11 15 8"
                        dur="4s"
                        repeatCount="indefinite"/>
                </path>
            </g>

            <!-- Piernas mejoradas -->
            <g class="legs">
                <!-- Pierna izquierda -->
                <g>
                    <rect x="7" y="32" width="5" height="10" fill="url(#bodyGradient)" rx="2">
                        <animate attributeName="transform"
                            values="rotate(-5 9 32);rotate(5 9 32);rotate(-5 9 32)"
                            dur="2s"
                            repeatCount="indefinite"/>
                    </rect>
                    <!-- Pie izquierdo -->
                    <rect x="6" y="41" width="7" height="3" fill="url(#bodyGradient)" rx="1"/>
                </g>
                
                <!-- Pierna derecha -->
                <g>
                    <rect x="12" y="32" width="5" height="10" fill="url(#bodyGradient)" rx="2">
                        <animate attributeName="transform"
                            values="rotate(5 14 32);rotate(-5 14 32);rotate(5 14 32)"
                            dur="2s"
                            repeatCount="indefinite"/>
                    </rect>
                    <!-- Pie derecho -->
                    <rect x="11" y="41" width="7" height="3" fill="url(#bodyGradient)" rx="1"/>
                </g>
            </g>

            <!-- Nivel -->
            <text x="12" y="45" 
                fill="#fff" 
                text-anchor="middle" 
                font-size="4"
                filter="url(#glow)">
                Level ${level}
            </text>
        </g>
    </svg>
    `;
}

async function confirmMint(button) {
    try {
        button.disabled = true;
        button.textContent = 'Preparando minteo...';

        if (!window.ethereum) {
            throw new Error('Por favor instala MetaMask');
        }

        // Cambiar a Optimism Sepolia
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa37dc' }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa37dc',
                        chainName: 'Optimism Sepolia',
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://sepolia.optimism.io'],
                        blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
                    }]
                });
            }
        }

        // Esperar a que el cambio de red se complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reconectar provider después del cambio de red
        const provider = new ethers.providers.Web3Provider(window.ethereum, {
            name: 'Optimism Sepolia',
            chainId: 11155420
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Contrato NFT
        const contractAddress = '0x...'; // Dirección del contrato que desplegaremos
        const abi = [
            "function mint(string memory tokenURI) public",
            "function hasMinted(address user) public view returns (bool)"
        ];

        const contract = new ethers.Contract(contractAddress, abi, signer);

        // Generar metadata
        const metadata = {
            name: `Crypto Year in Review 2024`,
            description: "Your Web3 journey of 2024",
            image: getAvatarSvg(userStatsCache),
            attributes: [
                {
                    trait_type: "Total Transactions",
                    value: userStatsCache.totalTransactions
                },
                {
                    trait_type: "Most Used Chain",
                    value: userStatsCache.mostUsedChain
                },
                {
                    trait_type: "Total Value",
                    value: userStatsCache.totalValueTransferred
                }
            ]
        };

        // Mintear
        button.textContent = 'Confirma la transacción...';
        const tx = await contract.mint(JSON.stringify(metadata));
        button.textContent = 'Minteando...';
        await tx.wait();

        // Éxito
        button.className = 'mint-button success';
        button.textContent = '¡NFT Minteado con éxito!';

        // Mostrar link a OpenSea después de un minteo exitoso
        const linkContainer = document.createElement('div');
        linkContainer.innerHTML = `
            <a href="https://testnets.opensea.io/assets/optimism-sepolia/${contractAddress}/${tokenId}"
               target="_blank" 
               class="opensea-link">
                Ver en OpenSea
            </a>
        `;
        button.parentNode.appendChild(linkContainer);

    } catch (error) {
        console.error('Error:', error);
        button.className = 'mint-button error';
        button.textContent = 'Error: ' + error.message;
        button.disabled = false;
    }
}
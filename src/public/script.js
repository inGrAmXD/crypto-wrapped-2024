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
    // Aquí irían las llamadas reales a las APIs
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular tiempo de carga

    storyData = [
        {
            type: 'welcome',
            title: "Welcome to Your Crypto Year in Review",
            subtitle: "Let's explore your Web3 journey of 2023"
        },
        {
            type: 'transactions',
            title: "Your Transaction Count",
            value: "127",
            subtitle: "You're in the top 10% of active traders!"
        },
        {
            type: 'volume',
            title: "Total Trading Volume",
            value: "$43,291",
            subtitle: "Across zkSync and Optimism"
        },
        {
            type: 'favorite',
            title: "Your Favorite Chain",
            value: "zkSync Era",
            subtitle: "With 89 transactions"
        },
        {
            type: 'summary',
            title: "That's a Wrap!",
            subtitle: "Share your crypto journey with friends",
            shareButton: true
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
            ${story.shareButton ? `
                <button onclick="shareResults()" class="share-button">
                    Share Results
                </button>
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
    document.getElementById('walletConnectedScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';
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
                subtitle: "Let's explore your Web3 journey of 2023"
            },
            {
                type: 'transactions',
                title: "Your Transaction Count",
                value: formatNumber(statsData.totalTransactions),
                subtitle: `Across ${statsData.chains.filter(chain => chain.numberOfTransactions > 0).length} different chains`
            },
            {
                type: 'volume',
                title: "Total Value Transferred",
                value: formatUSD(statsData.totalValueTransferred),
                subtitle: `With ${formatNumber(statsData.totalContractsUsed)} different contracts`
            },
            {
                type: 'chain',
                title: "Your Most Active Chain",
                value: statsData.mostUsedChain.charAt(0).toUpperCase() + statsData.mostUsedChain.slice(1),
                subtitle: `With ${formatNumber(statsData.chains.find(c => c.chain === statsData.mostUsedChain)?.numberOfTransactions || 0)} transactions`
            },
            {
                type: 'summary',
                title: "That's a Wrap!",
                subtitle: "Share your crypto journey with friends",
                shareButton: true
            }
        ];

        // Ocultar todas las otras pantallas
        document.getElementById('initialScreen').style.display = 'none';
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('walletConnectedScreen').style.display = 'none';

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
    // Si ya tenemos los datos en cache, los retornamos
    if (userStatsCache) {
        return userStatsCache;
    }

    try {
        const response = await fetch('/api/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address })
        });

        if (!response.ok) {
            throw new Error('Error fetching user stats');
        }

        const data = await response.json();
        userStatsCache = data; // Guardamos en cache
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
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
            <div class="wallet-type">Connected to: METAMASK</div>
            <button id="startWrappedBtn" class="start-wrapped-btn">
                VIEW MY CRYPTO WRAPPED
                <span class="btn-icon">→</span>
            </button>
            <button id="disconnectBtn" class="disconnect-btn">
                Disconnect Wallet
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
        
        await forceCleanup();
        await walletConnector.disconnect();

        let connectionResult;
        
        if (walletType === 'metamask') {
            connectionResult = await walletConnector.connectMetaMask();
        } else if (walletType === 'phantom') {
            connectionResult = await walletConnector.connectPhantom();
        }

        if (connectionResult?.address) {
            // Obtener estadísticas
            const stats = await fetchUserStats(walletConnector.userAddress);
            
            // Ocultar pantalla de carga
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('initialScreen').style.display = 'none';
            
            // Mostrar pantalla de wallet conectada
            await showWalletConnectedScreen(stats);
        }

    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Error connecting wallet: ' + error.message);
        document.getElementById('loadingScreen').style.display = 'none';
        await forceCleanup();
        await walletConnector.disconnect();
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
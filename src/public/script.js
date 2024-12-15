let userAddress = null;
let currentStory = 0;
let storyData = [];
let storyTimeout;
let currentWalletType = null;

// Configuración de historias
const STORY_DURATION = 5000; // 5 segundos por historia

function showWalletModal() {
    const modal = document.getElementById('walletModal');
    modal.style.display = 'flex';
}

function hideWalletModal() {
    const modal = document.getElementById('walletModal');
    modal.style.display = 'none';
}

async function connectSpecificWallet(walletType) {
    hideWalletModal();

    try {
        // Primero desconectamos cualquier wallet existente
        await forceDisconnectAll();

        if (walletType === 'metamask') {
            if (typeof window.ethereum === 'undefined') {
                alert('Please install MetaMask!');
                return;
            }
            
            // Forzar nueva conexión de MetaMask
            const accounts = await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{
                    eth_accounts: {}
                }]
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts selected');
            }

            const selectedAccounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            userAddress = selectedAccounts[0];
            currentWalletType = 'metamask';

        } else if (walletType === 'phantom') {
            if (typeof window.solana === 'undefined') {
                alert('Please install Phantom!');
                return;
            }

            const { solana } = window;
            
            // Forzar desconexión de Phantom
            if (solana.isConnected) {
                await solana.disconnect();
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            try {
                const response = await solana.connect({ onlyIfTrusted: false });
                userAddress = response.publicKey.toString();
                currentWalletType = 'phantom';
            } catch (err) {
                console.error("Phantom connection error:", err);
                throw new Error('Failed to connect Phantom');
            }
        }

        if (userAddress) {
            updateUIForConnectedWallet();
            await initializeStories();
            setupWalletListeners();
        }

    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Error connecting wallet: ' + error.message);
        await forceDisconnectAll();
    }
}

async function forceDisconnectAll() {
    try {
        // Desconectar MetaMask
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                });
            } catch (e) {
                console.log("MetaMask disconnect error:", e);
            }
        }

        // Desconectar Phantom
        if (window.solana?.isConnected) {
            try {
                await window.solana.disconnect();
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (e) {
                console.log("Phantom disconnect error:", e);
            }
        }

        // Limpiar estado
        userAddress = null;
        currentWalletType = null;
        
        // Limpiar localStorage y sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Actualizar UI
        updateUIForDisconnected();

    } catch (error) {
        console.error('Force disconnect error:', error);
    }
}

function updateUIForDisconnected() {
    document.getElementById('walletAddress').textContent = '';
    document.getElementById('connectWalletBtn').style.display = 'flex';
    document.getElementById('disconnectWalletBtn').style.display = 'none';
    document.getElementById('storiesContainer').style.display = 'none';
    document.getElementById('initialScreen').style.display = 'flex';
}

function updateUIForConnectedWallet() {
    if (!userAddress) return;
    
    document.getElementById('walletAddress').textContent = 
        `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
    document.getElementById('connectWalletBtn').style.display = 'none';
    document.getElementById('disconnectWalletBtn').style.display = 'flex';
}

function setupWalletListeners() {
    // Limpiar listeners existentes
    if (window.ethereum) {
        window.ethereum.removeAllListeners?.();
    }
    
    if (currentWalletType === 'metamask' && window.ethereum) {
        window.ethereum.on('accountsChanged', async (accounts) => {
            if (!accounts || accounts.length === 0) {
                await forceDisconnectAll();
            }
        });

        window.ethereum.on('disconnect', async () => {
            await forceDisconnectAll();
        });
    }

    if (currentWalletType === 'phantom' && window.solana) {
        window.solana.on('disconnect', async () => {
            await forceDisconnectAll();
        });
    }
}

// Función principal de conexión
async function connectWallet() {
    if (userAddress) {
        await forceDisconnectAll();
    }
    showWalletModal();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Forzar desconexión al inicio
    await forceDisconnectAll();

    // Configurar listeners
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
    document.getElementById('disconnectWalletBtn').addEventListener('click', forceDisconnectAll);
});

// Funciones de historias
async function initializeStories() {
    // Simular carga de datos
    await loadUserData();
    
    // Ocultar pantalla inicial
    document.getElementById('initialScreen').style.display = 'none';
    
    // Mostrar contenedor de historias
    const storiesContainer = document.getElementById('storiesContainer');
    storiesContainer.style.display = 'block';
    
    // Inicializar barra de progreso
    initializeProgressBar();
    
    // Mostrar primera historia
    showStory(0);
}

async function loadUserData() {
    // Aquí cargaríamos los datos reales de las APIs
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
    
    clearTimeout(storyTimeout);
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

function navigateStory(direction) {
    const newIndex = currentStory + direction;
    if (newIndex >= 0 && newIndex < storyData.length) {
        showStory(newIndex);
    }
}

function shareResults() {
    // Implementar funcionalidad de compartir
    alert('Share functionality coming soon!');
}

// Prevenir reconexión automática
window.addEventListener('load', () => {
    if (window.ethereum) {
        window.ethereum.autoRefreshOnNetworkChange = false;
    }
});
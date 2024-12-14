// Verificar que las dependencias estén disponibles
if (typeof Web3Modal === 'undefined') {
    console.error('Web3Modal no está cargado correctamente');
}

if (typeof Web3 === 'undefined') {
    console.error('Web3 no está cargado correctamente');
}

if (typeof WalletConnectProvider === 'undefined') {
    console.error('WalletConnectProvider no está cargado correctamente');
}

// Matrix rain effect
function setupMatrix() {
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$€¥£¢₿ΞÐΣΦΨΩ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 15, 28, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Web3Modal setup
let web3;
let provider;
let userAddress = null;

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                1: "https://mainnet.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1",
                137: "https://polygon-mainnet.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1"
            }
        }
    }
};

const web3Modal = new window.Web3Modal.default({
    network: "mainnet",
    cacheProvider: false,
    providerOptions,
    theme: "dark"
});

async function connectWallet() {
    try {
        const connectButton = document.getElementById('connectWallet');
        const resultsDiv = document.getElementById('results');
        
        connectButton.innerHTML = '<span class="button-text">Connecting...</span>';
        
        provider = await web3Modal.connect();
        web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        userAddress = accounts[0];
        
        // Mostrar terminal con la dirección conectada y botón de desconexión
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="terminal-container">
                <button class="disconnect-button">Disconnect×</button>
                <div class="terminal-input">
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-text">ANALYZING BLOCKCHAIN DATA</span>
                </div>
            </div>
        `;
        
        connectButton.style.display = 'none';
        
        // Agregar evento de desconexión
        document.querySelector('.disconnect-button').addEventListener('click', disconnectWallet);
        
        await searchAddress(userAddress);

    } catch (error) {
        console.error("Connection error:", error);
        resetWalletState();
    }
}

function resetWalletState() {
    const connectButton = document.getElementById('connectWallet');
    const resultsDiv = document.getElementById('results');
    
    // Limpiar estado de la wallet
    userAddress = null;
    provider = null;
    web3 = null;
    
    // Limpiar localStorage
    localStorage.removeItem('walletconnect');
    localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
    
    // Restaurar UI
    connectButton.style.display = 'flex';
    connectButton.innerHTML = `
        <span class="button-text">Connect Wallet</span>
        <span class="button-icon">→</span>
    `;
    
    // Limpiar resultados
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
}

function disconnectWallet() {
    if (provider.close) {
        provider.close();
    }
    resetWalletState();
}

async function searchAddress(address = userAddress) {
    const resultsDiv = document.getElementById('results');
    
    if (!address) {
        alert('Please connect your wallet first');
        return;
    }

    try {
        // Mostrar terminal con estado de carga
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="terminal-container">
                <button class="disconnect-button">DISCONNECT×</button>
                <div class="terminal-input">
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-text">ANALYZING BLOCKCHAIN DATA</span>
                </div>
            </div>
        `;

        // Agregar evento de desconexión
        const disconnectBtn = document.querySelector('.disconnect-button');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', disconnectWallet);
        }
        
        const response = await fetch(`/stats/${address}`);
        
        if (!response.ok) {
            // Mantener el terminal visible con el botón de desconexión
            const terminalContent = document.querySelector('.terminal-input');
            if (terminalContent) {
                terminalContent.innerHTML = `
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-text error-text">NO DATA AVAILABLE</span>
                `;
            }
            return;
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error("SearchAddress error:", error);
        // Mantener el terminal visible con el botón de desconexión
        const terminalContent = document.querySelector('.terminal-input');
        if (terminalContent) {
            terminalContent.innerHTML = `
                <span class="terminal-prompt">$</span>
                <span class="terminal-text error-text">ERROR CONNECTING TO SERVER</span>
            `;
        }
    }
}

function closeError() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const walletInfo = document.getElementById('walletInfo');
    
    // Remover el mensaje de "analyzing"
    walletInfo.innerHTML = `Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
    
    let html = `
        <div class="summary-card">
            <h2>TOTAL SUMMARY</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <strong>TOTAL TRANSACTIONS</strong>
                    ${data.totalTransactions}
                </div>
                <div class="stat-item">
                    <strong>CONTRACTS USED</strong>
                    ${data.totalContractsUsed}
                </div>
                <div class="stat-item">
                    <strong>TOTAL VALUE TRANSFERRED</strong>
                    ${data.totalValueTransferred.toFixed(4)} ETH
                </div>
                <div class="stat-item">
                    <strong>MOST USED CHAIN</strong>
                    ${data.mostUsedChain}
                </div>
            </div>
        </div>
    `;
    
    data.chains.forEach(chain => {
        if (chain.numberOfTransactions > 0) {
            html += `
                <div class="chain-card">
                    <div class="chain-title">${chain.chain.toUpperCase()}</div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <strong>Transactions</strong>
                            ${chain.numberOfTransactions}
                        </div>
                        <div class="stat-item">
                            <strong>Contracts</strong>
                            ${chain.contractsUsed}
                        </div>
                        <div class="stat-item">
                            <strong>EOA Interactions</strong>
                            ${chain.eoaInteractions}
                        </div>
                        <div class="stat-item">
                            <strong>Value Transferred</strong>
                            ${chain.valueTransferred.toFixed(4)} ETH
                        </div>
                        <div class="stat-item">
                            <strong>Gas Used</strong>
                            ${chain.gasUsed}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    resultsDiv.innerHTML = html;
    
    // Mostrar resultados y overlay con animación
    resultsDiv.style.display = 'block';
    resultsDiv.classList.add('results-fade-in');

    // Agregar evento para cerrar
    document.querySelector('.close-results').addEventListener('click', () => {
        resultsDiv.style.display = 'none';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMatrix();
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);
}); 
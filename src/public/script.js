async function searchAddress() {
    const addressInput = document.getElementById('addressInput');
    const resultsDiv = document.getElementById('results');
    const address = addressInput.value.trim();

    if (!address) {
        alert('Por favor ingresa una dirección');
        return;
    }

    try {
        resultsDiv.innerHTML = 'Cargando...';
        const response = await fetch(`/stats/${address}`);
        const data = await response.json();

        if (response.ok) {
            displayResults(data);
            checkMintEligibility(address, data);
        } else {
            resultsDiv.innerHTML = `<p class="error">${data.error || 'Error al buscar la dirección'}</p>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = '<p class="error">Error al conectar con el servidor</p>';
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    
    let html = `
        <div class="dashboard-grid">
            <div class="card nft-preview">
                <h2>Tu NFT Preview</h2>
                <div id="nft-image"></div>
            </div>
            
            <div class="card">
                <h2>Resumen Total</h2>
                <div class="stats-highlight">${data.totalTransactions}</div>
                <p>Transacciones Totales</p>
                <div class="stats-highlight">${data.totalValueTransferred.toFixed(2)} ETH</div>
                <p>Valor Total Transferido</p>
            </div>

            <div class="card">
                <h2>Actividad DEX</h2>
                <div class="stats-highlight">$${data.dexStats?.totalVolumeUSD.toLocaleString()}</div>
                <p>Volumen Total</p>
                <div class="chain-badges">
                    ${data.dexStats?.topProjects.map(project => 
                        `<span class="chain-badge">${project}</span>`
                    ).join('')}
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-container">
                <canvas id="chainActivityChart"></canvas>
            </div>

            <div class="chart-container">
                <canvas id="volumeTimelineChart"></canvas>
            </div>
        </div>
    `;

    resultsDiv.innerHTML = html;
    
    loadNFTPreview(data);
    createChainActivityChart(data);
    createVolumeTimelineChart(data);
}

function createChainActivityChart(data) {
    const ctx = document.getElementById('chainActivityChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.chains.map(chain => chain.chain.toUpperCase()),
            datasets: [{
                label: 'Transacciones',
                data: data.chains.map(chain => chain.numberOfTransactions),
                backgroundColor: [
                    '#627eea', // ethereum
                    '#28a0f0', // arbitrum
                    '#ff0420', // optimism
                    '#0052ff', // base
                    '#fdb82b'  // scroll
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Actividad por Cadena',
                    color: '#e2e8f0'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#334155'
                    },
                    ticks: {
                        color: '#e2e8f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}

function createVolumeTimelineChart(data) {
    if (!data.dexStats) return;

    const ctx = document.getElementById('volumeTimelineChart');
    const chainVolumes = Object.entries(data.dexStats.chains).map(([chain, stats]) => ({
        chain,
        volume: stats.volumeUSD
    }));

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chainVolumes.map(cv => cv.chain.toUpperCase()),
            datasets: [{
                data: chainVolumes.map(cv => cv.volume),
                backgroundColor: [
                    '#627eea',
                    '#28a0f0',
                    '#ff0420',
                    '#0052ff',
                    '#fdb82b'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Volumen por Cadena',
                    color: '#e2e8f0'
                }
            }
        }
    });
}

async function checkMintEligibility(address, stats) {
    try {
        const response = await fetch(`/api/nft/eligibility/${address}`);
        const { canMint } = await response.json();
        
        if (canMint) {
            const mintButton = document.createElement('button');
            mintButton.innerHTML = 'Mint Your Year in Crypto NFT';
            mintButton.onclick = () => mintNFT(address, stats);
            document.getElementById('results').appendChild(mintButton);
        }
    } catch (error) {
        console.error('Error checking mint eligibility:', error);
    }
}

async function mintNFT(address, stats) {
    try {
        // Conectar con la wallet del usuario
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask!');
            return;
        }
        
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const response = await fetch('/api/nft/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, stats })
        });
        
        const { txHash } = await response.json();
        alert(`NFT minting started! Transaction: ${txHash}`);
    } catch (error) {
        alert('Error minting NFT: ' + error.message);
    }
}

async function loadNFTPreview(stats) {
    try {
        const response = await fetch(`/nft/preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stats })
        });
        
        console.log('Response status:', response.status);
        if (response.ok) {
            const svgData = await response.text();
            const nftImage = document.getElementById('nft-image');
            nftImage.innerHTML = '';
            nftImage.innerHTML = svgData;
            console.log('NFT container:', nftImage.innerHTML);
        }
    } catch (error) {
        console.error('Error loading NFT preview:', error);
    }
} 
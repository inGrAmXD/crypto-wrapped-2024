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
        <div class="summary-card">
            <h2>Resumen Total</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <strong>Transacciones Totales:</strong> ${data.totalTransactions}
                </div>
                <div class="stat-item">
                    <strong>Contratos Usados:</strong> ${data.totalContractsUsed}
                </div>
                <div class="stat-item">
                    <strong>Valor Total Transferido:</strong> ${data.totalValueTransferred.toFixed(4)} ETH
                </div>
                <div class="stat-item">
                    <strong>Cadena Más Usada:</strong> ${data.mostUsedChain}
                </div>
            </div>
        </div>
    `;

    html += '<h2>Actividad por Cadena</h2>';
    
    data.chains.forEach(chain => {
        if (chain.numberOfTransactions > 0) {
            html += `
                <div class="chain-card">
                    <div class="chain-title">${chain.chain.toUpperCase()}</div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <strong>Transacciones:</strong> ${chain.numberOfTransactions}
                        </div>
                        <div class="stat-item">
                            <strong>Contratos:</strong> ${chain.contractsUsed}
                        </div>
                        <div class="stat-item">
                            <strong>Interacciones EOA:</strong> ${chain.eoaInteractions}
                        </div>
                        <div class="stat-item">
                            <strong>Valor Transferido:</strong> ${chain.valueTransferred.toFixed(4)} ETH
                        </div>
                        <div class="stat-item">
                            <strong>Gas Usado:</strong> ${chain.gasUsed}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    resultsDiv.innerHTML = html;
} 
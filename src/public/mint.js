const CHAIN_ID = '0xaac5c9'; // 11155420 en hex (Optimism Sepolia)

async function switchToOptimismSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_ID }],
        });
    } catch (error) {
        if (error.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: CHAIN_ID,
                    chainName: 'Optimism Sepolia',
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://sepolia.optimism.io'],
                    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
                }]
            });
        } else {
            throw error;
        }
    }
}

async function mintNFT() {
    const statusDiv = document.getElementById('status');
    const mintButton = document.getElementById('mintButton');
    
    try {
        mintButton.disabled = true;
        statusDiv.className = 'status';
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Conectando wallet...';

        // Conectar wallet
        if (!window.ethereum) {
            throw new Error('Por favor instala MetaMask');
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        const address = accounts[0];

        // Cambiar a Optimism Sepolia
        statusDiv.textContent = 'Cambiando a Optimism Sepolia...';
        await switchToOptimismSepolia();

        // Obtener datos del año
        statusDiv.textContent = 'Obteniendo datos del año...';
        const statsResponse = await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        });

        if (!statsResponse.ok) throw new Error('Error obteniendo estadísticas');
        const stats = await statsResponse.json();

        // Preparar minteo
        statusDiv.textContent = 'Preparando NFT...';
        const mintResponse = await fetch('/api/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, stats })
        });

        if (!mintResponse.ok) throw new Error('Error preparando NFT');
        const { contractAddress, tokenURI, abi } = await mintResponse.json();

        // Mintear NFT
        statusDiv.textContent = 'Minteando NFT...';
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.mint(tokenURI);
        statusDiv.textContent = 'Esperando confirmación...';
        await tx.wait();

        // Éxito
        statusDiv.className = 'status success';
        statusDiv.textContent = '¡NFT minteado con éxito!';

    } catch (error) {
        console.error('Error:', error);
        statusDiv.className = 'status error';
        statusDiv.textContent = error.message;
    } finally {
        mintButton.disabled = false;
    }
}

document.getElementById('mintButton').addEventListener('click', mintNFT); 
// Web3 Configuration
const chains = [1, 5, 137, 10, 42161, 100, 1313161554, 56, 43114, 421613, 97, 80001, 11155111];
const defaultChain = 11155111; // Sepolia testnet

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletAddress = document.getElementById('walletAddress');
const addressText = document.getElementById('addressText');
const issueBtn = document.getElementById('issueBtn');
const verifyBtn = document.getElementById('verifyBtn');
const galleryBtn = document.getElementById('galleryBtn');

// State
let provider = null;
let signer = null;
let contract = null;
let isConnected = false;

// Contract ABI and Address
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "studentName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "degree",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "institution",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "graduationDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "name": "issueCertificate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getCertificate",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "studentName",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "degree",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "institution",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "graduationDate",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "ipfsHash",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "isValid",
                        "type": "bool"
                    }
                ],
                "internalType": "struct CertificateNFT.Certificate",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "verifyCertificate",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contractAddress = '0xF1427eA86669998fcE1175559420c57eF2B33431';

// Toast Notification Function
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return; // Exit if container doesn't exist

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Connect Wallet Function
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            throw new Error('Please install MetaMask to use this application');
        }

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Initialize contract
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Update UI
        if (connectWalletBtn) connectWalletBtn.classList.add('hidden');
        if (walletAddress) walletAddress.classList.remove('hidden');
        if (addressText) addressText.textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
        isConnected = true;
        
        // Enable buttons if they exist
        if (issueBtn) issueBtn.disabled = false;
        if (verifyBtn) verifyBtn.disabled = false;
        if (galleryBtn) galleryBtn.disabled = false;
        
        showToast('Wallet connected successfully!');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast(error.message || 'Failed to connect wallet', 'error');
    }
}

// Event Listeners
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWallet);
}

// Check if wallet is already connected
async function checkConnection() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    }
}

// Initialize
checkConnection();

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
            await connectWallet();
        } else {
            // Disconnect
            if (connectWalletBtn) connectWalletBtn.classList.remove('hidden');
            if (walletAddress) walletAddress.classList.add('hidden');
            isConnected = false;
            
            // Disable buttons if they exist
            if (issueBtn) issueBtn.disabled = true;
            if (verifyBtn) verifyBtn.disabled = true;
            if (galleryBtn) galleryBtn.disabled = true;
            
            showToast('Wallet disconnected');
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
} 
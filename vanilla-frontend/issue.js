// Web3 Configuration
const projectId = 'dccea15c2b56858134f8'; // From PINATA_API_KEY
const pinataSecretKey = '1f98eb7fdba5ff2fe0512c1b8dc1e1f72dd75af5758574da7159f95bf0f37190';
const chains = [1, 5, 137, 10, 42161, 100, 1313161554, 56, 43114, 421613, 97, 80001, 11155111];
const defaultChain = 11155111; // Sepolia testnet

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletAddress = document.getElementById('walletAddress');
const addressText = document.getElementById('addressText');
const certificateForm = document.getElementById('certificateForm');
const fileUpload = document.getElementById('fileUpload');
const certificateFile = document.getElementById('certificateFile');
const selectedFile = document.getElementById('selectedFile');
const submitBtn = document.querySelector('.submit-btn');
const issueBtn = document.getElementById('issueBtn');
const verifyBtn = document.getElementById('verifyBtn');
const galleryBtn = document.getElementById('galleryBtn');

// State
let provider = null;
let signer = null;
let contract = null;
let isConnected = false;
let selectedFileData = null;

// Contract ABI and Address
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
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
    }
];

const contractAddress = '0xF1427eA86669998fcE1175559420c57eF2B33431';

// Toast Notification Function
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

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
        
        // Enable submit button
        if (submitBtn) submitBtn.disabled = false;
        
        showToast('Wallet connected successfully!');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast(error.message || 'Failed to connect wallet', 'error');
    }
}

// File Upload Handling
fileUpload.addEventListener('click', () => certificateFile.click());

fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = '#3182ce';
});

fileUpload.addEventListener('dragleave', () => {
    fileUpload.style.borderColor = '#e2e8f0';
});

fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = '#e2e8f0';
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
});

certificateFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
});

function handleFileSelect(file) {
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showToast('File must be PDF or image (JPEG/PNG)', 'error');
        return;
    }
    
    selectedFileData = file;
    selectedFile.textContent = file.name;
    selectedFile.style.display = 'block';
}

// Form Submission
certificateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
        showToast('Please connect your wallet first', 'error');
        return;
    }
    
    if (!selectedFileData) {
        showToast('Please select a certificate file', 'error');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Create FormData and append file
        const formData = new FormData();
        formData.append('file', selectedFileData);
        
        // Upload file to IPFS using Pinata API
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': projectId,
                'pinata_secret_api_key': pinataSecretKey
            },
            body: formData
        });
        
        const data = await response.json();
        if (!data.IpfsHash) {
            throw new Error('Failed to upload to IPFS');
        }
        
        // Get form values
        const recipientAddress = document.getElementById('recipientAddress').value;
        const studentName = document.getElementById('studentName').value;
        const degree = document.getElementById('degree').value;
        const institution = document.getElementById('institution').value;
        const graduationDate = document.getElementById('graduationDate').value;
        
        // Issue certificate
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing Certificate...';
        
        const tx = await contract.issueCertificate(
            recipientAddress,
            studentName,
            degree,
            institution,
            graduationDate,
            data.IpfsHash
        );
        
        await tx.wait();
        
        showToast('Certificate issued successfully!');
        setTimeout(() => {
            window.location.href = 'gallery.html';
        }, 2000);
    } catch (error) {
        console.error('Error issuing certificate:', error);
        showToast(error.message || 'Failed to issue certificate', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-file-certificate"></i> Issue Certificate';
    }
});

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
            
            // Disable submit button
            if (submitBtn) submitBtn.disabled = true;
            
            showToast('Wallet disconnected');
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
} 
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
const galleryGrid = document.getElementById('galleryGrid');
const certificateModal = document.getElementById('certificateModal');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadingSpinner = document.getElementById('loadingSpinner');

// State
let provider = null;
let signer = null;
let contract = null;
let isConnected = false;
let certificates = [];
let isLoading = false; // Add loading flag

// Contract ABI and Address
const contractABI = [
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
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
        "name": "revokeCertificate",
        "outputs": [],
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
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
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
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
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
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "recipients",
                "type": "address[]"
            },
            {
                "internalType": "string[]",
                "name": "studentNames",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "degrees",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "institutions",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "graduationDates",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "ipfsHashes",
                "type": "string[]"
            }
        ],
        "name": "issueCertificatesBatch",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const contractAddress = '0xf6cd74A730F598977c0993F6b352664d8De2E740';

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
        console.log('Starting wallet connection...');
        
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            console.log('MetaMask not found');
            throw new Error('Please install MetaMask to use this application');
        }
        console.log('MetaMask found');

        // Request account access
        console.log('Requesting account access...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        console.log('Connected account:', account);

        // Initialize provider and signer
        console.log('Initializing provider and signer...');
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Initialize contract
        console.log('Initializing contract...');
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log('Contract initialized:', contract);
        
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
        
        // Load certificates
        console.log('Loading certificates...');
        await loadCertificates();
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast(error.message || 'Failed to connect wallet', 'error');
    }
}

// Load Certificates Function
async function loadCertificates() {
    try {
        // Prevent multiple simultaneous loads
        if (isLoading) {
            console.log('Certificate loading already in progress');
            return;
        }
        
        console.log('Starting loadCertificates function...');
        isLoading = true;
        
        if (!contract || !signer) {
            console.log('Contract or signer not initialized');
            throw new Error('Contract not initialized');
        }
        console.log('Contract and signer are initialized');

        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        
        // Get the connected address
        console.log('Getting connected address...');
        const address = await signer.getAddress();
        console.log('Connected address:', address);
        
        // Get balance of the address (how many tokens they own)
        console.log('Getting balance...');
        const balance = await contract.balanceOf(address);
        console.log('Address balance:', balance.toNumber());

        // Clear existing certificates
        certificates = [];
        
        // Try getting certificates by incrementing token IDs
        let tokenId = 1;
        let found = 0;
        const processedTokens = new Set(); // Track processed token IDs

        console.log('Starting to search for certificates...');
        // Keep looking until we find all tokens owned by this address
        while (found < Number(balance)) {
            try {
                // Skip if we've already processed this token
                if (processedTokens.has(tokenId)) {
                    tokenId++;
                    continue;
                }

                console.log(`Checking token ${tokenId}...`);
                // Check if this token exists and belongs to the current user
                const owner = await contract.ownerOf(tokenId);
                console.log(`Token ${tokenId} owner:`, owner);
                
                if (owner.toLowerCase() === address.toLowerCase()) {
                    console.log(`Found owned token ${tokenId}`);
                    // Get certificate details
                    const cert = await contract.getCertificate(tokenId);
                    console.log(`Certificate ${tokenId}:`, cert);
                    
                    // Get token URI
                    const tokenURI = await contract.tokenURI(tokenId);
                    console.log(`Token ${tokenId} URI:`, tokenURI);
                    
                    // Only add if not already processed
                    if (!processedTokens.has(tokenId)) {
                        certificates.push({
                            tokenId: tokenId,
                            studentName: cert[0],
                            degree: cert[1],
                            institution: cert[2],
                            graduationDate: cert[3],
                            ipfsHash: cert[4],
                            isValid: cert[5]
                        });
                        found++;
                        processedTokens.add(tokenId);
                        console.log(`Found ${found} certificates so far`);
                    }
                }
            } catch (error) {
                console.log(`Token ${tokenId} error:`, error.message);
            }
            tokenId++;

            // Safety check to prevent infinite loops
            if (tokenId > 1000) {
                console.log('Reached maximum token ID limit');
                break;
            }
        }

        console.log('Total certificates found:', certificates.length);
        console.log('Certificates:', certificates);
        
        // Display certificates
        displayCertificates();
    } catch (error) {
        console.error('Error loading certificates:', error);
        showToast('Failed to load certificates', 'error');
    } finally {
        isLoading = false;
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
}

// Display Certificates Function
function displayCertificates() {
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    if (certificates.length === 0) {
        galleryGrid.innerHTML = '<p class="no-certificates">No certificates found</p>';
        return;
    }
    
    certificates.forEach(async (cert) => {
        const card = document.createElement('div');
        card.className = 'certificate-card';
        card.dataset.type = cert.isValid ? 'valid' : 'invalid';
        
        // Generate verification URL
        const verificationUrl = `${window.location.origin}/verify.html?tokenId=${cert.tokenId}`;
        
        // Regular certificate display code
        card.innerHTML = `
            <div class="certificate-image">
                <img src="https://ipfs.io/ipfs/${cert.ipfsHash}" alt="Certificate">
            </div>
            <div class="certificate-info">
                <h3>${cert.studentName}</h3>
                <p>${cert.degree}</p>
                <p>${cert.institution}</p>
                <p>Graduated: ${cert.graduationDate}</p>
                <span class="status-badge ${cert.isValid ? 'status-valid' : 'status-invalid'}">
                    ${cert.isValid ? 'Valid' : 'Invalid'}
                </span>
                <button class="verify-btn" data-token-id="${cert.tokenId}">
                    Verify Certificate
                </button>
                ${await isOwner() ? `
                    <button class="revoke-btn" data-token-id="${cert.tokenId}" 
                            ${!cert.isValid ? 'disabled' : ''}>
                        ${cert.isValid ? 'Revoke Certificate' : 'Certificate Revoked'}
                    </button>
                ` : ''}
            </div>
        `;
        
        galleryGrid.appendChild(card);
        
        // Add verify button functionality
        const verifyBtn = card.querySelector('.verify-btn');
        verifyBtn.addEventListener('click', () => showCertificateDetails(cert));
        
        // Add revoke button functionality if owner
        if (await isOwner()) {
            const revokeBtn = card.querySelector('.revoke-btn');
            revokeBtn.addEventListener('click', async () => {
                try {
                    const tx = await contract.revokeCertificate(cert.tokenId);
                    await tx.wait();
                    showToast('Certificate revoked successfully');
                    // Refresh the display
                    loadCertificates();
                } catch (error) {
                    console.error('Error revoking certificate:', error);
                    showToast('Failed to revoke certificate', 'error');
                }
            });
        }
    });
}

// Show Certificate Details Function
function showCertificateDetails(certificate) {
    if (!certificateModal) return;
    
    const modalContent = certificateModal.querySelector('.modal-content');
    if (!modalContent) return;
    
    // Generate verification URL
    const verificationUrl = `${window.location.origin}/verify.html?tokenId=${certificate.tokenId}`;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Certificate Details</h2>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <div class="certificate-image">
                <img src="https://ipfs.io/ipfs/${certificate.ipfsHash}" alt="Certificate">
            </div>
            <div class="certificate-info">
                <h3>${certificate.studentName}</h3>
                <p><strong>Degree:</strong> ${certificate.degree}</p>
                <p><strong>Institution:</strong> ${certificate.institution}</p>
                <p><strong>Graduation Date:</strong> ${certificate.graduationDate}</p>
                <p><strong>Token ID:</strong> ${certificate.tokenId}</p>
                <span class="status-badge ${certificate.isValid ? 'status-valid' : 'status-invalid'}">
                    ${certificate.isValid ? 'Valid' : 'Invalid'}
                </span>
                <div class="qr-section">
                    <h4>Verification QR Code</h4>
                    <div id="qrCode"></div>
                    <p class="qr-info">Scan this QR code to verify the certificate</p>
                    <p class="verification-url">URL: ${verificationUrl}</p>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    certificateModal.style.display = 'flex';
    
    // Generate QR code after the modal content is added to the DOM
    setTimeout(() => {
        const qrElement = document.getElementById('qrCode');
        if (qrElement) {
            // Clear any existing QR code
            qrElement.innerHTML = '';
            
            try {
                new QRCode(qrElement, {
                    text: verificationUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                console.log('QR code generated successfully');
            } catch (error) {
                console.error('Error generating QR code:', error);
                qrElement.innerHTML = '<p style="color: red;">Error generating QR code</p>';
            }
        } else {
            console.error('QR code element not found');
        }
    }, 100);
    
    // Add close button functionality
    const closeBtn = modalContent.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            certificateModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    certificateModal.addEventListener('click', (e) => {
        if (e.target === certificateModal) {
            certificateModal.style.display = 'none';
        }
    });
}

// Filter Certificates Function
function filterCertificates(filter) {
    if (!galleryGrid) return;
    
    const cards = galleryGrid.querySelectorAll('.certificate-card');
    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else if (filter === 'valid') {
            card.style.display = card.dataset.type === 'valid' ? 'block' : 'none';
        } else if (filter === 'invalid') {
            card.style.display = card.dataset.type === 'invalid' ? 'block' : 'none';
        }
    });
}

// Event Listeners
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWallet);
}

if (filterButtons) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterCertificates(button.dataset.filter);
        });
    });
}

// Check if wallet is already connected
async function checkConnection() {
    console.log('Checking wallet connection...');
    if (window.ethereum) {
        try {
            console.log('MetaMask is available');
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('Current accounts:', accounts);
            if (accounts.length > 0) {
                console.log('Found connected account, connecting wallet...');
                await connectWallet();
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    } else {
        console.log('MetaMask is not available');
    }
}

// Initialize
console.log('Initializing application...');
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
            
            if (galleryGrid) galleryGrid.innerHTML = '';
            showToast('Wallet disconnected');
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// Add isOwner function
async function isOwner() {
    try {
        const ownerAddress = await contract.owner();
        const currentAddress = await signer.getAddress();
        return ownerAddress.toLowerCase() === currentAddress.toLowerCase();
    } catch (error) {
        console.error('Error checking owner:', error);
        return false;
    }
}

// Add CSS for the verify and QR code
const style = document.createElement('style');
style.textContent = `
    .verify-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        margin-right: 10px;
    }
    
    .revoke-btn {
        background-color: #ff4444;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .revoke-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .qr-section {
        margin-top: 20px;
        text-align: center;
        padding: 20px;
        background: #f7fafc;
        border-radius: 8px;
    }

    #qrCode {
        display: inline-block;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 15px 0;
    }

    .qr-info {
        margin-top: 10px;
        color: #4a5568;
        font-size: 0.9em;
    }

    .verification-url {
        margin-top: 10px;
        color: #2d3748;
        font-size: 0.8em;
        word-break: break-all;
    }
`;
document.head.appendChild(style); 
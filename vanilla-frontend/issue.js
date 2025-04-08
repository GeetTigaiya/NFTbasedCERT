// Web3 Configuration
const projectId = window.env.PINATA_API_KEY;
const pinataSecretKey = window.env.PINATA_SECRET_KEY;
const contractAddress = window.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
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
const batchModeToggle = document.getElementById('batchMode');
const singleCertificate = document.getElementById('singleCertificate');
const batchCertificates = document.getElementById('batchCertificates');
const certificateEntries = document.getElementById('certificateEntries');
const addEntryBtn = document.getElementById('addEntry');
const batchFile = document.getElementById('batchFile');
const certificateTemplate = document.getElementById('certificateTemplate');

// State
let provider = null;
let signer = null;
let contract = null;
let isConnected = false;
let selectedFileData = null;
let batchEntries = [];

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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const connectWalletBtn = document.getElementById('connectWallet');
    const walletAddress = document.getElementById('walletAddress');
    const addressText = document.getElementById('addressText');
    const certificateForm = document.getElementById('certificateForm');
    const fileUpload = document.getElementById('fileUpload');
    const certificateFile = document.getElementById('certificateFile');
    const selectedFile = document.getElementById('selectedFile');
    const submitBtn = document.getElementById('issueBtn');
    const batchModeToggle = document.getElementById('batchMode');
    const singleCertificate = document.getElementById('singleCertificate');
    const batchCertificates = document.getElementById('batchCertificates');
    const batchFile = document.getElementById('batchFile');
    const certificateTemplate = document.getElementById('certificateTemplate');

    // State
    let provider = null;
    let signer = null;
    let contract = null;
    let isConnected = false;
    let selectedFileData = null;

    // File Upload Handling
    if (fileUpload) {
        fileUpload.addEventListener('click', () => {
            if (certificateFile) certificateFile.click();
        });

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
    }

    if (certificateFile) {
        certificateFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleFileSelect(file);
        });
    }

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
        if (selectedFile) {
            selectedFile.textContent = file.name;
            selectedFile.style.display = 'block';
        }
    }

    // Batch File Upload Handling
    const batchFileUpload = document.getElementById('batchFileUpload');
    const templateFileUpload = document.getElementById('templateFileUpload');
    const selectedBatchFile = document.getElementById('selectedBatchFile');
    const selectedTemplateFile = document.getElementById('selectedTemplateFile');
    let selectedBatchFileData = null;
    let selectedTemplateFileData = null;

    if (batchFileUpload) {
        batchFileUpload.addEventListener('click', () => {
            if (batchFile) batchFile.click();
        });

        batchFileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            batchFileUpload.style.borderColor = '#3182ce';
        });

        batchFileUpload.addEventListener('dragleave', () => {
            batchFileUpload.style.borderColor = '#e2e8f0';
        });

        batchFileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            batchFileUpload.style.borderColor = '#e2e8f0';
            const file = e.dataTransfer.files[0];
            handleBatchFileSelect(file);
        });
    }

    if (batchFile) {
        batchFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleBatchFileSelect(file);
        });
    }

    if (templateFileUpload) {
        templateFileUpload.addEventListener('click', () => {
            if (certificateTemplate) certificateTemplate.click();
        });

        templateFileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            templateFileUpload.style.borderColor = '#3182ce';
        });

        templateFileUpload.addEventListener('dragleave', () => {
            templateFileUpload.style.borderColor = '#e2e8f0';
        });

        templateFileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            templateFileUpload.style.borderColor = '#e2e8f0';
            const file = e.dataTransfer.files[0];
            handleTemplateFileSelect(file);
        });
    }

    if (certificateTemplate) {
        certificateTemplate.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleTemplateFileSelect(file);
        });
    }

    function handleBatchFileSelect(file) {
        if (!file) return;
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        // Check file type
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            showToast('File must be a CSV file', 'error');
            return;
        }
        
        selectedBatchFileData = file;
        if (selectedBatchFile) {
            selectedBatchFile.textContent = file.name;
            selectedBatchFile.style.display = 'block';
        }
    }

    function handleTemplateFileSelect(file) {
        if (!file) return;
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showToast('File must be an image (JPEG/PNG)', 'error');
            return;
        }
        
        selectedTemplateFileData = file;
        if (selectedTemplateFile) {
            selectedTemplateFile.textContent = file.name;
            selectedTemplateFile.style.display = 'block';
        }
    }

    // Batch Mode Toggle
    if (batchModeToggle) {
        batchModeToggle.addEventListener('change', () => {
            const isBatchMode = batchModeToggle.checked;
            if (singleCertificate) singleCertificate.style.display = isBatchMode ? 'none' : 'block';
            if (batchCertificates) batchCertificates.style.display = isBatchMode ? 'block' : 'none';
            
            // If switching to batch mode and no entries exist, add the first one
            if (isBatchMode && certificateEntries && certificateEntries.children.length === 0) {
                addNewCertificateEntry();
            }
        });
    }

    // Add Certificate Entry
    if (addEntryBtn) {
        addEntryBtn.addEventListener('click', () => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'certificate-entry';
            entryDiv.innerHTML = `
                <div class="form-group">
                    <label>Recipient's Wallet Address</label>
                    <input type="text" class="recipient-address" required placeholder="0x...">
                </div>

                <div class="form-group">
                    <label>Student Name</label>
                    <input type="text" class="student-name" required>
                </div>

                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" class="degree" required>
                </div>

                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" class="institution" required>
                </div>

                <div class="form-group">
                    <label>Graduation Date</label>
                    <input type="date" class="graduation-date" required>
                </div>

                <div class="form-group">
                    <label>Certificate Document</label>
                    <div class="file-upload entry-file-upload">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag and drop your certificate file here or click to browse</p>
                        <input type="file" class="certificate-file" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                        <div class="selected-file"></div>
                    </div>
                </div>
                <button type="button" class="remove-entry-btn">
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
            
            certificateEntries.appendChild(entryDiv);
            
            // Add file upload handling for the new entry
            const fileUpload = entryDiv.querySelector('.entry-file-upload');
            const fileInput = entryDiv.querySelector('.certificate-file');
            const selectedFile = entryDiv.querySelector('.selected-file');
            
            fileUpload.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    selectedFile.textContent = file.name;
                    selectedFile.style.display = 'block';
                }
            });
            
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
                if (file) {
                    fileInput.files = e.dataTransfer.files;
                    selectedFile.textContent = file.name;
                    selectedFile.style.display = 'block';
                }
            });
            
            // Add remove button handling
            const removeBtn = entryDiv.querySelector('.remove-entry-btn');
            removeBtn.addEventListener('click', () => entryDiv.remove());
        });
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
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-file-certificate"></i> Issue Certificate(s)';
            }
            
            showToast('Wallet connected successfully!');
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showToast(error.message || 'Failed to connect wallet', 'error');
        }
    }

    // Form Submission
    if (certificateForm) {
        certificateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!isConnected) {
                showToast('Please connect your wallet first', 'error');
                return;
            }
            
            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                }
                
                if (batchModeToggle && batchModeToggle.checked) {
                    // Batch processing
                    const entries = document.querySelectorAll('.certificate-entry');
                    if (entries.length === 0) {
                        throw new Error('Please add at least one certificate entry');
                    }

                    const recipients = [];
                    const studentNames = [];
                    const degrees = [];
                    const institutions = [];
                    const graduationDates = [];
                    const ipfsHashes = [];

                    // Show progress toast
                    showToast('Processing certificates...', 'info');

                    for (const entry of entries) {
                        const recipientAddress = entry.querySelector('.recipient-address').value;
                        const studentName = entry.querySelector('.student-name').value;
                        const degree = entry.querySelector('.degree').value;
                        const institution = entry.querySelector('.institution').value;
                        const graduationDate = entry.querySelector('.graduation-date').value;
                        const fileInput = entry.querySelector('.certificate-file');

                        if (!fileInput.files[0]) {
                            throw new Error(`Please upload a certificate file for ${studentName}`);
                        }

                        // Update progress
                        showToast(`Processing certificate for ${studentName}...`, 'info');

                        const formData = new FormData();
                        formData.append('file', fileInput.files[0]);

                        // Upload certificate file to IPFS
                        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                            method: 'POST',
                            headers: {
                                'pinata_api_key': window.env.PINATA_API_KEY,
                                'pinata_secret_api_key': window.env.PINATA_SECRET_KEY
                            },
                            body: formData
                        });

                        const data = await response.json();
                        if (!data.IpfsHash) {
                            throw new Error(`Failed to upload certificate for ${studentName}`);
                        }

                        const ipfsHash = data.IpfsHash;

                        // Create metadata JSON
                        const metadata = {
                            name: `${studentName}'s Certificate`,
                            description: `Certificate of ${degree} from ${institution}`,
                            image: `ipfs://${ipfsHash}`,
                            external_url: `https://ipfs.io/ipfs/${ipfsHash}`,
                            animation_url: `ipfs://${ipfsHash}`,
                            background_color: "ffffff",
                            attributes: [
                                {
                                    trait_type: "Student Name",
                                    value: studentName
                                },
                                {
                                    trait_type: "Degree",
                                    value: degree
                                },
                                {
                                    trait_type: "Institution",
                                    value: institution
                                },
                                {
                                    trait_type: "Graduation Date",
                                    value: graduationDate
                                },
                                {
                                    trait_type: "Batch Issued",
                                    value: "true"
                                }
                            ],
                            properties: {
                                files: [
                                    {
                                        uri: `ipfs://${ipfsHash}`,
                                        type: "application/pdf"
                                    }
                                ],
                                category: "image",
                                creators: [
                                    {
                                        address: recipientAddress,
                                        share: 100
                                    }
                                ]
                            }
                        };

                        // Upload metadata to IPFS
                        const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'pinata_api_key': projectId,
                                'pinata_secret_api_key': pinataSecretKey
                            },
                            body: JSON.stringify(metadata)
                        });

                        if (!metadataResponse.ok) {
                            throw new Error(`Failed to upload metadata for ${studentName}`);
                        }

                        const metadataData = await metadataResponse.json();
                        if (!metadataData.IpfsHash) {
                            throw new Error(`Failed to upload metadata for ${studentName}`);
                        }

                        const metadataHash = metadataData.IpfsHash;

                        recipients.push(recipientAddress);
                        studentNames.push(studentName);
                        degrees.push(degree);
                        institutions.push(institution);
                        graduationDates.push(graduationDate);
                        ipfsHashes.push(metadataHash);
                    }

                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing Certificates...';
                    }

                    // Issue all certificates in one transaction
                    const tx = await contract.issueCertificatesBatch(
                        recipients,
                        studentNames,
                        degrees,
                        institutions,
                        graduationDates,
                        ipfsHashes
                    );

                    await tx.wait();
                    showToast('All certificates issued successfully!');
                } else {
                    // Single certificate processing
                    const recipientAddress = document.getElementById('recipientAddress').value;
                    const studentName = document.getElementById('studentName').value;
                    const degree = document.getElementById('degree').value;
                    const institution = document.getElementById('institution').value;
                    const graduationDate = document.getElementById('graduationDate').value;
                    const fileInput = document.getElementById('certificateFile');

                    if (!fileInput.files[0]) {
                        throw new Error('Please upload a certificate file');
                    }

                    const formData = new FormData();
                    formData.append('file', fileInput.files[0]);

                    // Upload certificate file to IPFS
                    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                        method: 'POST',
                        headers: {
                            'pinata_api_key': window.env.PINATA_API_KEY,
                            'pinata_secret_api_key': window.env.PINATA_SECRET_KEY
                        },
                        body: formData
                    });

                    const data = await response.json();
                    if (!data.IpfsHash) {
                        throw new Error('Failed to upload certificate');
                    }

                    const ipfsHash = data.IpfsHash;

                    // Create metadata JSON
                    const metadata = {
                        name: `${studentName}'s Certificate`,
                        description: `Certificate of ${degree} from ${institution}`,
                        image: `ipfs://${ipfsHash}`,
                        external_url: `https://ipfs.io/ipfs/${ipfsHash}`,
                        animation_url: `ipfs://${ipfsHash}`,
                        background_color: "ffffff",
                        attributes: [
                            {
                                trait_type: "Student Name",
                                value: studentName
                            },
                            {
                                trait_type: "Degree",
                                value: degree
                            },
                            {
                                trait_type: "Institution",
                                value: institution
                            },
                            {
                                trait_type: "Graduation Date",
                                value: graduationDate
                            }
                        ],
                        properties: {
                            files: [
                                {
                                    uri: `ipfs://${ipfsHash}`,
                                    type: "application/pdf"
                                }
                            ],
                            category: "image",
                            creators: [
                                {
                                    address: recipientAddress,
                                    share: 100
                                }
                            ]
                        }
                    };

                    // Upload metadata to IPFS
                    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'pinata_api_key': projectId,
                            'pinata_secret_api_key': pinataSecretKey
                        },
                        body: JSON.stringify(metadata)
                    });

                    if (!metadataResponse.ok) {
                        throw new Error('Failed to upload metadata');
                    }

                    const metadataData = await metadataResponse.json();
                    if (!metadataData.IpfsHash) {
                        throw new Error('Failed to upload metadata');
                    }

                    const metadataHash = metadataData.IpfsHash;

                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing Certificate...';
                    }

                    // Issue certificate
                    const tx = await contract.issueCertificate(
                        recipientAddress,
                        studentName,
                        degree,
                        institution,
                        graduationDate,
                        metadataHash
                    );

                    await tx.wait();
                    showToast('Certificate issued successfully!');
                }
                
                setTimeout(() => {
                    window.location.href = 'gallery.html';
                }, 2000);
            } catch (error) {
                console.error('Error issuing certificate(s):', error);
                showToast(error.message || 'Failed to issue certificate(s)', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-file-certificate"></i> Issue Certificate(s)';
                }
            }
        });
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
                
                // Disable submit button
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-file-certificate"></i> Issue Certificate(s)';
                }
                
                showToast('Wallet disconnected');
            }
        });

        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }

    // Add new certificate entry
    function addNewCertificateEntry() {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'certificate-entry';
        entryDiv.innerHTML = `
            <button type="button" class="remove-entry-btn">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-group">
                <label>Recipient's Wallet Address</label>
                <input type="text" class="recipient-address" required placeholder="0x...">
            </div>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" class="student-name" required>
            </div>
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="degree" required>
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="institution" required>
            </div>
            <div class="form-group">
                <label>Graduation Date</label>
                <input type="date" class="graduation-date" required>
            </div>
            <div class="form-group">
                <label>Certificate Document</label>
                <div class="file-upload entry-file-upload">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop your certificate file here or click to browse</p>
                    <input type="file" class="certificate-file" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <div class="selected-file"></div>
                </div>
            </div>
        `;
        
        if (certificateEntries) {
            certificateEntries.appendChild(entryDiv);
        }
        
        // Add file upload handling for the new entry
        const fileUpload = entryDiv.querySelector('.entry-file-upload');
        const fileInput = entryDiv.querySelector('.certificate-file');
        const selectedFile = entryDiv.querySelector('.selected-file');
        
        if (fileUpload && fileInput && selectedFile) {
            fileUpload.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    selectedFile.textContent = file.name;
                    selectedFile.style.display = 'block';
                }
            });
            
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
                if (file) {
                    fileInput.files = e.dataTransfer.files;
                    selectedFile.textContent = file.name;
                    selectedFile.style.display = 'block';
                }
            });
        }
        
        // Add remove button handling
        const removeBtn = entryDiv.querySelector('.remove-entry-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => entryDiv.remove());
        }
    }
}); 
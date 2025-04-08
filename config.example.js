// Example configuration file - Replace with your actual keys
const config = {
    PINATA_API_KEY: 'your_pinata_api_key_here',
    PINATA_SECRET_KEY: 'your_pinata_secret_key_here',
    NEXT_PUBLIC_CONTRACT_ADDRESS: 'your_contract_address_here',
    BASE_URL: window.location.pathname.includes('/NFTbasedCERT/') ? '/NFTbasedCERT/' : '/'
};

// Make config available globally
window.env = config; 
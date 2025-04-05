# NFT-Based Certification System

A decentralized platform for issuing and verifying academic certificates as NFTs on the Ethereum blockchain.

## Features

- Issue digital certificates as NFTs
- Instant verification of certificate authenticity
- Beautiful NFT gallery with pagination
- IPFS integration for storing certificate documents
- MetaMask wallet integration with chain validation
- Mobile-responsive design
- Certificate revocation system
- Owner-only administrative functions

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Blockchain**: Ethereum (Goerli Testnet)
- **Smart Contracts**: Solidity, OpenZeppelin
- **Storage**: IPFS (Pinata)
- **Wallet Integration**: MetaMask, ethers.js

## Prerequisites

- Node.js (v14 or higher)
- MetaMask wallet
- Goerli testnet ETH (for deployment and testing)
- Pinata account (for IPFS storage)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd nft-certification-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GOERLI_URL=your_goerli_rpc_url
PRIVATE_KEY=your_wallet_private_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

4. Deploy the smart contract:
```bash
npx hardhat run scripts/deploy.ts --network goerli
```

5. Update the contract address in `src/config/contract.ts` with the deployed address.

6. Start the development server:
```bash
npm run dev
```

## Usage

1. **Issuing Certificates**:
   - Connect your MetaMask wallet (must be contract owner)
   - Ensure you're connected to Goerli testnet
   - Navigate to the "Issue Certificate" page
   - Fill in the student details
   - Upload the certificate document (PDF or image)
   - Review and confirm the transaction

2. **Verifying Certificates**:
   - Use the verification portal
   - Enter the token ID or wallet address
   - View the certificate details, verification status, and linked document

3. **Viewing Certificates**:
   - Connect your wallet to view your certificates
   - Browse through the paginated NFT gallery
   - Click on certificates to view details
   - Contract owner can revoke certificates if needed

## Testing

Run the test suite:
```bash
npm test
```

To seed demo certificates:
```bash
npx hardhat run scripts/seed.ts --network goerli
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
# NFT Certificate System - Vanilla Frontend

A modern, responsive frontend for the NFT Certificate System built with vanilla HTML, CSS, and JavaScript. This frontend provides a user-friendly interface for issuing, verifying, and viewing blockchain-based certificates.

## Features

- **Wallet Integration**: Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
- **Certificate Issuance**: Issue new certificates with student details and document upload
- **Certificate Verification**: Verify the authenticity of any certificate using its token ID
- **Certificate Gallery**: View all issued certificates with filtering options
- **IPFS Integration**: Store certificate documents on IPFS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean and intuitive interface with smooth animations

## Prerequisites

- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Node.js and npm (for local development)
- Access to the smart contract deployed on the blockchain

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd vanilla-frontend
```

2. Install dependencies (if using a local development server):
```bash
npm install -g http-server
```

3. Start the development server:
```bash
http-server
```

4. Open your browser and navigate to:
```
http://localhost:8080
```

## Project Structure

```
vanilla-frontend/
├── index.html          # Home page
├── issue.html          # Certificate issuance page
├── verify.html         # Certificate verification page
├── gallery.html        # Certificate gallery page
├── styles.css          # Shared styles
├── index.js           # Home page functionality
├── issue.js           # Certificate issuance functionality
├── verify.js          # Certificate verification functionality
└── gallery.js         # Gallery functionality
```

## Smart Contract Integration

The frontend interacts with the following smart contract functions:

- `issueCertificate`: Issue a new certificate
- `verifyCertificate`: Verify a certificate's authenticity
- `getCertificate`: Get certificate details by token ID
- `getAllCertificates`: Get all certificates

## Environment Variables

The following environment variables are required:

- `PINATA_API_KEY`: Your Pinata API key for IPFS integration
- `CONTRACT_ADDRESS`: The deployed smart contract address

## Browser Support

The frontend is compatible with modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Web3 APIs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ethers.js](https://docs.ethers.org/) for Web3 integration
- [Web3Modal](https://web3modal.com/) for wallet connection
- [IPFS](https://ipfs.tech/) for decentralized storage
- [Font Awesome](https://fontawesome.com/) for icons
- [Inter](https://fonts.google.com/specimen/Inter) for typography 
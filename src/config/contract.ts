import { ethers } from 'ethers';
import CertificateNFT from '../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CONTRACT_ABI = CertificateNFT.abi;

export const getContract = (signer: ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_URL);
}; 
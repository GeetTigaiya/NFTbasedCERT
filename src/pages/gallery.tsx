import { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import NFTGallery from '../components/NFTGallery';
import { Toaster } from 'react-hot-toast';

export default function Gallery() {
  const [address, setAddress] = useState('');

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        console.log('MetaMask found');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Accounts:', accounts);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          console.log('Setting address to:', accounts[0]);
        }
      } else {
        console.log('MetaMask not found');
      }
    };

    checkWallet();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Certificate Gallery</h1>
        {address ? (
          <>
            <p>Connected Address: {address}</p>
            <NFTGallery address={address} />
          </>
        ) : (
          <div>Please connect your wallet</div>
        )}
      </div>
    </div>
  );
} 
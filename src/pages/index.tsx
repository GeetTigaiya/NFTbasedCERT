import { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/react';
import { Web3Provider } from '@ethersproject/providers';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { getContract } from '../config/contract';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const { open } = useWeb3Modal();

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress('');
          setIsConnected(false);
        }
      });

      // Handle chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      await open();
      const provider = new Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAddress(address);
      setIsConnected(true);

      // Initialize contract
      const contract = getContract(signer);
      await contract.owner(); // Test contract connection
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">NFT Certificates</h1>
          </div>
          <div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="text-sm text-gray-600">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Issue and Verify Digital Certificates
          </h2>
          <p className="text-xl text-gray-600">
            Secure, verifiable, and tamper-proof academic credentials on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/issue">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Certificate</h3>
              <p className="text-gray-600 mb-4">
                Create and mint NFT certificates for your students
              </p>
              <div className="text-blue-600 hover:text-blue-700 font-medium">
                Start Issuing →
              </div>
            </div>
          </Link>

          <Link href="/verify">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verify Certificate</h3>
              <p className="text-gray-600 mb-4">
                Instantly verify the authenticity of any certificate
              </p>
              <div className="text-blue-600 hover:text-blue-700 font-medium">
                Verify Now →
              </div>
            </div>
          </Link>

          <Link href="/gallery">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">View Gallery</h3>
              <p className="text-gray-600 mb-4">
                Browse through issued certificates
              </p>
              <div className="text-blue-600 hover:text-blue-700 font-medium">
                View Gallery →
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 
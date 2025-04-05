import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import toast from 'react-hot-toast';
import { getContract } from '../config/contract';

interface Certificate {
  tokenId: number;
  studentName: string;
  degree: string;
  institution: string;
  graduationDate: string;
  ipfsHash: string;
}

interface NFTGalleryProps {
  address: string;
}

export default function NFTGallery({ address }: NFTGalleryProps) {
  const [contract, setContract] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCertificates = async (contractInstance: any, walletAddress: string) => {
    try {
      // Get balance of the address (how many tokens they own)
      const balance = await contractInstance.balanceOf(walletAddress);
      console.log('Address balance:', balance);

      const certificates = [];
      // Try getting certificates by incrementing token IDs
      let tokenId = 1;
      let found = 0;

      // Keep looking until we find all tokens owned by this address
      while (found < Number(balance)) {
        try {
          // Check if this token belongs to the current user
          const owner = await contractInstance.ownerOf(tokenId);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            // Get certificate details
            const cert = await contractInstance.getCertificate(tokenId);
            console.log(`Certificate ${tokenId}:`, cert);
            
            certificates.push({
              tokenId: tokenId,
              studentName: cert[0],
              degree: cert[1],
              institution: cert[2],
              graduationDate: cert[3],
              ipfsHash: cert[4]
            });
            found++;
          }
        } catch (error) {
          // If token doesn't exist or other error, continue to next ID
          console.log(`Token ${tokenId} not found or other error`);
        }
        tokenId++;

        // Safety check to prevent infinite loops
        if (tokenId > 1000) break; // Adjust this number based on your expected maximum tokens
      }

      setCertificates(certificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initContract = async () => {
      try {
        if (!window.ethereum) {
          toast.error('Please install MetaMask');
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = getContract(signer);
        setContract(contractInstance);
        await loadCertificates(contractInstance, address);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setLoading(false);
      }
    };

    if (address) {
      initContract();
    }
  }, [address]);

  const viewCertificate = (ipfsHash: string) => {
    window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-4">Loading certificates...</div>;
  }

  if (!certificates.length) {
    return (
      <div className="text-center py-4">
        <h3 className="text-lg font-medium">No Certificates Found</h3>
        <p className="text-gray-600">You haven't received any certificates yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {certificates.map((cert) => (
        <div key={cert.tokenId} className="border rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Certificate #{cert.tokenId}</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Student:</span> {cert.studentName}</p>
            <p><span className="font-medium">Degree:</span> {cert.degree}</p>
            <p><span className="font-medium">Institution:</span> {cert.institution}</p>
            <p><span className="font-medium">Graduation Date:</span> {cert.graduationDate}</p>
            <p className="truncate"><span className="font-medium">IPFS Hash:</span> {cert.ipfsHash}</p>
          </div>
          <button 
            onClick={() => viewCertificate(cert.ipfsHash)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            View Certificate
          </button>
        </div>
      ))}
    </div>
  );
} 
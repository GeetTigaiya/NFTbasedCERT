import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getContract } from '../config/contract';
import { BrowserProvider } from 'ethers';

interface Certificate {
  tokenId: number;
  studentName: string;
  degree: string;
  institution: string;
  graduationDate: string;
  ipfsHash: string;
  isValid: boolean;
}

export default function VerificationPortal() {
  const [searchInput, setSearchInput] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = getContract(signer);
        setContract(contractInstance);
      }
    };
    initContract();
  }, []);

  const handleSearch = async (input: string) => {
    try {
      if (!contract) {
        toast.error('Please connect your wallet first');
        return;
      }

      // Clear previous results
      setCertificate(null);

      const certificate = await contract.getCertificate(input);
      
      // Log the response to debug
      console.log('Raw certificate data:', certificate);

      // In ethers v6, the response might be an array instead of an object
      // We need to destructure it properly based on your contract's return order
      const [studentName, degree, institution, graduationDate, ipfsHash] = certificate;

      setCertificate({
        studentName,
        degree,
        institution,
        graduationDate,
        ipfsHash,
        isValid: true,
        tokenId: parseInt(input)
      });

    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      
      // Check if it's the "Certificate does not exist" error
      if (error.reason === "Certificate does not exist") {
        toast.error('Certificate does not exist');
      } else {
        toast.error('Error verifying certificate');
      }

      setCertificate(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Certificate</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchInput); }} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter token ID or wallet address"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      {certificate && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Certificate Details</h3>
            <div className={`flex items-center ${certificate.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {certificate.isValid ? (
                <>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Invalid
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p><span className="font-medium">Token ID:</span> {certificate.tokenId}</p>
            <p><span className="font-medium">Student Name:</span> {certificate.studentName}</p>
            <p><span className="font-medium">Degree:</span> {certificate.degree}</p>
            <p><span className="font-medium">Institution:</span> {certificate.institution}</p>
            <p><span className="font-medium">Graduation Date:</span> {certificate.graduationDate}</p>
            <p><span className="font-medium">IPFS Hash:</span> {certificate.ipfsHash}</p>
          </div>
        </div>
      )}
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { BrowserProvider } from 'ethers';
import toast from 'react-hot-toast';
import { getContract } from '../config/contract';
import type { Contract } from '@ethersproject/contracts';

interface CertificateFormProps {
  address: string;
}

export default function CertificateForm({ address }: CertificateFormProps) {
  const [step, setStep] = useState(1);
  const [isOwner, setIsOwner] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    studentName: '',
    degree: '',
    institution: '',
    graduationDate: '',
    recipientAddress: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      try {
        // Check if we're on the correct network (Sepolia)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') { // Sepolia chainId
          toast.error('Please switch to Sepolia network');
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
            });
          } catch (switchError: any) {
            // Handle chain switch error
            if (switchError.code === 4902) {
              toast.error('Sepolia network not found. Please add it to MetaMask');
            }
            return;
          }
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = getContract(signer);
        
        // Test contract connection
        const owner = await contractInstance.owner();
        setIsOwner(owner === address);
        setContract(contractInstance);
        
        toast.success('Connected successfully!');
      } catch (error: any) {
        console.error('Connection error:', error);
        if (error.code === 4001) {
          toast.error('Please accept the connection request in MetaMask');
        } else if (error.message?.includes('contract')) {
          toast.error('Error connecting to smart contract. Please check if you are on Sepolia network');
        } else {
          toast.error('Failed to connect: ' + (error.message || 'Unknown error'));
        }
      }
    };

    if (address) {
      initContract();
    }
  }, [address]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateChain = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia chainId
        toast.error('Please switch to Sepolia testnet');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
          });
        } catch (error: any) {
          if (error.code === 4902) {
            toast.error('Sepolia network not found. Please add it to MetaMask');
          }
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !contract) {
      toast.error('Please upload a certificate file and ensure wallet is connected');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Preparing transaction...');

    try {
      console.log('Starting certificate issuance process...');
      
      // Convert file to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      console.log('File converted to base64, uploading to IPFS...');

      // Upload certificate file to IPFS via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      const ipfsHash = data.ipfsHash;
      console.log('Certificate file uploaded to IPFS, hash:', ipfsHash);

      // Create metadata JSON
      const metadata = {
        name: `${formData.studentName}'s Certificate`,
        description: `Certificate of ${formData.degree} from ${formData.institution}`,
        image: `ipfs://${ipfsHash}`,
        attributes: [
          {
            trait_type: "Student Name",
            value: formData.studentName
          },
          {
            trait_type: "Degree",
            value: formData.degree
          },
          {
            trait_type: "Institution",
            value: formData.institution
          },
          {
            trait_type: "Graduation Date",
            value: formData.graduationDate
          }
        ]
      };

      // Upload metadata to IPFS
      const metadataResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: JSON.stringify(metadata),
          fileName: 'metadata.json'
        }),
      });

      const metadataData = await metadataResponse.json();
      if (!metadataResponse.ok) {
        throw new Error(metadataData.error || 'Failed to upload metadata');
      }

      const metadataHash = metadataData.ipfsHash;
      console.log('Metadata uploaded to IPFS, hash:', metadataHash);

      // Update toast message
      toast.loading('Initiating transaction...', { id: toastId });

      // Issue certificate with metadata hash
      console.log('Sending transaction to blockchain...');
      const tx = await contract.issueCertificate(
        formData.recipientAddress,
        formData.studentName,
        formData.degree,
        formData.institution,
        formData.graduationDate,
        metadataHash // Use metadata hash instead of certificate file hash
      );

      console.log('Transaction sent, hash:', tx.hash);
      
      // Show success message with transaction hash
      toast.success(
        `Transaction sent! Please save your transaction hash: ${tx.hash}`,
        { duration: 10000 } // Show for 10 seconds
      );

      // Reset form
      setFormData({
        studentName: '',
        degree: '',
        institution: '',
        graduationDate: '',
        recipientAddress: ''
      });
      setFile(null);
      setStep(1);

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to issue certificate',
        { id: toastId }
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Only contract owner can issue certificates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Details</span>
          <span>Upload</span>
          <span>Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Graduation Date</label>
              <input
                type="date"
                name="graduationDate"
                value={formData.graduationDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                pattern="\d{4}-\d{2}-\d{2}"
                title="Please use YYYY-MM-DD format"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
              <input
                type="text"
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0x..."
                required
                pattern="0x[a-fA-F0-9]{40}"
                title="Please enter a valid Ethereum address"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-sm text-gray-600">{file.name}</p>
              ) : (
                <p className="text-sm text-gray-600">
                  Drag and drop your certificate file here, or click to select
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Review Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Student:</span> {formData.studentName}</p>
                <p><span className="font-medium">Degree:</span> {formData.degree}</p>
                <p><span className="font-medium">Institution:</span> {formData.institution}</p>
                <p><span className="font-medium">Graduation Date:</span> {formData.graduationDate}</p>
                <p><span className="font-medium">Recipient:</span> {formData.recipientAddress}</p>
                <p><span className="font-medium">File:</span> {file?.name}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Issuing...' : 'Issue Certificate'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 
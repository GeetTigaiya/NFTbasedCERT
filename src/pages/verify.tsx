import { useState } from 'react';
import VerificationPortal from '../components/VerificationPortal';
import { Toaster } from 'react-hot-toast';

export default function VerifyCertificate() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Verify Certificate</h1>
        <VerificationPortal />
      </div>
    </div>
  );
} 
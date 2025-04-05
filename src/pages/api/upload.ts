import { NextApiRequest, NextApiResponse } from 'next';
import pinataSDK from '@pinata/sdk';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Check if environment variables are loaded
  console.log('API Key exists:', !!process.env.PINATA_API_KEY);
  console.log('Secret Key exists:', !!process.env.PINATA_SECRET_KEY);

  try {
    const pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_SECRET_KEY
    );

    // Test authentication and log the result
    try {
      const authResult = await pinata.testAuthentication();
      console.log('Pinata auth result:', authResult);
    } catch (authError) {
      console.error('Pinata auth error:', authError);
      return res.status(401).json({ 
        error: 'Pinata authentication failed',
        details: authError.message 
      });
    }

    const { fileData, fileName } = req.body;
    
    // Debug: Check if we received the file data
    console.log('File name received:', fileName);
    console.log('File data length:', fileData?.length);
    
    // Remove the data URL prefix
    const base64Data = fileData.replace(/^data:.*?;base64,/, '');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a stream from the buffer
    const stream = require('stream');
    const readableStream = new stream.Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const result = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: {
        name: fileName
      }
    });

    res.status(200).json({ ipfsHash: result.IpfsHash });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.reason === 'INVALID_API_KEYS') {
      return res.status(401).json({ 
        error: 'Invalid Pinata API keys. Please check your environment variables.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload to IPFS',
      details: error.message 
    });
  }
}
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/upload', async (req, res) => {
    try {
        const { metadata } = req.body;
        
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
});

module.exports = router; 
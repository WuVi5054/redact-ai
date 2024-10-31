// src/api/azureBlobAPI.js
import axios from 'axios';

const AZURE_BLOB_ENDPOINT = 'https://your-blob-storage-endpoint.com';
const AZURE_BLOB_KEY = 'your-blob-storage-key';

export const uploadToBlob = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${AZURE_BLOB_ENDPOINT}/upload`, formData, {
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Authorization': `Bearer ${AZURE_BLOB_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to Blob:', error);
    return null;
  }
};

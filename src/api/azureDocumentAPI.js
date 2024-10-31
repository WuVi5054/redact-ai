// src/api/azureDocumentAPI.js
import axios from 'axios';

const AZURE_OCR_ENDPOINT = 'https://your-azure-ocr-endpoint.com';
const AZURE_API_KEY = 'your-azure-api-key';

// export const processDocument = async (file) => {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await axios.post(`${AZURE_OCR_ENDPOINT}/process`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         'Ocp-Apim-Subscription-Key': AZURE_API_KEY,
//       },
//     });

//     return {
//       original: response.data.originalUrl,
//       sanitized: response.data.sanitizedUrl,
//       stats: response.data.stats,
//     };
//   } catch (error) {
//     console.error('Error processing document:', error);
//     return null;
//   }
// };

// Mock function to simulate document processing response
export const processDocument = async (file) => {
    try {
      // Simulate an asynchronous API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
  
      // Mock response data
      return {
        original: 'https://example.com/original-document.pdf',  // Placeholder URL
        sanitized: 'https://example.com/sanitized-document.pdf', // Placeholder URL
        stats: {
          Names: 5,
          Addresses: 3,
          CreditCards: 2,
        },
      };
    } catch (error) {
      console.error('Error processing document:', error);
      return null;
    }
  };

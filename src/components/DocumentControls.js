// src/components/DocumentControls.js
import React from 'react';
import axios from 'axios';

const DocumentControls = ({ sanitizedDoc }) => {
  const handleDownload = async () => {
    if (sanitizedDoc) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/download/${sanitizedDoc}`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitizedDoc}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const handleUploadToBlob = async () => {
    if (sanitizedDoc) {
      try {
        await axios.post(`http://127.0.0.1:8000/upload-to-blob/?filename=${sanitizedDoc}`);
        alert('Successfully uploaded to Azure Blob Storage');
      } catch (error) {
        console.error('Error uploading to blob storage:', error);
        alert('Failed to upload to Azure Blob Storage');
      }
    }
  };

  return (
    <div className="document-controls">
      <button onClick={handleDownload} disabled={!sanitizedDoc}>
        Download
      </button>
      <button onClick={handleUploadToBlob} disabled={!sanitizedDoc} className="upload-blob-btn">
        Upload to Cloud
      </button>
    </div>
  );
};
// const DocumentControls = ({ sanitizedDoc }) => (
//   <div className="document-controls">
//     <button 
//       onClick={() => window.open(sanitizedDoc, '_blank')}
//       disabled={!sanitizedDoc}
//     >
//       Download Sanitized Document
//     </button>
//   </div>
// );

export default DocumentControls;

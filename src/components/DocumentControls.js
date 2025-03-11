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

  return (
    <div className="document-controls">
      <button onClick={handleDownload} disabled={!sanitizedDoc}>
        Download Current Document
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

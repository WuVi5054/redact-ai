// src/components/DocumentControls.js
import React from 'react';
const DocumentControls = ({ sanitizedDoc }) => {
  const handleDownload = () => {
    if (sanitizedDoc) {
      const sanitizedDocUrl = `http://127.0.0.1:8000/download/${sanitizedDoc}`;

      const sanitizedDocLink = document.createElement('a');
      sanitizedDocLink.href = sanitizedDocUrl;
      sanitizedDocLink.download = `sanitized_${sanitizedDoc}`;
      sanitizedDocLink.click();

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

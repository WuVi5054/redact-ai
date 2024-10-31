// src/components/DocumentControls.js
import React from 'react';

const DocumentControls = ({ sanitizedDoc }) => (
  <div className="document-controls">
    <button 
      onClick={() => window.open(sanitizedDoc, '_blank')}
      disabled={!sanitizedDoc}
    >
      Download Sanitized Document
    </button>
  </div>
);

export default DocumentControls;

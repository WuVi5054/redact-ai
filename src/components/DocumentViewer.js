// src/components/DocumentViewer.js
import React from 'react';

const DocumentViewer = ({ originalDoc, sanitizedDoc }) => (
  <div className="document-viewer">
    <div className="document-section">
      <h2>Original Document</h2>
      <iframe src={originalDoc} title="Original Document" className="document-frame" />
    </div>
    <div className="document-section">
      <h2>Sanitized Document</h2>
      <iframe src={sanitizedDoc} title="Sanitized Document" className="document-frame" />
    </div>
  </div>
);

export default DocumentViewer;
